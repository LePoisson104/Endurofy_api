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
    "SELECT user_id, email, hashed_password, first_name, last_name, verified FROM users WHERE email = ?";
  try {
    const [results] = await pool.execute(query, [email]);
    return results as any[];
  } catch (err) {
    console.error("Error getting user's credentials", err);
    throw new ErrorResponse("Error getting user's credentials", 500);
  }
};

const queryUpdateUsersVerificationStatus = async (
  email: string,
  verified: number
) => {
  const query = "UPDATE users SET verified = ? WHERE email = ? ";
  try {
    const [results] = await pool.execute(query, [verified, email]);
    return results as any[];
  } catch (err) {
    console.error("Error updating user's verification status", err);
    throw new ErrorResponse("Error updating user's verification status", 500);
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

const queryAddOTP = async (
  email: string,
  hashedOTP: string,
  createdAt: string,
  expiresAt: string
) => {
  const query =
    "INSERT INTO otp (email, hashed_otp, created_at, expires_at) VALUES (?,?,?,?)";
  try {
    const [results] = await pool.execute(query, [
      email,
      hashedOTP,
      createdAt,
      expiresAt,
    ]);
    return results as any[];
  } catch (err: any) {
    if (err.code === "ER_DUP_ENTRY") {
      throw new ErrorResponse(`Duplicate entry for email ${email}`, 409);
    }
    console.error("Error creating new otp", err);
    throw new ErrorResponse("Error creating new otp", 500);
  }
};

const queryGetOTP = async (email: string) => {
  const query = "SELECT * FROM otp WHERE email = ?";
  try {
    const [results] = await pool.execute(query, [email]);
    return results as any[];
  } catch (err) {
    console.log("Error getting otp", err);
    throw new ErrorResponse("Error getting otp", 500);
  }
};

const queryUpdateOTP = async (
  email: string,
  hashedOTP: string,
  createdAt: string,
  expiresAt: string
) => {
  const query =
    "UPDATE otp SET hashed_otp = ?, created_at = ?, expires_at = ? WHERE email = ?";
  try {
    const [result] = await pool.execute(query, [
      hashedOTP,
      createdAt,
      expiresAt,
      email,
    ]);
  } catch (err) {
    console.error("Error updating otp", err);
    throw new ErrorResponse("Error updating otp", 500);
  }
};

const queryDeleteOTP = async (email: string) => {
  const query = "DELETE FROM otp WHERE email = ?";
  try {
    const [results] = await pool.execute(query, [email]);
    return results as any[];
  } catch (err) {
    console.error("Error deleting otp", err);
    throw new ErrorResponse("Error deleting otp", 500);
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
