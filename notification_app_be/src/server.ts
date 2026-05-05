import express from "express";
import router from "./router";
import { errorMiddleware } from "./middlewares/error.middleware";
import { loadEnv } from "./config/env";
import { getAppConfig } from "./config/app.config";
import { loadPersonalConfig } from "./config/personal.config";
import { tryInitLogger } from "./config/logger.config";
import { safeLog } from "./utils/safe-log";

const app = express();

loadEnv();

app.use(express.json());
app.use(router);
app.use(errorMiddleware);

const config = loadPersonalConfig();
tryInitLogger({
  baseUrl: config.apiBaseUrl,
  token: config.token,
  timeoutMs: 8000
});

const { port } = getAppConfig();
app.listen(port, () => {
  void safeLog("backend", "info", "service", `server started on ${port}`);
});
