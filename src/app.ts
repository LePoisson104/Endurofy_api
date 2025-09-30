import express, { Express } from "express";
import cookieParser from "cookie-parser";
import authRoutes from "./api/v1/routes/auth.routes";
import usersRoutes from "./api/v1/routes/user.routes";
import { scheduleCleanup } from "./api/v1/schedulers/cleanup.scheduler";
import { configureSecurityMiddleware } from "./api/v1/middlewares/security.middleware";
import weightLogRoutes from "./api/v1/routes/weight-log.routes";
import workoutProgramRoutes from "./api/v1/routes/workoutProgramRoutes";
import workoutLogRoutes from "./api/v1/routes/workout-log.routes";
import foodLogRoutes from "./api/v1/routes/food-log.routes";
import foodRoutes from "./api/v1/routes/food.routes";
import { globalErrorHandler } from "./api/v1/middlewares/error.handlers";
import settingsRoutes from "./api/v1/routes/settings.routes";
import waterLogRoutes from "./api/v1/routes/water-log.routes";

const app: Express = express();

configureSecurityMiddleware(app);
app.use(cookieParser());
app.use(express.json());
app.set("trust proxy", 1);

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", usersRoutes);
app.use("/api/v1/weight-logs", weightLogRoutes);
app.use("/api/v1/workout-programs", workoutProgramRoutes);
app.use("/api/v1/workout-logs", workoutLogRoutes);
app.use("/api/v1/foods", foodRoutes);
app.use("/api/v1/food-logs", foodLogRoutes);
app.use("/api/v1/settings", settingsRoutes);
app.use("/api/v1/water-logs", waterLogRoutes);

// Global error handling middleware (must be last)
app.use(globalErrorHandler);

// Initialize cleanup scheduler
scheduleCleanup();

export default app;
