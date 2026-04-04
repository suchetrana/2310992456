import winston, { format } from "winston";

const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.json(),
    winston.format.printf(({ timestamp, level, message, ...data }) => {
      const output = { level, message, timestamp };
      return JSON.stringify(output);
    }), 
  ),
  transports:[
    new winston.transports.Console()
  ]
});
export default logger;
