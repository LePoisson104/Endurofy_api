import helmet from "helmet";
import cors from "cors";
import { Express } from "express";

const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS?.split(",") || [
  "http://localhost:3000",
  `http://${process.env.HOST}:3000`,
  `https://${process.env.FRONTEND_URL}`,
];

export const configureSecurityMiddleware = (app: Express): void => {
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
      optionsSuccessStatus: 200,
    })
  );
};
