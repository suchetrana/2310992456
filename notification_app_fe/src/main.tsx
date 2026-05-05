import React from "react";
import ReactDOM from "react-dom/client";
import { CssBaseline, ThemeProvider } from "@mui/material";
import App from "./App";
import { appTheme } from "./config/theme";
import { runtimeConfig } from "./config/runtime";
import { tryInitLogger } from "./config/logger.config";
import { safeLog } from "./utils/safe-log";
import "./styles.css";

tryInitLogger({
  baseUrl: runtimeConfig.apiBaseUrl,
  token: runtimeConfig.token,
  timeoutMs: 8000
});

void safeLog("frontend", "info", "page", "app initialized");

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
