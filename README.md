## Full Stack Setup

### 1) Personal config
Fill in [personal.config.json](personal.config.json) with your values:
- `accessCode`, `rollNo`, `githubUsername`, `mobileNo`

Then register and authenticate:
```
node scripts/register-auth.cjs
```

### 2) Build logging middleware
```
npm --prefix logging_middleware install
npm --prefix logging_middleware run build
```

### 3) Backend (notification_app_be)
```
npm --prefix notification_app_be install
npm --prefix notification_app_be run dev
```

Backend runs on `http://localhost:3001`.

### 4) Frontend (notification_app_fe)
Sync the frontend .env with your token:
```
node scripts/sync-frontend-env.cjs
```

Install and run the frontend:
```
npm --prefix notification_app_fe install
npm --prefix notification_app_fe run dev
```

Frontend runs on `http://localhost:3000`.

The frontend can auto-create and store the auth token in browser storage if
`VITE_AUTH_*` fields are set in [notification_app_fe/.env](notification_app_fe/.env).

### 5) Stage 6 output
Generate the priority inbox output file:
```
node scripts/priority-inbox.cjs
```

The output is written to [artifacts/stage6_output.json](artifacts/stage6_output.json).

### 6) API smoke test + auth check
Run the API test script to verify notifications, logs, and auth:
```
node scripts/test-apis.cjs
```

Results are saved to [artifacts/api-test.json](artifacts/api-test.json).
