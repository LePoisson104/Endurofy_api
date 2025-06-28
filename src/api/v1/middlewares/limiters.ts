import rateLimit, { Options } from "express-rate-limit";
import { Request, Response, NextFunction } from "express";
import { LimiterConfig } from "../interfaces/limiter.interface";
import Logger from "../utils/logger";

const createLimiter = ({ windowMs, max, duration, message }: LimiterConfig) => {
  return rateLimit({
    windowMs,
    max, // Limit each IP to max requests per window
    message: {
      message:
        message ||
        `Too many requests, please try again after a ${duration} pause.`,
    },
    handler: async (
      req: Request,
      res: Response,
      next: NextFunction,
      options: Options
    ) => {
      await Logger.logEvents(
        `Too Many Requests: ${options.message.message}\t${req.method}\t${req.url}\t${req.headers.origin}`,
        "errLog.log"
      );

      res.status(options.statusCode || 429).send(options.message);
    },
    standardHeaders: true, // Return rate limit info in headers
    legacyHeaders: false, // Disable deprecated headers
  });
};

const loginLimiter = createLimiter({
  windowMs: 5 * 60 * 1000, // 5 minute
  max: 5,
  duration: "5 minutes",
  message: "Too many login attempts, please try again after a 5 minute pause.",
});

const signupLimiter = createLimiter({
  windowMs: 5 * 60 * 1000, // 5 minute
  max: 5,
  duration: "5 minutes",
  message: "Too many signup attempts, please try again after a 5 minute pause.",
});

const otpLimiter = createLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Allow 5 OTP requests within 15 minutes
  duration: "15 minutes",
  message: "Too many OTP requests, please try again after a 15 minute pause.",
});

const deleteAccountAttemptLimiter = createLimiter({
  windowMs: 15 * 60 * 1000, // 15 minute
  max: 5,
  duration: "15 minutes",
  message: "Too many attempts, please try again after a 15 minute pause.",
});

const resetPasswordLimiter = createLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  duration: "15 minutes",
  message: "Too many attempts, please try again after a 15 minute pause.",
});

export default {
  loginLimiter,
  signupLimiter,
  otpLimiter,
  deleteAccountAttemptLimiter,
  resetPasswordLimiter,
};
