import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography
} from "@mui/material";
import NotificationCard from "../components/NotificationCard";
import { fetchNotifications, type NotificationItem } from "../service/notifications.service";
import { rankNotifications } from "../service/priority.service";
import { safeLog } from "../utils/safe-log";

const typeOptions = ["All", "Event", "Result", "Placement"];
const limitOptions = [10, 15, 20];

export default function PriorityPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [limit, setLimit] = useState(10);
  const [typeFilter, setTypeFilter] = useState("All");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError(null);
      const result = await fetchNotifications({ limit: 200, page: 1, type: typeFilter });

      if (!active) {
        return;
      }

      if (!result.ok) {
        setError(result.error ?? "Unable to fetch notifications");
        setLoading(false);
        return;
      }

      setNotifications(result.items);
      setLoading(false);
      void safeLog("frontend", "info", "page", "priority list loaded");
    }

    void load();

    return () => {
      active = false;
    };
  }, [typeFilter]);

  const ranked = useMemo(() => {
    return rankNotifications(notifications, limit);
  }, [notifications, limit]);

  return (
    <Stack spacing={3}>
      <Paper className="section-card" sx={{ p: 3 }}>
        <Stack spacing={1}>
          <Typography variant="h4">Priority Inbox</Typography>
          <Typography color="text.secondary">
            Top notifications ranked by urgency and recency.
          </Typography>
        </Stack>
        <Divider sx={{ my: 2 }} />
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems="center">
          <FormControl sx={{ minWidth: 180 }}>
            <InputLabel id="priority-type-label">Type</InputLabel>
            <Select
              labelId="priority-type-label"
              value={typeFilter}
              label="Type"
              onChange={(event) => setTypeFilter(event.target.value as string)}
            >
              {typeOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 140 }}>
            <InputLabel id="priority-limit-label">Top N</InputLabel>
            <Select
              labelId="priority-limit-label"
              value={limit}
              label="Top N"
              onChange={(event) => setLimit(Number(event.target.value as string))}
            >
              {limitOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button variant="outlined" onClick={() => setTypeFilter("All")}>Reset</Button>
        </Stack>
      </Paper>

      <Stack spacing={2}>
        {loading && <Typography>Loading priority list...</Typography>}
        {error && <Typography color="error">{error}</Typography>}
        {!loading && !error && ranked.length === 0 && (
          <Typography>No notifications available.</Typography>
        )}
        {ranked.map((item) => (
          <NotificationCard
            key={item.id}
            item={item}
            isRead={true}
            score={item.score}
          />
        ))}
      </Stack>

      <Box display="flex" justifyContent="space-between">
        <Typography variant="body2" color="text.secondary">
          Showing top {ranked.length} notifications
        </Typography>
      </Box>
    </Stack>
  );
}
