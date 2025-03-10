import Users from "../repositories/user.repositories";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";
import { AppError } from "../middlewares/error.handlers";
import { Response } from "express";
import { DecodedToken } from "../interfaces/decoded.interface";
import { generateOTP } from "../helpers/generateOTP";
import { htmlContent } from "../helpers/html.content";
import { transporter } from "../../../config/nodemailer.config";
import { TokenPayload, CookieOptions } from "../interfaces/auth.interfaces";
import {
  AuthServiceResponse,
  OTPServiceResponse,
  TokenServiceResponse,
} from "../interfaces/service.interfaces";

// Constants
const AUTH_CONSTANTS = {
  SALT_ROUNDS: 10,
  ACCESS_TOKEN_EXPIRY: "30s",
  REFRESH_TOKEN_EXPIRY: "7d",
  OTP_EXPIRY_MINUTES: 15,
  COOKIE_NAME: "jwt",
} as const;

const DEFAULT_COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "none",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

const sendOTPVerification = async (
  email: string,
  otp: string
): Promise<void> => {
  await transporter.sendMail({
    from: '"Endurofy" <endurofy@gmail.com>',
    to: email,
    subject: "Your Verification Code",
    text: `Your verification code is: ${otp}. It will expire in ${AUTH_CONSTANTS.OTP_EXPIRY_MINUTES} minutes.`,
    html: htmlContent(otp),
  });
};

const verifyOTP = async (
  email: string,
  otp: string
): Promise<OTPServiceResponse> => {
  const getOTP = await Users.queryGetOTP(email);

  if (getOTP.length === 0) {
    throw new AppError(
      "Either account has already been verified or you have not signed up",
      404
    );
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

  await Users.queryDeleteOTP(email);
  await Users.queryUpdateUsersVerificationStatus(email, 1);

  return {
    success: true,
    message: "OTP verified successfully",
  };
};

const resendOTP = async (email: string): Promise<OTPServiceResponse> => {
  const getOTP = await Users.queryGetOTP(email);

  if (getOTP.length === 0) {
    throw new AppError(
      "Either account has already been verified or you have not signed up",
      404
    );
  }

  const otp = generateOTP();
  const hashedOTP = await bcrypt.hash(otp, AUTH_CONSTANTS.SALT_ROUNDS);
  const createdAt = Date.now().toString();
  const expiresAt = (
    Date.now() +
    AUTH_CONSTANTS.OTP_EXPIRY_MINUTES * 60 * 1000
  ).toString();

  await Users.queryUpdateOTP(email, hashedOTP, createdAt, expiresAt);
  await sendOTPVerification(email, otp);

  return {
    success: true,
    message: "OTP sent successfully",
  };
};

const signup = async (
  firstName: string,
  lastName: string,
  email: string,
  password: string
): Promise<AuthServiceResponse> => {
  const userExists = await Users.queryCheckUserExists(email);
  if (userExists) {
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

  await Users.queryAddOTP(email, hashedOTP, createdAt, expiresAt);

  const newUser = await Users.queryCreateNewUser(
    userId,
    firstName,
    lastName,
    email,
    hashedPassword
  );

  if (!newUser) {
    throw new AppError("Error creating new user", 500);
  }

  await sendOTPVerification(email, otp);

  return {
    success: true,
    data: {
      user: {
        user_id: userId,
        email,
        first_name: firstName,
        last_name: lastName,
      },
    },
  };
};

const login = async (
  email: string,
  password: string,
  res: Response
): Promise<AuthServiceResponse> => {
  const userCredentials = await Users.queryGetUserCredentials(email);

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

const refresh = async (cookies: {
  jwt?: string;
}): Promise<TokenServiceResponse> => {
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
          const foundUser = await Users.queryGetUserCredentials(
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

          resolve({ accessToken });
        } catch (err) {
          reject(new AppError("Server Error", 500));
        }
      }
    );
  });
};

const logout = (cookies: { jwt?: string }, res: Response): void => {
  if (!cookies?.jwt) {
    throw new AppError("No cookie found", 400);
  }

  res.clearCookie(AUTH_CONSTANTS.COOKIE_NAME, {
    ...DEFAULT_COOKIE_OPTIONS,
    maxAge: undefined,
  });
};

export default { signup, login, refresh, logout, verifyOTP, resendOTP };
