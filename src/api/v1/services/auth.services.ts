import Users from "../repositories/user.repositories";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";
import { ErrorResponse } from "../middlewares/error.handlers";
import { Response } from "express";
import { DecodedToken } from "../interfaces/decoded.interface";
import { generateOTP } from "../helpers/generateOTP";
import { htmlContent } from "../helpers/html.content";
import { transporter } from "../../../config/nodemailer.config";

const sendOTPVerification = async (
  email: string,
  otp: string
): Promise<any> => {
  await transporter.sendMail({
    from: '"Endurofy" <endurofy@gmail.com>',
    to: email,
    subject: "Your Verification Code",
    text: `Your verification code is: ${otp}. It will expire in 15 minutes.`,
    html: htmlContent(otp),
  });
};

const verifyOTP = async (email: string, otp: string) => {
  const getOTP = await Users.queryGetOTP(email);

  if (getOTP.length === 0) {
    throw new ErrorResponse(
      "Either account has already been verified or you have not signup",
      404
    );
  }

  const match = await bcrypt.compare(otp, getOTP[0].hashed_otp);

  if (!match) {
    throw new ErrorResponse("Invalid verification code", 400);
  }

  if (parseInt(getOTP[0].expires_at) < Date.now()) {
    throw new ErrorResponse(
      "Verification code has already been expired, please request for a new one",
      400
    );
  }

  await Users.queryDeleteOTP(email);
  const status = await Users.queryUpdateUsersVerificationStatus(email, 1); // 1 for true

  return;
};

const resendOTP = async (email: string) => {
  const getOTP = await Users.queryGetOTP(email);

  if (getOTP.length === 0) {
    throw new ErrorResponse(
      "Either account has already been verified or you have not signup",
      404
    );
  }

  const otp = generateOTP();
  const hashedOTP: string = await bcrypt.hash(otp, 10);
  const createdAt: string = Date.now().toString();
  const expiresAt: string = (Date.now() + 15 * 60 * 1000).toString();

  await Users.queryUpdateOTP(email, hashedOTP, createdAt, expiresAt);

  // Send OTP email
  await sendOTPVerification(email, otp);

  return;
};

const signup = async (
  firstName: string,
  lastName: string,
  email: string,
  password: string
) => {
  const hashedPassword = await bcrypt.hash(password, 10); // 10 salt
  const userId = uuidv4();

  const userExists = await Users.queryCheckUserExists(email);

  if (userExists) {
    throw new ErrorResponse("User already exists!", 409);
  }

  const otp = generateOTP();
  const hashedOTP: string = await bcrypt.hash(otp, 10);
  const createdAt: string = Date.now().toString();
  const expiresAt: string = (Date.now() + 15 * 60 * 1000).toString();

  // wait for otp to be insert into table
  await Users.queryAddOTP(email, hashedOTP, createdAt, expiresAt);

  const newUser = await Users.queryCreateNewUser(
    userId,
    firstName,
    lastName,
    email,
    hashedPassword
  );

  if (!newUser) {
    throw new ErrorResponse("Error creating new user", 500);
  }

  await sendOTPVerification(email, otp);

  return;
};

const login = async (email: string, password: string, res: Response) => {
  const userCredentials = await Users.queryGetUserCredentials(email);

  if (userCredentials.length === 0 || userCredentials[0].verified === 0) {
    throw new ErrorResponse("Unauthorized!", 401);
  }

  const match = await bcrypt.compare(
    password,
    userCredentials[0].hashed_password
  );

  if (!match) {
    throw new ErrorResponse("Unauthorized!", 401);
  }

  const accessToken = jwt.sign(
    {
      UserInfo: {
        userId: userCredentials[0].user_id,
        email: userCredentials[0].email,
      },
    },
    process.env.ACCESS_TOKEN_SECRET as string,
    { expiresIn: "30s" }
  );

  const refreshToken = jwt.sign(
    { email: userCredentials[0].email, userId: userCredentials[0].user_id },
    process.env.REFRESH_TOKEN_SECRET as string,
    { expiresIn: "7d" }
  );

  //   Create secure cookie with refresh token
  res.cookie("jwt", refreshToken, {
    httpOnly: true, // accessible only by web server
    secure: true, // https
    sameSite: "none", // cross-site cookie
    maxAge: 7 * 24 * 60 * 60 * 1000, // cookie expiry: set to match rT
  });

  return accessToken;
};

const refresh = async (cookies: { jwt?: string }): Promise<string> => {
  if (!cookies?.jwt) {
    throw new ErrorResponse("Unauthorized", 401);
  }

  const refreshToken = cookies.jwt;

  return new Promise((resolve, reject) => {
    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET as string,
      async (err, decoded) => {
        if (err) {
          return reject(new ErrorResponse("Forbidden", 401));
        }
        const decodedToken = decoded as DecodedToken;

        try {
          const foundUser = await Users.queryGetUserCredentials(
            decodedToken.email
          );

          if (!foundUser || foundUser.length === 0) {
            return reject(new ErrorResponse("Unauthorized", 401));
          }
          if (foundUser[0].user_id !== decodedToken.userId) {
            return reject(new ErrorResponse("Unauthorized", 401));
          }

          const accessToken = jwt.sign(
            {
              UserInfo: {
                userId: foundUser[0].user_id,
                email: foundUser[0].email,
              },
            },
            process.env.ACCESS_TOKEN_SECRET as string,
            { expiresIn: "30s" }
          );
          resolve(accessToken);
        } catch (err) {
          reject(new ErrorResponse("Server Error", 500)); // Catch any additional errors and reject
        }
      }
    );
  });
};

const logout = (cookies: { jwt?: string }, res: Response) => {
  if (!cookies?.jwt) {
    throw new ErrorResponse("No Cookies", 400); // no content
  }

  res.clearCookie("jwt", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });

  return res.status(200).json({ message: "Cookie Cleared" });
};

export default { signup, login, refresh, logout, verifyOTP, resendOTP };
