import Users from "../repositories/users.repositories";
import Auth from "../repositories/auth.repositories";
import { AppError } from "../middlewares/error.handlers";
import { UserInfoServiceResponse } from "../interfaces/service.interfaces";
import bcrypt from "bcrypt";
import {
  UserCredentialsUpdatePayload,
  UserProfileUpdatePayload,
} from "../interfaces/user.interfaces";
import { generateOTP } from "../helpers/generateOTP";
import pool from "../../../config/db.config";
import { sendOTPVerification } from "./sendOTPVerification.service";
import Logger from "../utils/logger";
import { getBMR } from "../helpers/getBMR";

////////////////////////////////////////////////////////////////////////////////////////////////////////
// Get User's Info
////////////////////////////////////////////////////////////////////////////////////////////////////////
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

////////////////////////////////////////////////////////////////////////////////////////////////////////
// Update User's Name
////////////////////////////////////////////////////////////////////////////////////////////////////////
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

////////////////////////////////////////////////////////////////////////////////////////////////////////
// Initiate Email Change
////////////////////////////////////////////////////////////////////////////////////////////////////////
const initiateEmailChange = async (
  userId: string,
  updateEmailPayload: UserCredentialsUpdatePayload
): Promise<{ data: { message: string } }> => {
  const { email, newEmail, password } = updateEmailPayload;
  const connection = await pool.getConnection();

  // Retrieve user credentials
  const userCredentials = await Auth.queryGetUserCredentials(email);
  if (userCredentials.length === 0) {
    throw new AppError("User not found", 404);
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(
    password,
    userCredentials[0].hashed_password
  );
  if (!isPasswordValid) {
    throw new AppError("Invalid password", 401);
  }

  // Check if newEmail is already in use
  const [existingEmail] = await connection.execute(
    "SELECT user_id FROM users WHERE email = ?",
    [newEmail]
  );
  if ((existingEmail as any[]).length > 0) {
    throw new AppError("New email is already in use", 409);
  }

  try {
    await connection.beginTransaction(); // Start transaction after all checks

    // Generate OTP
    const otp = generateOTP();
    const hashedOTP = await bcrypt.hash(otp, 10);
    const createdAt = Date.now().toString();
    const expiresAt = (Date.now() + 24 * 60 * 60 * 1000).toString(); // 24 hours

    // Update pending email
    await connection.execute(
      "UPDATE users SET pending_email = ? WHERE user_id = ?",
      [newEmail, userId]
    );

    // Store OTP for verification
    await connection.execute(
      "INSERT INTO otp (user_id, email, hashed_otp, created_at, expires_at) VALUES (?, ?, ?, ?, ?)",
      [userId, newEmail, hashedOTP, createdAt, expiresAt]
    );

    // Commit transaction
    await connection.commit();

    // Send OTP email after transaction success
    await sendOTPVerification(newEmail, otp, "24 hours", true);

    return {
      data: {
        message:
          "Email change initiated. Please check your new email for verification code.",
      },
    };
  } catch (err) {
    await connection.rollback();
    await Logger.logEvents(
      `Error initiating email change: ${err}`,
      "errLog.log"
    );
    throw new AppError("Error initiating email change", 500);
  } finally {
    connection.release();
  }
};

////////////////////////////////////////////////////////////////////////////////////////////////////////
// Verify Update Email
////////////////////////////////////////////////////////////////////////////////////////////////////////
const verifyUpdateEmail = async (
  userId: string,
  otp: string
): Promise<{ data: { message: string } }> => {
  const connection = await pool.getConnection();
  const [pendingEmailResult] = await connection.execute(
    "SELECT pending_email FROM users WHERE user_id = ?",
    [userId]
  );
  const pendingEmail = (pendingEmailResult as { pending_email: string }[])[0]
    ?.pending_email;

  if (!pendingEmail) {
    throw new AppError("No pending email found", 404);
  }

  // Retrieve OTP record
  const [otpResult] = await connection.execute(
    "SELECT user_id, hashed_otp, expires_at FROM otp WHERE email = ?",
    [pendingEmail]
  );
  const otpRecord = (
    otpResult as { user_id: string; hashed_otp: string; expires_at: string }[]
  )[0];

  if (!otpRecord) {
    throw new AppError("No OTP found", 404);
  }

  // Validate OTP expiration
  if (parseInt(otpRecord.expires_at) < Date.now()) {
    throw new AppError("OTP expired", 400);
  }

  // Validate OTP hash
  const match = await bcrypt.compare(otp, otpRecord.hashed_otp);
  if (!match) {
    throw new AppError("Invalid OTP", 400);
  }

  try {
    // Retrieve pending email

    // Start transaction for updating email
    await connection.beginTransaction();
    const updatedAt = new Date();

    await connection.execute(
      "UPDATE users SET email = ?, pending_email = NULL, updated_at = ? WHERE user_id = ?",
      [pendingEmail, updatedAt, userId]
    );

    await connection.execute("DELETE FROM otp WHERE user_id = ?", [userId]);

    await connection.commit();

    return {
      data: {
        message: "Email updated successfully",
      },
    };
  } catch (err) {
    await connection.rollback();
    await Logger.logEvents(
      `Error verifying update email: ${err}`,
      "errLog.log"
    );
    throw new AppError("Error verifying update email", 500);
  } finally {
    connection.release();
  }
};

////////////////////////////////////////////////////////////////////////////////////////////////////////
// Update User's Profile
////////////////////////////////////////////////////////////////////////////////////////////////////////
const updateUsersProfile = async (
  userId: string,
  updateProfilePayload: UserProfileUpdatePayload
): Promise<{ data: { message: string } }> => {
  if (
    updateProfilePayload.birth_date &&
    updateProfilePayload.weight &&
    updateProfilePayload.height &&
    updateProfilePayload.gender &&
    updateProfilePayload.weight_unit &&
    updateProfilePayload.height_unit &&
    updateProfilePayload.profile_status === "incomplete"
  ) {
    const BMR = getBMR(
      updateProfilePayload.birth_date,
      updateProfilePayload.gender,
      updateProfilePayload.weight,
      updateProfilePayload.weight_unit,
      updateProfilePayload.height,
      updateProfilePayload.height_unit
    );
    updateProfilePayload.profile_status = "complete";
    updateProfilePayload.BMR = BMR;
  } else if (
    updateProfilePayload.profile_status === "complete" &&
    (updateProfilePayload.birth_date ||
      updateProfilePayload.weight ||
      updateProfilePayload.height ||
      updateProfilePayload.gender)
  ) {
    const userProfile = await Users.queryGetUsersProfile(userId);
    if (userProfile.length === 0) {
      throw new AppError("User profile not found", 404);
    }

    const profileData = userProfile[0];

    // Check if any value in userProfile[0] is null or undefined
    const hasNullOrUndefined = Object.values(profileData).some(
      (value) => value == null || value == undefined || value == ""
    );

    if (hasNullOrUndefined) {
      const updateProfileStatus: UserProfileUpdatePayload = {
        profile_status: "incomplete",
      };
      await Users.queryUpdateUsersProfile(userId, updateProfileStatus);
      throw new AppError(
        "Incomplete user profile data for BMR calculation",
        400
      );
    }

    const birth_date =
      updateProfilePayload.birth_date || profileData.birth_date;
    const weight = updateProfilePayload.weight || profileData.weight;
    const height = updateProfilePayload.height || profileData.height;
    const gender = updateProfilePayload.gender || profileData.gender;
    const weight_unit =
      updateProfilePayload.weight_unit || profileData.weight_unit;
    const height_unit =
      updateProfilePayload.height_unit || profileData.height_unit;

    const BMR = getBMR(
      birth_date,
      gender,
      weight,
      weight_unit,
      height,
      height_unit
    );
    updateProfilePayload.BMR = BMR;
  }

  updateProfilePayload.updated_at = new Date();
  await Users.queryUpdateUsersProfile(userId, updateProfilePayload);

  return {
    data: {
      message: "Profile updated successfully",
    },
  };
};

////////////////////////////////////////////////////////////////////////////////////////////////////////
// Update Password
////////////////////////////////////////////////////////////////////////////////////////////////////////
const updateUsersPassword = async (
  userId: string,
  updatePasswordPayload: UserCredentialsUpdatePayload
): Promise<{ data: { message: string } }> => {
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

  const updateAt = new Date();
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await Users.queryUpdateUsersPassword(userId, hashedPassword, updateAt);

  return {
    data: {
      message: "Password updated successfully",
    },
  };
};

////////////////////////////////////////////////////////////////////////////////////////////////////////
// Delete Account
////////////////////////////////////////////////////////////////////////////////////////////////////////
const deleteAccount = async (
  userId: string,
  email: string,
  password: string
): Promise<{ data: { message: string } }> => {
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

  await Users.queryDeleteUser(getCredential[0].user_id);

  return {
    data: {
      message: "User deleted successfully",
    },
  };
};

export default {
  getUsersInfo,
  deleteAccount,
  updateUsersName,
  updateUsersPassword,
  initiateEmailChange,
  verifyUpdateEmail,
  updateUsersProfile,
};
