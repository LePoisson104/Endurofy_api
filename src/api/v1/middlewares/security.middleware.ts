import helmet from "helmet";
import cors from "cors";
import { Express, Request, Response, NextFunction } from "express";
import crypto from "crypto";

const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS?.split(",") || [
  "http://localhost:3000",
];

export const configureSecurityMiddleware = (app: Express): void => {
  // Helmet middleware for security headers with custom CSP
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: [
            "'self'",
            // Add specific trusted domains if needed
            // "https://trusted-cdn.example.com",
          ],
          styleSrc: [
            "'self'",
            "'unsafe-inline'", // Often needed for CSS-in-JS frameworks
          ],
          imgSrc: ["'self'", "data:", "https:"],
          fontSrc: ["'self'", "https:", "data:"],
          connectSrc: ["'self'"],
          mediaSrc: ["'self'"],
          objectSrc: ["'none'"],
          childSrc: ["'self'"],
          frameSrc: ["'none'"],
          workerSrc: ["'self'"],
          manifestSrc: ["'self'"],
          baseUri: ["'self'"],
          formAction: ["'self'"],
          frameAncestors: ["'none'"],
          upgradeInsecureRequests: [],
        },
      },
    })
  );

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
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
      allowedHeaders: ["Content-Type", "Authorization"],
      exposedHeaders: ["set-cookie"],
    })
  );

  // Additional security headers (some may be redundant with helmet but kept for clarity)
  app.use((req: Request, res: Response, next: NextFunction) => {
    // Generate nonce for inline scripts if needed
    const nonce = crypto.randomBytes(16).toString("base64");
    res.locals.nonce = nonce;

    // Additional security headers
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader(
      "Permissions-Policy",
      "geolocation=(), microphone=(), camera=()"
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
