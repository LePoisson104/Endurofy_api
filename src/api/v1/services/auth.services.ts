import Auth from "../repositories/auth.repositories";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";
import { AppError } from "../middlewares/error.handlers";
import { Response } from "express";
import { DecodedToken } from "../interfaces/decoded.interface";
import { generateOTP } from "../helpers/generateOTP";
import {
  sendOTPVerification,
  sendPasswordResetEmail,
} from "./sendOTPVerification.service";
import { TokenPayload, CookieOptions } from "../interfaces/auth.interfaces";
import {
  AuthServiceResponse,
  OTPServiceResponse,
} from "../interfaces/service.interfaces";
import pool from "../../../config/db.config";
import Logger from "../utils/logger";
import Users from "../repositories/users.repositories";

// Constants
const AUTH_CONSTANTS = {
  SALT_ROUNDS: 10,
  ACCESS_TOKEN_EXPIRY: "15min",
  REFRESH_TOKEN_EXPIRY: "7d",
  OTP_EXPIRY_MINUTES: 15,
  COOKIE_NAME: "jwt",
} as const;

const DEFAULT_COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

////////////////////////////////////////////////////////////////////////////////////////////////////////
// Verify OTP
////////////////////////////////////////////////////////////////////////////////////////////////////////
const verifyOTP = async (
  userId: string,
  email: string,
  otp: string
): Promise<OTPServiceResponse> => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Get OTP within transaction
    const [otpRows] = await connection.execute(
      "SELECT * FROM otp WHERE email = ?",
      [email]
    );
    const getOTP = otpRows as any[];

    if (getOTP.length === 0) {
      throw new AppError(
        "Either account has already been verified or you have not signed up",
        404
      );
    }

    if (getOTP[0].user_id !== userId && getOTP[0].email !== email) {
      throw new AppError("Invalid user", 400);
    }

    const match = await bcrypt.compare(otp, getOTP[0].hashed_otp);

    if (!match) {
      throw new AppError("Invalid verification code", 400);
    }

    if (parseInt(getOTP[0].expires_at) < Date.now()) {
      throw new AppError(
        "Verification code has expired, please request a new one",
        400
      );
    }

    // Delete OTP and update user verification status within transaction
    await connection.execute("DELETE FROM otp WHERE user_id = ?", [userId]);

    await connection.execute(
      "UPDATE users SET verified = ? WHERE user_id = ?",
      [1, userId]
    );

    await connection.commit();

    return {
      success: true,
      message: "Verification code verified successfully",
    };
  } catch (err) {
    await connection.rollback();
    await Logger.logEvents(
      `Error during OTP verification: ${err}`,
      "errLog.log"
    );
    if (err instanceof AppError) throw err;
    throw new AppError("Error during OTP verification", 500);
  } finally {
    connection.release();
  }
};

////////////////////////////////////////////////////////////////////////////////////////////////////////
// Resend OTP
////////////////////////////////////////////////////////////////////////////////////////////////////////
const resendOTP = async (
  userId: string,
  email: string
): Promise<OTPServiceResponse> => {
  const getOTP = await Auth.queryGetOTP(userId);
  const user = await Auth.queryGetUserById(userId);

  if (user.length === 0) {
    throw new AppError("User not found", 404);
  }

  if (getOTP.length === 0 && user[0].pending_email !== email) {
    throw new AppError(
      "Either account has already been verified or you have not signed up",
      404
    );
  }

  const otp = generateOTP();
  const hashedOTP = await bcrypt.hash(otp, AUTH_CONSTANTS.SALT_ROUNDS);
  const createdAt = Date.now().toString();
  const expiresAt = (Date.now() + AUTH_CONSTANTS.OTP_EXPIRY_MINUTES * 60 * 1000) // 15 minutes
    .toString();

  if (getOTP.length > 0) {
    await Auth.queryUpdateOTP(userId, hashedOTP, createdAt, expiresAt);
  } else if (user[0].pending_email === email) {
    await Auth.queryCreateOtp(userId, email, hashedOTP, createdAt, expiresAt);
  }

  // Send OTP email after successful transaction
  try {
    await sendOTPVerification(email, otp, "15 minutes", false);
  } catch (emailError) {
    await Logger.logEvents(
      `Error sending verification code: ${emailError}`,
      "errLog.log"
    );
    throw new AppError("Error sending verification code", 500);
  }

  return {
    success: true,
    message: "Verification code sent successfully",
  };
};

////////////////////////////////////////////////////////////////////////////////////////////////////////
// Forgot Password
////////////////////////////////////////////////////////////////////////////////////////////////////////
const forgotPassword = async (
  email: string
): Promise<{ data: { message: string } }> => {
  const user = await Auth.queryGetUserCredentials(email);

  if (user.length === 0) {
    throw new AppError("User not found", 404);
  }

  const otp = generateOTP();
  const hashedOTP = await bcrypt.hash(otp, AUTH_CONSTANTS.SALT_ROUNDS);
  const createdAt = Date.now().toString();
  const expiresAt = (
    Date.now() +
    AUTH_CONSTANTS.OTP_EXPIRY_MINUTES * 60 * 1000
  ).toString();

  const getOTP = await Auth.queryGetOTP(user[0].user_id);

  if (getOTP.length > 0) {
    await Auth.queryDeleteOTP(user[0].user_id);
  }

  await Auth.queryCreateOtp(
    user[0].user_id,
    email,
    hashedOTP,
    createdAt,
    expiresAt
  );

  const resetPasswordLink = `${process.env.FRONTEND_URL}/reset-password?email=${email}&token=${otp}`;

  try {
    await sendPasswordResetEmail(
      user[0].first_name,
      email,
      resetPasswordLink,
      "15 minutes"
    );
  } catch (emailError) {
    await Logger.logEvents(
      `Error sending verification code: ${emailError}`,
      "errLog.log"
    );
    throw new AppError("Error sending verification code", 500);
  }

  return {
    data: {
      message: "Reset password email sent successfully",
    },
  };
};

////////////////////////////////////////////////////////////////////////////////////////////////////////
// Reset password
////////////////////////////////////////////////////////////////////////////////////////////////////////
const resetPassword = async (
  email: string,
  otp: string,
  password: string
): Promise<{ data: { message: string } }> => {
  const user = await Auth.queryGetUserCredentials(email);

  if (user.length === 0) {
    throw new AppError("User not found", 404);
  }

  const getOTP = await Auth.queryGetOTP(user[0].user_id);

  if (getOTP.length === 0) {
    throw new AppError("No otp found", 404);
  }

  const match = await bcrypt.compare(otp, getOTP[0].hashed_otp);

  if (!match) {
    throw new AppError("Invalid OTP", 400);
  }

  if (parseInt(getOTP[0].expires_at) < Date.now()) {
    throw new AppError("OTP has expired", 400);
  }

  if (password.length < 8) {
    throw new AppError("Password must be at least 8 characters long", 400);
  }
  const hashedPassword = await bcrypt.hash(
    password,
    AUTH_CONSTANTS.SALT_ROUNDS
  );

  await Users.queryUpdateUsersPassword(
    user[0].user_id,
    hashedPassword,
    new Date()
  );

  await Auth.queryDeleteOTP(user[0].user_id);

  return {
    data: {
      message: "Password reset successfully",
    },
  };
};

////////////////////////////////////////////////////////////////////////////////////////////////////////
// Signup
////////////////////////////////////////////////////////////////////////////////////////////////////////
const signup = async (
  firstName: string,
  lastName: string,
  email: string,
  password: string
): Promise<AuthServiceResponse> => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Check if user exists within transaction
    const [userRows] = await connection.execute(
      "SELECT email FROM users WHERE email = ?",
      [email]
    );
    const [otpRows] = await connection.execute(
      "SELECT email FROM otp WHERE email = ?",
      [email]
    );

    if ((userRows as any[]).length > 0 || (otpRows as any[]).length > 0) {
      throw new AppError("User already exists!", 409);
    }

    const hashedPassword = await bcrypt.hash(
      password,
      AUTH_CONSTANTS.SALT_ROUNDS
    );
    const userId = uuidv4();
    const otp = generateOTP();
    const hashedOTP = await bcrypt.hash(otp, AUTH_CONSTANTS.SALT_ROUNDS);
    const createdAt = Date.now().toString();
    const expiresAt = (
      Date.now() +
      AUTH_CONSTANTS.OTP_EXPIRY_MINUTES * 60 * 1000
    ).toString();

    // Create user first
    await connection.execute(
      "INSERT INTO users (user_id, email, hashed_password, first_name, last_name, verified) VALUES (?,?,?,?,?,?)",
      [userId, email, hashedPassword, firstName, lastName, 0]
    );

    await connection.execute(
      "INSERT INTO users_profile (user_id, profile_status) VALUES (?, ?)",
      [userId, "incomplete"]
    );

    // Then add OTP
    await connection.execute(
      "INSERT INTO otp (user_id, email, hashed_otp, created_at, expires_at) VALUES (?,?,?,?,?)",
      [userId, email, hashedOTP, createdAt, expiresAt]
    );

    // Commit the transaction
    await connection.commit();

    // Send OTP email after successful transaction
    try {
      await sendOTPVerification(email, otp, "15 minutes", false);
    } catch (emailError) {
      await Logger.logEvents(
        `Error sending verification code: ${emailError}`,
        "errLog.log"
      );
      throw new AppError("Error sending verification code", 500);
    }

    return {
      success: true,
      data: {
        user: {
          user_id: userId,
          email: email,
        },
      },
    };
  } catch (err) {
    await connection.rollback();

    if (err instanceof AppError) throw err;

    // Check for specific MySQL errors
    const mysqlError = err as any;
    if (mysqlError.code === "ER_DUP_ENTRY") {
      throw new AppError("Email already registered", 409);
    }

    await Logger.logEvents(
      `Error during user registration: ${err}`,
      "errLog.log"
    );
    throw new AppError("Error during user registration", 500);
  } finally {
    connection.release();
  }
};

////////////////////////////////////////////////////////////////////////////////////////////////////////
// Login
////////////////////////////////////////////////////////////////////////////////////////////////////////
const login = async (
  email: string,
  password: string,
  res: Response
): Promise<AuthServiceResponse> => {
  const userCredentials = await Auth.queryGetUserCredentials(email);

  if (userCredentials.length === 0 || userCredentials[0].verified === 0) {
    throw new AppError("Unauthorized!", 401);
  }

  const match = await bcrypt.compare(
    password,
    userCredentials[0].hashed_password
  );
  if (!match) {
    throw new AppError("Unauthorized!", 401);
  }

  const tokenPayload: TokenPayload = {
    UserInfo: {
      userId: userCredentials[0].user_id,
      email: userCredentials[0].email,
    },
  };

  const accessToken = jwt.sign(
    tokenPayload,
    process.env.ACCESS_TOKEN_SECRET as string,
    { expiresIn: AUTH_CONSTANTS.ACCESS_TOKEN_EXPIRY }
  );

  const refreshToken = jwt.sign(
    { email: userCredentials[0].email, userId: userCredentials[0].user_id },
    process.env.REFRESH_TOKEN_SECRET as string,
    { expiresIn: AUTH_CONSTANTS.REFRESH_TOKEN_EXPIRY }
  );

  res.cookie(AUTH_CONSTANTS.COOKIE_NAME, refreshToken, DEFAULT_COOKIE_OPTIONS);

  return {
    success: true,
    data: {
      user: {
        user_id: userCredentials[0].user_id,
        email: userCredentials[0].email,
        first_name: userCredentials[0].first_name,
        last_name: userCredentials[0].last_name,
      },
      accessToken,
    },
  };
};

////////////////////////////////////////////////////////////////////////////////////////////////////////
// Refresh
////////////////////////////////////////////////////////////////////////////////////////////////////////
const refresh = async (cookies: {
  jwt?: string;
}): Promise<AuthServiceResponse> => {
  if (!cookies?.jwt) {
    throw new AppError("Unauthorized", 401);
  }

  const refreshToken = cookies.jwt;

  return new Promise((resolve, reject) => {
    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET as string,
      async (err, decoded) => {
        if (err) return reject(new AppError("Forbidden", 403));

        const decodedToken = decoded as DecodedToken;
        try {
          const foundUser = await Auth.queryGetUserCredentials(
            decodedToken.email
          );

          if (
            !foundUser?.length ||
            foundUser[0].user_id !== decodedToken.userId
          ) {
            return reject(new AppError("Unauthorized", 401));
          }

          const tokenPayload: TokenPayload = {
            UserInfo: {
              userId: foundUser[0].user_id,
              email: foundUser[0].email,
            },
          };

          const accessToken = jwt.sign(
            tokenPayload,
            process.env.ACCESS_TOKEN_SECRET as string,
            { expiresIn: AUTH_CONSTANTS.ACCESS_TOKEN_EXPIRY }
          );

          resolve({
            success: true,
            data: {
              user: {
                user_id: foundUser[0].user_id,
                email: foundUser[0].email,
                first_name: foundUser[0].first_name,
                last_name: foundUser[0].last_name,
              },
              accessToken,
            },
          });
        } catch (err) {
          await Logger.logEvents(`Error during refresh: ${err}`, "errLog.log");
          reject(new AppError("Server Error", 500));
        }
      }
    );
  });
};

////////////////////////////////////////////////////////////////////////////////////////////////////////
// Logout
////////////////////////////////////////////////////////////////////////////////////////////////////////
const logout = (cookies: { jwt?: string }, res: Response): void => {
  if (!cookies?.jwt) {
    throw new AppError("No cookie found", 400);
  }

  res.clearCookie(AUTH_CONSTANTS.COOKIE_NAME, {
    ...DEFAULT_COOKIE_OPTIONS,
    maxAge: undefined,
  });
};

export default {
  signup,
  login,
  refresh,
  logout,
  verifyOTP,
  resendOTP,
  forgotPassword,
  resetPassword,
};
