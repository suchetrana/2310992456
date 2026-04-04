import express from "express";
import type { Express } from "express";
import { serverConfig } from "./config/index.js";
import pingRouter from "./router/ping.router.js";
import { loginRouter } from "./router/v1/login.router.js";
import { genericErrorHandler } from "./middlewares/error.middleware.js";
import logger from "./config/logger.config.js";

const app: Express = express();

// registering all routes and their corresponding routes without app server object
app.use(express.json());

app.use(pingRouter);
app.use("/v1", loginRouter);

/**
 * Add the error handler middleware at the end of all routes so that it can catch any error thrown from any route handler or any middleware.
 */
app.use(genericErrorHandler);

const PORT = serverConfig.PORT;
app.listen(PORT, () => {
  console.log(`server started successfully http://localhost:${PORT}`);
  logger.info(`server started successfully http://localhost:${PORT}`);
});
