import { format } from "date-fns";
import { v4 as uuid } from "uuid";
import fs from "fs";
import { promises as fsPromises } from "fs";
import path from "path";

// Log types
type LogType = "INFO" | "ERROR" | "WARN" | "DEBUG";

/**
 * Logs events to a file with timestamp and unique identifier
 * @param message - The message to log
 * @param logType - Type of log (INFO, ERROR, WARN, DEBUG)
 * @param logFileName - Name of the log file
 */
const logEvents = async (
  message: string,
  logType: LogType,
  logFileName: string
): Promise<void> => {
  const dateTime = format(new Date(), "yyyyMMdd\tHH:mm:ss");
  const logItem = `${dateTime}\t${uuid()}\t${logType}\t${message}\n`;

  try {
    const logsDir = path.join(__dirname, "..", "..", "..", "logs");
    if (!fs.existsSync(logsDir)) {
      await fsPromises.mkdir(logsDir);
    }
    await fsPromises.appendFile(path.join(logsDir, logFileName), logItem);
  } catch (err) {
    console.error("Error writing to log file:", err);
  }
};

/**
 * Logger class with methods for different log levels
 */
class Logger {
  private static instance: Logger;
  private readonly errorLogFile = "errors.log";
  private readonly infoLogFile = "info.log";
  private readonly debugLogFile = "debug.log";

  private constructor() {}

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  public async error(message: string | Error): Promise<void> {
    const errorMessage =
      message instanceof Error ? message.stack || message.message : message;
    await logEvents(errorMessage, "ERROR", this.errorLogFile);
  }

  public async info(message: string): Promise<void> {
    await logEvents(message, "INFO", this.infoLogFile);
  }

  public async debug(message: string): Promise<void> {
    if (process.env.NODE_ENV !== "production") {
      await logEvents(message, "DEBUG", this.debugLogFile);
    }
  }

  public async warn(message: string): Promise<void> {
    await logEvents(message, "WARN", this.errorLogFile);
  }
}

export const logger = Logger.getInstance();
