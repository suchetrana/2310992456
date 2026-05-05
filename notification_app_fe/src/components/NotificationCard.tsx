import { Card, CardContent, Chip, Stack, Typography } from "@mui/material";
import type { NotificationItem } from "../service/notifications.service";

export type NotificationCardProps = {
  item: NotificationItem;
  isRead: boolean;
  highlight?: string;
  onClick?: () => void;
  score?: number;
};

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  return Number.isNaN(date.getTime()) ? timestamp : date.toLocaleString();
}

export default function NotificationCard({
  item,
  isRead,
  onClick,
  score
}: NotificationCardProps) {
  return (
    <Card
      className="section-card"
      onClick={onClick}
      sx={{
        border: isRead ? "1px solid rgba(0,0,0,0.06)" : "1px solid rgba(30,111,92,0.4)",
        cursor: onClick ? "pointer" : "default"
      }}
    >
      <CardContent>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
          <Chip label={item.type} color="secondary" size="small" />
          {!isRead && <Chip label="New" color="primary" size="small" className="badge-new" />}
          {typeof score === "number" && (
            <Chip label={`Score ${score.toFixed(2)}`} size="small" variant="outlined" />
          )}
        </Stack>
        <Typography variant="h6" sx={{ mt: 1, mb: 1 }}>
          {item.message}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {formatTimestamp(item.timestamp)}
        </Typography>
      </CardContent>
    </Card>
  );
}
