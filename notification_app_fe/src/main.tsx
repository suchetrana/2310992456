import React from "react";
import ReactDOM from "react-dom/client";
import { CssBaseline, ThemeProvider } from "@mui/material";
import App from "./App";
import { appTheme } from "./config/theme";
import { runtimeConfig } from "./config/runtime";
import { tryInitLogger } from "./config/logger.config";
import { ensureAuthToken } from "./service/auth.service";
import { safeLog } from "./utils/safe-log";
import "./styles.css";

async function bootstrap() {
  const token = await ensureAuthToken();
  const effectiveToken = token || runtimeConfig.token;

  tryInitLogger({
    baseUrl: runtimeConfig.apiBaseUrl,
    token: effectiveToken,
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
}

void bootstrap();
