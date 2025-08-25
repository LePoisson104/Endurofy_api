import dotenv from "dotenv";
import app from "./app";
dotenv.config();

const PORT = Number(process.env.PORT) || 8000;
// const HOST = process.env.HOST || "localhost";
const HOST = "localhost";

app.listen(PORT, HOST, () =>
  console.log(`Server is running at http://${HOST}:${PORT}`)
);
