import mysql, { Pool } from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

const pool: Pool = mysql.createPool({
  host: process.env.HOST_NAME as string,
  port: parseInt(process.env.PORT as string) || 3306,
  database: process.env.DATABASE_NAME as string,
  user: process.env.USER_NAME as string,
  password: process.env.PASSWORD as string,
});

const connectDB = async () => {
  try {
    const connection = await pool.getConnection();
    console.log("Database connected successfully!");
    connection.release();
  } catch (err) {
    console.error("Could not connect to database", err);
    throw new Error("Could not connect to database");
  }
};

connectDB();

export default pool;
