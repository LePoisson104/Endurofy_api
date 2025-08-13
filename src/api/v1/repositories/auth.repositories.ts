import pool from "../../../config/db.config";
import { AppError } from "../middlewares/error.handlers";
import { User, OTP } from "../interfaces/db.models";

const CreateOtp = async (
  userId: string,
  email: string,
  hashedOTP: string,
  createdAt: string,
  expiresAt: string,
  connection?: any
): Promise<any> => {
  const query =
    "INSERT INTO otp (user_id, email, hashed_otp, created_at, expires_at) VALUES (?,?,?,?,?)";

  if (connection) {
    const [result] = await connection.execute(query, [
      userId,
      email,
      hashedOTP,
      createdAt,
      expiresAt,
    ]);
    return result;
  } else {
    const [result] = await pool.execute(query, [
      userId,
      email,
      hashedOTP,
      createdAt,
      expiresAt,
    ]);
    return result;
  }
};

const GetUserCredentials = async (
  email: string,
  connection?: any
): Promise<User[]> => {
  const query =
    "SELECT user_id, email, hashed_password, first_name, last_name, verified, pending_email FROM users WHERE email = ?";

  if (connection) {
    const [result] = await connection.execute(query, [email]);
    return result as User[];
  } else {
    const [result] = await pool.execute(query, [email]);
    return result as User[];
  }
};

const GetUserById = async (
  userId: string,
  connection?: any
): Promise<User[]> => {
  const query = "SELECT * FROM users WHERE user_id = ?";

  if (connection) {
    const [result] = await connection.execute(query, [userId]);
    return result as User[];
  } else {
    const [result] = await pool.execute(query, [userId]);
    return result as User[];
  }
};

const GetOTP = async (userId: string, connection?: any): Promise<OTP[]> => {
  const query = "SELECT * FROM otp WHERE user_id = ?";

  if (connection) {
    const [result] = await connection.execute(query, [userId]);
    return result as OTP[];
  } else {
    const [result] = await pool.execute(query, [userId]);
    return result as OTP[];
  }
};

const UpdateOTP = async (
  userId: string,
  hashedOTP: string,
  createdAt: string,
  expiresAt: string,
  connection?: any
): Promise<any> => {
  const query =
    "UPDATE otp SET hashed_otp = ?, created_at = ?, expires_at = ? WHERE user_id = ?";

  if (connection) {
    const [result] = await connection.execute(query, [
      hashedOTP,
      createdAt,
      expiresAt,
      userId,
    ]);
    if ((result as any).affectedRows === 0) {
      throw new AppError("OTP not found", 404);
    }
    return result;
  } else {
    const [result] = await pool.execute(query, [
      hashedOTP,
      createdAt,
      expiresAt,
      userId,
    ]);
    if ((result as any).affectedRows === 0) {
      throw new AppError("OTP not found", 404);
    }
    return result;
  }
};

const DeleteOTP = async (userId: string, connection?: any): Promise<any> => {
  const query = "DELETE FROM otp WHERE user_id = ?";

  if (connection) {
    const [result] = await connection.execute(query, [userId]);
    if ((result as any).affectedRows === 0) {
      throw new AppError("OTP not found", 404);
    }
    return result;
  } else {
    const [result] = await pool.execute(query, [userId]);
    if ((result as any).affectedRows === 0) {
      throw new AppError("OTP not found", 404);
    }
    return result;
  }
};

export default {
  GetUserCredentials,
  GetUserById,
  GetOTP,
  UpdateOTP,
  DeleteOTP,
  CreateOtp,
};
