import express, { Express } from "express";
import cookieParser from "cookie-parser";
import authRoutes from "./api/v1/routes/auth.routes";
import usersRoutes from "./api/v1/routes/user.routes";
import { scheduleCleanup } from "./api/v1/schedulers/cleanup.scheduler";
import { configureSecurityMiddleware } from "./api/v1/middlewares/security.middleware";

const app: Express = express();

configureSecurityMiddleware(app);
app.use(cookieParser());
app.use(express.json());

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", usersRoutes);

// Initialize cleanup scheduler
scheduleCleanup();

export default app;
