import express, { Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import authRoutes from "./api/v1/routes/auth.routes";
import usersRoutes from "./api/v1/routes/user.routes";

const app: Express = express();

app.use(cors());
app.use(cookieParser());
app.use(helmet());
app.use(express.json());

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", usersRoutes);

export default app;
