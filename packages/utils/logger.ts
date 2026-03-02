import { z } from "zod";

// import { datadogLogs } from "@datadog/browser-logs"; or Splunk

// 1. Configuration Schema (Reusing your Zod interest)
const logConfigSchema = z.object({
  MODE: z.enum(["development", "production", "test"]),
  ENABLE_DATADOG: z.boolean().default(false),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
});

// Parse env vars (safely handling booleans from string env vars)
const config = logConfigSchema.parse({
  MODE: import.meta.env.MODE,
  ENABLE_DATADOG: import.meta.env.VITE_ENABLE_DATADOG === "true",
  LOG_LEVEL: import.meta.env.VITE_LOG_LEVEL || "info",
});

// [Todo(Arun)-EnableInFuture]
// if (config.ENABLE_DATADOG) {
//   datadogLogs.init({
//     clientToken: import.meta.env.VITE_DD_CLIENT_TOKEN,
//     site: "datadoghq.com",
//     forwardErrorsToLogs: true,
//     sampleRate: 100,
//   });
// }

// 3. Define Log Levels
const LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

type LogContext = Record<string, unknown>;

class Logger {
  private log(
    level: keyof typeof LEVELS,
    message: string,
    context?: LogContext,
  ) {
    // A. Level Guard: Don't log 'debug' if we are set to 'error'
    if (LEVELS[level] < LEVELS[config.LOG_LEVEL]) return;

    // B. Development: Pretty print to Console
    if (config.MODE === "development" || !config.ENABLE_DATADOG) {
      const color =
        level === "error"
          ? "color: red"
          : level === "warn"
            ? "color: orange"
            : "color: cyan";

      console.groupCollapsed(`%c[${level.toUpperCase()}] ${message}`, color);
      if (context) console.log(context);
      console.trace(); // Helpful to see where the log came from
      console.groupEnd();
      return;
    }

    // C. Production: Send to Datadog
    if (config.ENABLE_DATADOG) {
      // datadogLogs.logger[level](message, context);
    }
  }

  public debug(message: string, context?: LogContext) {
    this.log("debug", message, context);
  }

  public info(message: string, context?: LogContext) {
    this.log("info", message, context);
  }

  public warn(message: string, context?: LogContext) {
    this.log("warn", message, context);
  }

  public error(message: string, error?: Error, context?: LogContext) {
    // Automatically extract stack traces from Error objects
    this.log("error", message, {
      ...context,
      error: {
        message: error?.message,
        stack: error?.stack,
        name: error?.name,
      },
    });
  }
}

export const logger = new Logger();
