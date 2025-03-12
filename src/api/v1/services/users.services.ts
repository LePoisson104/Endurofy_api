import Users from "../repositories/users.repositories";
import Auth from "../repositories/auth.repositories";
import { AppError } from "../middlewares/error.handlers";
import { UserInfoServiceResponse } from "../interfaces/service.interfaces";
import bcrypt from "bcrypt";
import { UserCredentialsUpdatePayload } from "../interfaces/user.interfaces";
import { logger } from "../utils/logger";
import { v4 as uuidv4 } from "uuid";
import { transporter } from "../../../config/nodemailer.config";

const AUTH_CONSTANTS = {
  SALT_ROUNDS: 10,
  EMAIL_CHANGE_TOKEN_EXPIRY: 24 * 60 * 60 * 1000, // 24 hours
} as const;

const sendEmailChangeVerification = async (
  email: string,
  token: string
): Promise<void> => {
  const verificationLink = `${process.env.FRONTEND_URL}/verify-email-change?token=${token}`;

  await transporter.sendMail({
    from: '"Endurofy" <endurofy@gmail.com>',
    to: email,
    subject: "Verify Your New Email Address",
    text: `Please click the following link to verify your new email address: ${verificationLink}. This link will expire in 24 hours.`,
    html: `
      <h1>Verify Your New Email Address</h1>
      <p>Please click the following link to verify your new email address:</p>
      <a href="${verificationLink}">${verificationLink}</a>
      <p>This link will expire in 24 hours.</p>
    `,
  });
};

const getUsersInfo = async (
  userId: string
): Promise<UserInfoServiceResponse> => {
  const userResponse = await Users.queryGetUsersInfo(userId);

  const usersInfo = {
    ...userResponse.user,
    ...userResponse.userProfile,
    user_updated_at: userResponse.user.updated_at?.toISOString(),
    user_profile_updated_at: userResponse.userProfile.updated_at?.toISOString(),
  };

  delete usersInfo.updated_at;

  return {
    data: {
      userInfo: usersInfo,
    },
  };
};

const updateUsersName = async (
  userId: string,
  userUpdatePayload: UserCredentialsUpdatePayload
): Promise<any> => {
  const { firstName, lastName } = userUpdatePayload;
  const updatedAt = new Date();
  await Users.queryUpdateUsersName(userId, firstName, lastName, updatedAt);

  return {
    data: {
      message: "Name updated successfully",
    },
  };
};

const initiateEmailChange = async (
  userId: string,
  currentEmail: string,
  newEmail: string,
  password: string
): Promise<{ data: { message: string } }> => {
  try {
    // Verify current password
    const userCredentials = await Auth.queryGetUserCredentials(currentEmail);

    if (userCredentials.length === 0) {
      throw new AppError("User not found", 404);
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      userCredentials[0].hashed_password
    );

    if (!isPasswordValid) {
      throw new AppError("Invalid password", 401);
    }

    // Generate verification token
    const changeToken = uuidv4();
    const tokenExpiresAt = new Date(
      Date.now() + AUTH_CONSTANTS.EMAIL_CHANGE_TOKEN_EXPIRY
    );

    // Save pending email change
    await Users.queryInitiateEmailChange(
      userId,
      newEmail,
      changeToken,
      tokenExpiresAt
    );

    // Send verification email
    await sendEmailChangeVerification(newEmail, changeToken);
    await logger.info(
      `Email change initiated for user ${userId} to ${newEmail}`
    );

    return {
      data: {
        message:
          "Email change initiated. Please check your new email for verification.",
      },
    };
  } catch (err) {
    await logger.error(
      `Error initiating email change for user ${userId}: ${err}`
    );
    if (err instanceof AppError) throw err;
    throw new AppError("Error initiating email change", 500);
  }
};

const confirmEmailChange = async (
  userId: string,
  token: string
): Promise<{ data: { message: string } }> => {
  try {
    await Users.queryConfirmEmailChange(userId, token);
    await logger.info(`Email change confirmed for user ${userId}`);

    return {
      data: {
        message: "Email changed successfully",
      },
    };
  } catch (err) {
    await logger.error(
      `Error confirming email change for user ${userId}: ${err}`
    );
    if (err instanceof AppError) throw err;
    throw new AppError("Error confirming email change", 500);
  }
};

const updateUsersPassword = async (
  userId: string,
  updatePasswordPayload: UserCredentialsUpdatePayload
) => {
  const { email, password, newPassword } = updatePasswordPayload;

  const getCredential = await Auth.queryGetUserCredentials(email);

  if (getCredential.length === 0) {
    throw new AppError("User not found", 404);
  }

  if (getCredential[0].user_id !== userId) {
    throw new AppError("Invalid userId", 400);
  }

  const isPasswordValid = await bcrypt.compare(
    password,
    getCredential[0].hashed_password
  );

  if (!isPasswordValid) {
    throw new AppError("Invalid password", 401);
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await Users.queryUpdateUsersPassword(userId, hashedPassword);

  return {
    data: {
      message: "Password updated successfully",
    },
  };
};

const deleteAccount = async (
  userId: string,
  email: string,
  password: string
): Promise<any> => {
  const getCredential = await Auth.queryGetUserCredentials(email);

  if (getCredential.length === 0) {
    throw new AppError("User not found", 404);
  }

  if (getCredential[0].user_id !== userId) {
    throw new AppError("Invalid userId", 400);
  }

  const isPasswordValid = await bcrypt.compare(
    password,
    getCredential[0].hashed_password
  );

  if (!isPasswordValid) {
    throw new AppError("Invalid password", 401);
  }

  const deleteUser = await Users.queryDeleteUser(getCredential[0].user_id);

  return {
    data: {
      userInfo: deleteUser,
    },
  };
};

export default {
  getUsersInfo,
  deleteAccount,
  updateUsersName,
  updateUsersPassword,
  initiateEmailChange,
  confirmEmailChange,
};
