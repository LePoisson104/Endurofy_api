import rateLimit, { Options } from "express-rate-limit";
import { Request, Response, NextFunction } from "express";
import { LimiterConfig } from "../interfaces/limiter.interface";

const createLimiter = ({ windowMs, max, duration }: LimiterConfig) => {
  return rateLimit({
    windowMs,
    max, // Limit each Ip to 5 login requests per `window` per minute
    message: {
      message: `Too many requests from this IP, please try again after a ${duration} pause.`,
    },
    handler: (
      req: Request,
      res: Response,
      next: NextFunction,
      options: Options
    ) => {
      res.status(options.statusCode).send(options.message);
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  });
};

const loginLimiter = createLimiter({
  windowMs: 5 * 60 * 1000, // 1 minute
  max: 5,
  duration: "5 minutes",
});

const signupLimiter = createLimiter({
  windowMs: 5 * 60 * 1000, // 1 minute
  max: 5,
  duration: "5 minutes",
});

const deleteAccountLimiter = createLimiter({
  windowMs: 5 * 60 * 1000, // 1 minute
  max: 5,
  duration: "5 minutes",
});

const otpLimiter = createLimiter({
  windowMs: 60 * 60 * 1000, // 24 hours
  max: 5, // Allow 5 OTP requests within 24 hours
  duration: "1 hour.",
});

export default {
  loginLimiter,
  signupLimiter,
  deleteAccountLimiter,
  otpLimiter,
};
