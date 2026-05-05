# Notification System Design

## Stage 1

### Core Actions
- List notifications with paging and filters.
- Fetch unread count.
- Mark a notification as read.
- Mark all notifications as read.
- Subscribe to real-time updates.

### REST API Contract

Base path: `/api/v1`

Common headers:
- `Authorization: Bearer <token>`
- `Content-Type: application/json`
- `Accept: application/json`

Notification object:
```json
{
	"id": "uuid",
	"studentId": "string",
	"type": "Event | Result | Placement",
	"message": "string",
	"createdAt": "2026-04-22T17:50:30Z",
	"isRead": false,
	"priority": 0
}
```

#### 1) List notifications
`GET /notifications?limit=20&page=1&type=Event&unreadOnly=false`

Response:
```json
{
	"items": [
		{
			"id": "uuid",
			"studentId": "S123",
			"type": "Event",
			"message": "Tech fest",
			"createdAt": "2026-04-22T17:50:30Z",
			"isRead": false,
			"priority": 10
		}
	],
	"page": 1,
	"limit": 20,
	"total": 150,
	"hasNext": true
}
```

#### 2) Get unread count
`GET /notifications/unread-count`

Response:
```json
{
	"count": 42
}
```

#### 3) Mark one notification as read
`PATCH /notifications/{id}/read`

Response:
```json
{
	"id": "uuid",
	"isRead": true,
	"readAt": "2026-04-22T18:02:11Z"
}
```

#### 4) Mark all notifications as read
`POST /notifications/read-all`

Response:
```json
{
	"updated": 150,
	"readAt": "2026-04-22T18:02:11Z"
}
```

#### 5) Real-time stream (SSE)
`GET /notifications/stream`

Events (Server-Sent Events):
```
event: notification.new
data: {"id":"uuid","type":"Placement","message":"CSX hiring","createdAt":"2026-04-22T17:50:30Z"}

event: notification.read
data: {"id":"uuid","isRead":true}
```

Notes:
- Use SSE for one-way updates; fallback to polling `GET /notifications` every 30-60 seconds.
- For guaranteed delivery, store a cursor and allow `Last-Event-ID` to resume.

## Stage 2

### Suggested Storage
PostgreSQL for strong consistency, mature indexing, and relational modeling of notifications and recipients.

### Schema (core)
```sql
CREATE TABLE students (
	id BIGSERIAL PRIMARY KEY,
	roll_no VARCHAR(32) UNIQUE NOT NULL,
	email VARCHAR(255) UNIQUE NOT NULL,
	name VARCHAR(255) NOT NULL,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TYPE notification_type AS ENUM ('Event', 'Result', 'Placement');

CREATE TABLE notifications (
	id UUID PRIMARY KEY,
	type notification_type NOT NULL,
	message TEXT NOT NULL,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	priority INT NOT NULL DEFAULT 0
);

CREATE TABLE notification_recipients (
	notification_id UUID NOT NULL REFERENCES notifications(id),
	student_id BIGINT NOT NULL REFERENCES students(id),
	is_read BOOLEAN NOT NULL DEFAULT FALSE,
	read_at TIMESTAMPTZ,
	delivered_at TIMESTAMPTZ,
	PRIMARY KEY (notification_id, student_id)
);

CREATE INDEX idx_recipients_student_read_time
	ON notification_recipients (student_id, is_read, delivered_at DESC);

CREATE INDEX idx_notifications_type_time
	ON notifications (type, created_at DESC);
```

### Scaling Considerations
- Growth in recipients makes notification_recipients large; add time-based partitioning on delivered_at.
- Store unread count in a separate table or cache to avoid expensive aggregates.
- Use async fan-out for mass notifications and write in batches.

### Query Examples
- List notifications for a student:
```sql
SELECT n.id, n.type, n.message, n.created_at, r.is_read
FROM notification_recipients r
JOIN notifications n ON n.id = r.notification_id
WHERE r.student_id = $1
ORDER BY n.created_at DESC
LIMIT $2 OFFSET $3;
```

## Stage 3

### Query Review
Given query:
```sql
SELECT * FROM notifications
WHERE studentID = 1042 AND isRead = false
ORDER BY createdAt ASC;
```

Issues:
- If `notifications` stores all students, this is a large table scan without a composite index.
- Sorting by createdAt adds a full sort cost for all matching rows.

Fix:
- Use a composite index matching the filter and order: `(student_id, is_read, created_at)`.
- Prefer a LIMIT to avoid large result sets on every page load.

Likely cost change:
- Without index: $O(N)$ scan + sort.
- With index: $O(log N + k)$ where $k$ is returned rows.

Indexing every column:
- Not safe. It increases write latency, storage, and can hurt planner choices.

Placement notifications in last 7 days:
```sql
SELECT DISTINCT r.student_id
FROM notification_recipients r
JOIN notifications n ON n.id = r.notification_id
WHERE n.type = 'Placement'
	AND n.created_at >= NOW() - INTERVAL '7 days';
```

## Stage 4

### Performance Improvements
- Cache unread count per student (Redis or materialized table) with write-through updates.
- Use pagination + cursor-based fetching to avoid deep OFFSET scans.
- Push updates via SSE/WebSocket so the UI does not poll on every load.
- Precompute a read model for recent notifications and store in a fast store.

Tradeoffs:
- Caching improves latency but adds complexity in invalidation.
- Push channels reduce load but require connection management.
- Precomputation speeds reads but increases write path complexity.

## Stage 5

### Problems in the given pseudocode
- Sequential loop is slow for 50,000 students.
- No retry strategy for failed email sends.
- No idempotency, so retries can double-send.
- DB writes and email sends are tightly coupled.

### Reliable Redesign
- Use the outbox pattern and a queue for fan-out.
- Insert notification once, then enqueue delivery jobs.
- Workers handle email and in-app delivery with retries and idempotency keys.

Revised pseudocode:
```
function notify_all(student_ids, message):
	notification_id = insert_notification(message)
	for batch in chunk(student_ids, 1000):
		insert_recipients(notification_id, batch)
		enqueue_delivery_jobs(notification_id, batch)

worker delivery_job(notification_id, student_id):
	if already_delivered(notification_id, student_id):
		return
	send_email(student_id, message) with retry
	push_to_app(student_id, message)
	mark_delivered(notification_id, student_id)
```

Why this helps:
- Parallel workers improve throughput.
- Retries are scoped to failed recipients.
- Idempotency avoids duplicate sends.

## Stage 6

### Priority Inbox Approach
- Use a weighted score for each notification: placement > result > event, plus a recency boost.
- Fetch notifications via the provided API and compute top N in memory.

Example scoring:
- Weight: Placement = 3, Result = 2, Event = 1.
- Recency boost: $\frac{1}{\log_2(2 + \text{ageMinutes})}$.
- Score = weight + recency boost.

### Efficient Top-N Maintenance
- Maintain a min-heap of size N keyed by score.
- For each incoming notification, compute score and insert if higher than heap minimum.
- This keeps updates at $O(\log N)$ per notification instead of sorting all results.
