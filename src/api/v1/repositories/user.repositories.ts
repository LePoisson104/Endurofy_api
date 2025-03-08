import pool from "../../../config/db.config";
import { ErrorResponse } from "../middlewares/error.handlers";

const queryCreateNewUser = async (
  userId: string,
  firstName: string,
  lastName: string,
  email: string,
  hashedPassword: string
) => {
  const query =
    "INSERT INTO users (user_id, email, hashed_password, first_name, last_name) values (?,?,?,?,?)";

  try {
    const [results] = await pool.execute(query, [
      userId,
      email,
      hashedPassword,
      firstName,
      lastName,
    ]);
    return results;
  } catch (err: any) {
    console.error("Error executing query: ", err);
    if (err.code === "ER_DUP_ENTRY") {
      throw new ErrorResponse("Duplicate email!", 409);
    }
    throw new ErrorResponse("Error creating new user", 500);
  }
};

const queryCheckUserExists = async (email: string) => {
  const query = "SELECT email FROM users WHERE email = ?";
  try {
    const [rows] = await pool.execute(query, [email]);
    return (rows as any[]).length > 0;
  } catch (err) {
    console.error("Error checking user existence: ", err);
    throw new ErrorResponse("Error checking user existence", 500);
  }
};

const queryGetUserCredentials = async (email: string) => {
  const query =
    "SELECT user_id, email, hashed_password, first_name, last_name FROM users WHERE email = ?";
  try {
    const [results] = await pool.execute(query, [email]);
    return results as any[];
  } catch (err) {
    console.error("Error getting user's credentials", err);
    throw new ErrorResponse("Error getting user's credentials", 500);
  }
};

const queryGetUsersInfo = async (userId: string) => {
  const query = "SELECT * FROM users WHERE user_id = ?";
  try {
    const [results] = await pool.execute(query, [userId]);
    return results as any[];
  } catch (err) {
    console.error("Error getting user's info", err);
    throw new ErrorResponse("Error getting user's info", 500);
  }
};

export default {
  queryCreateNewUser,
  queryCheckUserExists,
  queryGetUserCredentials,
  queryGetUsersInfo,
};
