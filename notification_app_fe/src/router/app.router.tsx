import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AppShell from "../components/AppShell";
import NotificationsPage from "../pages/NotificationsPage";
import PriorityPage from "../pages/PriorityPage";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<NotificationsPage />} />
          <Route path="/priority" element={<PriorityPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
