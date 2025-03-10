import helmet from "helmet";
import cors from "cors";
import { Express, Request, Response, NextFunction } from "express";

const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS?.split(",") || [
  "http://localhost:3000",
];

export const configureSecurityMiddleware = (app: Express): void => {
  // Helmet middleware for security headers
  app.use(helmet());

  // CORS configuration
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || ALLOWED_ORIGINS.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      exposedHeaders: ["set-cookie"],
    })
  );

  // Add security headers
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
    );
    next();
  });

  // Prevent parameter pollution
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.query) {
      for (let [key, value] of Object.entries(req.query)) {
        if (Array.isArray(value)) {
          req.query[key] = value[value.length - 1];
        }
      }
    }
    next();
  });
};
