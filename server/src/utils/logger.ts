import { createLogger, format, transports } from "winston";
import path from "path";

const logger = createLogger({
  level: "error",
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  defaultMeta: { service: "user-service" },
  transports: [
    new transports.File({ filename: path.join(__dirname, "../../logs/error.log"), level: "error" }),
    new transports.Console({ format: format.simple() })
  ],
});

export default logger;