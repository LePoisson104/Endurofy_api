import express, { Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import authRoutes from "./api/v1/routes/auth.routes";

const app: Express = express();

app.use(cors());
app.use(cookieParser());
app.use(helmet());
app.use(express.json());

app.use("/api/v1/auth", authRoutes);

export default app;
