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
import { useReadState } from "../controller/read-state.controller";
import { fetchNotifications, type NotificationItem } from "../service/notifications.service";
import { safeLog } from "../utils/safe-log";

const typeOptions = ["All", "Event", "Result", "Placement"];
const limitOptions = [10, 20, 30];

export default function NotificationsPage() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [typeFilter, setTypeFilter] = useState("All");
  const [loading, setLoading] = useState(false);
  const [hasNext, setHasNext] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { isRead, markRead, markAll } = useReadState();

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError(null);
      const result = await fetchNotifications({
        limit,
        page,
        type: typeFilter
      });

      if (!active) {
        return;
      }

      if (!result.ok) {
        setError(result.error ?? "Unable to fetch notifications");
        setLoading(false);
        return;
      }

      setItems(result.items);
      setHasNext(result.hasNext);
      setLoading(false);
      void safeLog("frontend", "info", "page", "notifications loaded");
    }

    void load();

    return () => {
      active = false;
    };
  }, [limit, page, typeFilter]);

  const unreadCount = useMemo(() => {
    return items.filter((item) => !isRead(item.id)).length;
  }, [items, isRead]);

  return (
    <Stack spacing={3}>
      <Paper className="section-card" sx={{ p: 3 }}>
        <Stack spacing={1}>
          <Typography variant="h4">All Notifications</Typography>
          <Typography color="text.secondary">
            Track campus updates across events, results, and placements.
          </Typography>
          <Typography color="text.secondary">
            Unread in this view: {unreadCount}
          </Typography>
        </Stack>
        <Divider sx={{ my: 2 }} />
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems="center">
          <FormControl sx={{ minWidth: 180 }}>
            <InputLabel id="type-label">Type</InputLabel>
            <Select
              labelId="type-label"
              value={typeFilter}
              label="Type"
              onChange={(event) => {
                setTypeFilter(event.target.value as string);
                setPage(1);
              }}
            >
              {typeOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 140 }}>
            <InputLabel id="limit-label">Per page</InputLabel>
            <Select
              labelId="limit-label"
              value={limit}
              label="Per page"
              onChange={(event) => {
                setLimit(Number(event.target.value as string));
                setPage(1);
              }}
            >
              {limitOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            onClick={() => markAll(items.map((item) => item.id))}
          >
            Mark all viewed
          </Button>
        </Stack>
      </Paper>

      <Stack spacing={2}>
        {loading && <Typography>Loading notifications...</Typography>}
        {error && <Typography color="error">{error}</Typography>}
        {!loading && !error && items.length === 0 && (
          <Typography>No notifications available.</Typography>
        )}
        {items.map((item) => (
          <NotificationCard
            key={item.id}
            item={item}
            isRead={isRead(item.id)}
            onClick={() => markRead(item.id)}
          />
        ))}
      </Stack>

      <Box display="flex" justifyContent="space-between">
        <Button
          variant="outlined"
          disabled={page === 1}
          onClick={() => setPage((prev) => Math.max(1, prev - 1))}
        >
          Previous
        </Button>
        <Button
          variant="contained"
          disabled={!hasNext}
          onClick={() => setPage((prev) => prev + 1)}
        >
          Next
        </Button>
      </Box>
    </Stack>
  );
}
