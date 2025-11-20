import dotenv from "dotenv";
import app from "./app";
dotenv.config();

const PORT = Number(process.env.PORT) || 8000;

//development
// const HOST = process.env.HOST || "localhost";
// const HOST = "localhost";

// app.listen(PORT, HOST, () =>
//   console.log(`Server is running at http://${HOST}:${PORT}`)
// );

//development

// production
app.listen(PORT, () => console.log(`Server is running on port: ${PORT}`));
