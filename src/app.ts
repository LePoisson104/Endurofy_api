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

const app: Express = express();

configureSecurityMiddleware(app);
app.use(cookieParser());
app.use(express.json());

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", usersRoutes);
app.use("/api/v1/weight-log", weightLogRoutes);
app.use("/api/v1/workout-program", workoutProgramRoutes);
app.use("/api/v1/workout-log", workoutLogRoutes);
app.use("/api/v1/food-log", foodLogRoutes);

// Initialize cleanup scheduler
scheduleCleanup();

export default app;
