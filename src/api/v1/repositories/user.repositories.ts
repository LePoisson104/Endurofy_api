import pool from "../../../config/db.config";
import { AppError } from "../middlewares/error.handlers";
import { User, OTP, DB_ERROR_CODES } from "../interfaces/db.models";

// SQL Queries
const SQL_QUERIES = {
  CREATE_USER:
    "INSERT INTO users (user_id, email, hashed_password, first_name, last_name) values (?,?,?,?,?)",
  CHECK_USER_EXISTS: "SELECT email FROM users WHERE email = ?",
  GET_USER_CREDENTIALS:
    "SELECT user_id, email, hashed_password, first_name, last_name, verified FROM users WHERE email = ?",
  UPDATE_VERIFICATION: "UPDATE users SET verified = ? WHERE email = ?",
  GET_USER_INFO: "SELECT * FROM users WHERE user_id = ?",
  ADD_OTP:
    "INSERT INTO otp (email, hashed_otp, created_at, expires_at) VALUES (?,?,?,?)",
  GET_OTP: "SELECT * FROM otp WHERE email = ?",
  UPDATE_OTP:
    "UPDATE otp SET hashed_otp = ?, created_at = ?, expires_at = ? WHERE email = ?",
  DELETE_OTP: "DELETE FROM otp WHERE email = ?",
} as const;

const queryCreateNewUser = async (
  userId: string,
  firstName: string,
  lastName: string,
  email: string,
  hashedPassword: string
): Promise<any> => {
  const query = SQL_QUERIES.CREATE_USER;

  try {
    const [result] = await pool.execute(query, [
      userId,
      email,
      hashedPassword,
      firstName,
      lastName,
    ]);
    return result;
  } catch (err: any) {
    console.error("Error executing query: ", err);
    if (err.code === DB_ERROR_CODES.DUPLICATE_ENTRY) {
      throw new AppError("Email already registered", 409);
    }
    throw new AppError("Database error while creating user", 500);
  }
};

const queryCheckUserExists = async (email: string): Promise<boolean> => {
  const query = SQL_QUERIES.CHECK_USER_EXISTS;
  try {
    const [rows] = await pool.execute(query, [email]);
    return (rows as any[]).length > 0;
  } catch (err) {
    console.error("Error checking user existence: ", err);
    throw new AppError("Database error while checking user existence", 500);
  }
};

const queryGetUserCredentials = async (email: string): Promise<User[]> => {
  const query = SQL_QUERIES.GET_USER_CREDENTIALS;
  try {
    const [result] = await pool.execute(query, [email]);
    return result as User[];
  } catch (err) {
    console.error("Error getting user's credentials", err);
    throw new AppError("Database error while fetching user credentials", 500);
  }
};

const queryUpdateUsersVerificationStatus = async (
  email: string,
  verified: number
): Promise<any> => {
  const query = SQL_QUERIES.UPDATE_VERIFICATION;
  try {
    const [result] = await pool.execute(query, [verified, email]);
    if ((result as any).affectedRows === 0) {
      throw new AppError("User not found", 404);
    }
    return result;
  } catch (err) {
    if (err instanceof AppError) throw err;
    console.error("Error updating user's verification status", err);
    throw new AppError(
      "Database error while updating verification status",
      500
    );
  }
};

const queryGetUsersInfo = async (userId: string): Promise<User[]> => {
  const query = SQL_QUERIES.GET_USER_INFO;
  try {
    const [result] = await pool.execute(query, [userId]);
    const users = result as User[];
    if (users.length === 0) {
      throw new AppError("User not found", 404);
    }
    return users;
  } catch (err) {
    if (err instanceof AppError) throw err;
    console.error("Error getting user's info", err);
    throw new AppError("Database error while fetching user info", 500);
  }
};

const queryAddOTP = async (
  email: string,
  hashedOTP: string,
  createdAt: string,
  expiresAt: string
): Promise<any> => {
  const query = SQL_QUERIES.ADD_OTP;
  try {
    const [result] = await pool.execute(query, [
      email,
      hashedOTP,
      createdAt,
      expiresAt,
    ]);
    return result;
  } catch (err: any) {
    if (err.code === DB_ERROR_CODES.DUPLICATE_ENTRY) {
      throw new AppError("An OTP already exists for this email", 409);
    }
    console.error("Error creating new otp", err);
    throw new AppError("Database error while creating OTP", 500);
  }
};

const queryGetOTP = async (email: string): Promise<OTP[]> => {
  const query = SQL_QUERIES.GET_OTP;
  try {
    const [result] = await pool.execute(query, [email]);
    return result as OTP[];
  } catch (err) {
    console.log("Error getting otp", err);
    throw new AppError("Database error while fetching OTP", 500);
  }
};

const queryUpdateOTP = async (
  email: string,
  hashedOTP: string,
  createdAt: string,
  expiresAt: string
): Promise<any> => {
  const query = SQL_QUERIES.UPDATE_OTP;
  try {
    const [result] = await pool.execute(query, [
      hashedOTP,
      createdAt,
      expiresAt,
      email,
    ]);
    if ((result as any).affectedRows === 0) {
      throw new AppError("OTP not found", 404);
    }
    return result;
  } catch (err) {
    if (err instanceof AppError) throw err;
    console.error("Error updating otp", err);
    throw new AppError("Database error while updating OTP", 500);
  }
};

const queryDeleteOTP = async (email: string): Promise<any> => {
  const query = SQL_QUERIES.DELETE_OTP;
  try {
    const [result] = await pool.execute(query, [email]);
    if ((result as any).affectedRows === 0) {
      throw new AppError("OTP not found", 404);
    }
    return result;
  } catch (err) {
    if (err instanceof AppError) throw err;
    console.error("Error deleting otp", err);
    throw new AppError("Database error while deleting OTP", 500);
  }
};

export default {
  queryCreateNewUser,
  queryCheckUserExists,
  queryGetUserCredentials,
  queryUpdateUsersVerificationStatus,
  queryGetUsersInfo,
  queryAddOTP,
  queryGetOTP,
  queryUpdateOTP,
  queryDeleteOTP,
};
