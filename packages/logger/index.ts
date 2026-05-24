import winston from "winston";
import { env } from "./env";

type LoggerLevel = "error" | "info" | "debug";

const level: LoggerLevel =
  env.LOGGER_LEVEL ?? (env.NODE_ENV === "development" ? "debug" : "error");

const isDevelopment = env.NODE_ENV === "development";

const format = isDevelopment
  ? winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      winston.format.printf(({ timestamp, level, message, ...meta }) => {
        const metaString = Object.keys(meta).length
          ? `\n${JSON.stringify(meta, null, 2)}`
          : "";
        return `${timestamp} [${level}]: ${message}${metaString}`;
      }),
    )
  : winston.format.combine(winston.format.timestamp(), winston.format.json());

export const logger = winston.createLogger({
  level: level,
  format: format,
  transports: [new winston.transports.Console()],
});
