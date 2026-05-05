export { Log } from "../controller/log.controller";
export {
  configureLogger,
  ALLOWED_STACKS,
  ALLOWED_LEVELS,
  ALLOWED_PACKAGES
} from "../config/logger.config";

export type {
  LogStack,
  LogLevel,
  LogPackage,
  LoggerConfig
} from "../config/logger.config";

export type { LogResult } from "../service/log.service";
