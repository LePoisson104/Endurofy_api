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
import WeightLogs from "../repositories/weight-log.repositories";

////////////////////////////////////////////////////////////////////////////////////////////////////////
// Get User's Info
////////////////////////////////////////////////////////////////////////////////////////////////////////
const getUsersInfo = async (
  userId: string
): Promise<UserInfoServiceResponse> => {
  const userResponse = await Users.GetUsersInfo(userId);

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
  await Users.UpdateUsersName(userId, firstName, lastName, updatedAt);

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

  try {
    await connection.beginTransaction();

    const userCredentials = await Auth.GetUserCredentials(email, connection);

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

    await Auth.CreateOtp(
      userId,
      newEmail,
      hashedOTP,
      createdAt,
      expiresAt,
      connection
    );

    // Commit transaction
    await connection.commit();

    // Send OTP email after transaction success
    await sendOTPVerification(newEmail, otp, "24 hours", true);
  } catch (err) {
    await connection.rollback();
    await Logger.logEvents(
      `Error initiating email change: ${err}`,
      "errLog.log"
    );
    if (err instanceof AppError) throw err;
    throw new AppError("Error initiating email change", 500);
  } finally {
    connection.release();
  }

  return {
    data: {
      message:
        "Email change initiated. Please check your new email for verification code.",
    },
  };
};

////////////////////////////////////////////////////////////////////////////////////////////////////////
// Verify Update Email
////////////////////////////////////////////////////////////////////////////////////////////////////////
const verifyUpdateEmail = async (
  userId: string,
  otp: string
): Promise<{ data: { message: string } }> => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Check for pending email
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
      throw new AppError("No verification code found", 404);
    }

    // Validate OTP expiration
    if (parseInt(otpRecord.expires_at) < Date.now()) {
      throw new AppError("Verification code has expired", 400);
    }

    // Validate OTP hash
    const match = await bcrypt.compare(otp, otpRecord.hashed_otp);
    if (!match) {
      throw new AppError("Invalid verification code", 400);
    }

    // Update email and clean up OTP
    const updatedAt = new Date();

    await connection.execute(
      "UPDATE users SET email = ?, pending_email = NULL, updated_at = ? WHERE user_id = ?",
      [pendingEmail, updatedAt, userId]
    );

    await connection.execute("DELETE FROM otp WHERE user_id = ?", [userId]);

    await connection.commit();
  } catch (err) {
    await connection.rollback();
    await Logger.logEvents(
      `Error verifying update email: ${err}`,
      "errLog.log"
    );

    // Re-throw AppError as-is, wrap other errors
    if (err instanceof AppError) throw err;
    throw new AppError("Error verifying update email", 500);
  } finally {
    connection.release();
  }

  return {
    data: {
      message: "Email updated successfully",
    },
  };
};

////////////////////////////////////////////////////////////////////////////////////////////////////////
// Update User's Profile
////////////////////////////////////////////////////////////////////////////////////////////////////////
const updateUsersProfile = async (
  userId: string,
  updateProfilePayload: UserProfileUpdatePayload
): Promise<{ data: { message: string } }> => {
  if (
    !updateProfilePayload.starting_weight ||
    !updateProfilePayload.weight_goal ||
    !updateProfilePayload.goal ||
    !updateProfilePayload.starting_weight_unit ||
    !updateProfilePayload.weight_goal_unit ||
    !updateProfilePayload.current_weight ||
    !updateProfilePayload.current_weight_unit ||
    !updateProfilePayload.height ||
    !updateProfilePayload.height_unit ||
    !updateProfilePayload.gender ||
    !updateProfilePayload.activity_level
  ) {
    throw new AppError("All fields are required", 400);
  }

  const isMetricUnits =
    updateProfilePayload.starting_weight_unit === "kg" &&
    updateProfilePayload.current_weight_unit === "kg" &&
    updateProfilePayload.height_unit === "cm" &&
    updateProfilePayload.weight_goal_unit === "kg";

  const isUSUnits =
    updateProfilePayload.starting_weight_unit === "lb" &&
    updateProfilePayload.current_weight_unit === "lb" &&
    updateProfilePayload.height_unit === "ft" &&
    updateProfilePayload.weight_goal_unit === "lb";

  if (
    updateProfilePayload.starting_weight <= updateProfilePayload.weight_goal &&
    updateProfilePayload.goal === "lose"
  ) {
    throw new AppError(
      "Starting weight cannot be greater than or equal to weight goal when losing weight",
      400
    );
  }

  if (
    updateProfilePayload.starting_weight >= updateProfilePayload.weight_goal &&
    updateProfilePayload.goal === "gain"
  ) {
    throw new AppError(
      "Starting weight cannot be less than or equal to weight goal when gaining weight",
      400
    );
  }

  if (!isMetricUnits && !isUSUnits) {
    throw new AppError(
      "Make sure your height and weight units are either all in US units or all in metric units",
      400
    );
  }

  if (updateProfilePayload.birth_date) {
    const birthDate = new Date(updateProfilePayload.birth_date);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    if (age < 18) {
      throw new AppError(
        "You must be at least 12 years old or older to use this app",
        400
      );
    }
  }

  if (
    updateProfilePayload.profile_status === "incomplete" &&
    updateProfilePayload.birth_date &&
    updateProfilePayload.current_weight &&
    updateProfilePayload.current_weight_unit &&
    updateProfilePayload.starting_weight &&
    updateProfilePayload.starting_weight_unit &&
    updateProfilePayload.height &&
    updateProfilePayload.height_unit &&
    updateProfilePayload.gender &&
    updateProfilePayload.goal &&
    updateProfilePayload.activity_level
  ) {
    updateProfilePayload.profile_status = "complete";
    updateProfilePayload.current_weight = updateProfilePayload.starting_weight;
    updateProfilePayload.current_weight_unit =
      updateProfilePayload.starting_weight_unit;
  } else {
    const usersProfile = await Users.GetUsersProfile(userId);

    if (
      usersProfile[0].starting_weight !== updateProfilePayload.starting_weight
    ) {
      updateProfilePayload.current_weight =
        updateProfilePayload.starting_weight;
      updateProfilePayload.current_weight_unit =
        updateProfilePayload.starting_weight_unit;
    }
  }

  updateProfilePayload.updated_at = new Date();

  await Users.UpdateUsersProfile(userId, updateProfilePayload);

  return {
    data: {
      message: "Profile updated successfully",
    },
  };
};

////////////////////////////////////////////////////////////////////////////////////////////////////////
// Update User's Profile and convert all weight logs to new weight unit
////////////////////////////////////////////////////////////////////////////////////////////////////////
const updateUsersProfileAndConvertWeightLogs = async (
  userId: string,
  updateProfilePayload: UserProfileUpdatePayload
): Promise<{ data: { message: string } }> => {
  if (
    !updateProfilePayload.starting_weight ||
    !updateProfilePayload.weight_goal ||
    !updateProfilePayload.goal ||
    !updateProfilePayload.starting_weight_unit ||
    !updateProfilePayload.weight_goal_unit ||
    !updateProfilePayload.current_weight ||
    !updateProfilePayload.current_weight_unit ||
    !updateProfilePayload.height ||
    !updateProfilePayload.height_unit ||
    !updateProfilePayload.gender ||
    !updateProfilePayload.activity_level
  ) {
    throw new AppError("All fields are required", 400);
  }

  const isMetricUnits =
    updateProfilePayload.starting_weight_unit === "kg" &&
    updateProfilePayload.current_weight_unit === "kg" &&
    updateProfilePayload.height_unit === "cm" &&
    updateProfilePayload.weight_goal_unit === "kg";

  const isUSUnits =
    updateProfilePayload.starting_weight_unit === "lb" &&
    updateProfilePayload.current_weight_unit === "lb" &&
    updateProfilePayload.height_unit === "ft" &&
    updateProfilePayload.weight_goal_unit === "lb";

  if (!isMetricUnits && !isUSUnits) {
    throw new AppError(
      "Make sure your height and weight units are either all in US units or all in metric units",
      400
    );
  }

  if (
    updateProfilePayload.starting_weight < updateProfilePayload.weight_goal &&
    updateProfilePayload.goal === "lose"
  ) {
    throw new AppError(
      "Starting weight cannot be less than weight goal when losing weight",
      400
    );
  }

  if (
    updateProfilePayload.starting_weight > updateProfilePayload.weight_goal &&
    updateProfilePayload.goal === "gain"
  ) {
    throw new AppError(
      "Starting weight cannot be greater than weight goal when gaining weight",
      400
    );
  }

  const connection = await pool.getConnection();

  updateProfilePayload.updated_at = new Date();

  try {
    await connection.beginTransaction();

    const weightLogs = await WeightLogs.GetAllWeightLog(userId, connection);

    const newWeightValues = [];

    if (updateProfilePayload.current_weight_unit === "kg") {
      // convert all weight logs to kg
      for (const log of weightLogs) {
        if (log.weight_unit === "lb") {
          // Convert lb to kg (1 lb = 0.45359237 kg)
          const newWeight = Number(log.weight) * 0.45359237;
          newWeightValues.push({
            weight_log_id: log.weight_log_id,
            weight: newWeight.toFixed(2),
            weight_unit: "kg",
          });
        }
      }
    } else if (updateProfilePayload.current_weight_unit === "lb") {
      // convert all weight logs to lb
      for (const log of weightLogs) {
        if (log.weight_unit === "kg") {
          // Convert kg to lb (1 kg = 2.20462262 lb)
          const newWeight = Number(log.weight) * 2.20462262;
          newWeightValues.push({
            weight_log_id: log.weight_log_id,
            weight: newWeight.toFixed(2),
            weight_unit: "lb",
          });
        }
      }
    }

    const updateFields = Object.keys(updateProfilePayload)
      .map((key) => `${key} = ?`)
      .join(", ");

    const values = Object.values(updateProfilePayload);
    values.push(userId); // Add userId for WHERE clause

    const query = `UPDATE users_profile SET ${updateFields} WHERE user_id = ?`;

    await connection.execute(query, values);

    for (const newValue of newWeightValues) {
      await connection.execute(
        "UPDATE weight_log SET weight = ?, weight_unit = ? WHERE weight_log_id = ?",
        [newValue.weight, newValue.weight_unit, newValue.weight_log_id]
      );
    }

    await connection.commit();
  } catch (err) {
    await connection.rollback();
    await Logger.logEvents(
      `Error updating user's profile: ${err}`,
      "errLog.log"
    );
    throw new AppError("Error updating user's profile", 500);
  } finally {
    connection.release();
  }

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
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Get user credentials using the same connection
    const getCredential = await Auth.GetUserCredentials(email, connection);

    if (getCredential.length === 0) {
      throw new AppError("User not found", 404);
    }

    if (getCredential[0].user_id !== userId) {
      throw new AppError("Invalid userId", 400);
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(
      password,
      getCredential[0].hashed_password
    );

    if (!isPasswordValid) {
      throw new AppError("Invalid password", 401);
    }

    // Update password
    const updateAt = new Date();
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await Users.UpdateUsersPassword(
      userId,
      hashedPassword,
      updateAt,
      connection
    );

    await connection.commit();
  } catch (err) {
    await connection.rollback();
    await Logger.logEvents(
      `Error updating user's password: ${err}`,
      "errLog.log"
    );

    // Re-throw AppError as-is, wrap other errors
    if (err instanceof AppError) throw err;
    throw new AppError("Error updating user's password", 500);
  } finally {
    connection.release();
  }

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
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const getCredential = await Auth.GetUserCredentials(email, connection);

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

    await connection.execute("DELETE FROM users WHERE user_id = ?", [
      getCredential[0].user_id,
    ]);

    await connection.commit();
  } catch (err) {
    await connection.rollback();
    await Logger.logEvents(`Error deleting user: ${err}`, "errLog.log");
    if (err instanceof AppError) throw err;
    throw new AppError("Error deleting user", 500);
  } finally {
    connection.release();
  }
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
  updateUsersProfileAndConvertWeightLogs,
};
