import { AppBar, Box, Button, Container, Toolbar, Typography } from "@mui/material";
import { Link, Outlet, useLocation } from "react-router-dom";

const navItems = [
  { label: "All Notifications", path: "/" },
  { label: "Priority Inbox", path: "/priority" }
];

export default function AppShell() {
  const location = useLocation();

  return (
    <Box className="app-shell">
      <AppBar position="sticky" color="inherit" elevation={0}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Box>
            <Typography variant="h6">Campus Pulse</Typography>
            <Typography variant="body2" color="text.secondary">
              Real-time student notifications
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 1 }}>
            {navItems.map((item) => (
              <Button
                key={item.path}
                component={Link}
                to={item.path}
                variant={location.pathname === item.path ? "contained" : "text"}
                color={location.pathname === item.path ? "primary" : "inherit"}
              >
                {item.label}
              </Button>
            ))}
          </Box>
        </Toolbar>
      </AppBar>
      <Box className="app-ambient" aria-hidden="true" />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Outlet />
      </Container>
    </Box>
  );
}
