import Users from "../repositories/users.repositories";
import Auth from "../repositories/auth.repositories";
import { AppError } from "../middlewares/error.handlers";
import { UserInfoServiceResponse } from "../interfaces/service.interfaces";
import bcrypt from "bcrypt";

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

const deleteAccount = async (email: string, password: string): Promise<any> => {
  const getCredential = await Auth.queryGetUserCredentials(email);

  if (getCredential.length === 0) {
    throw new AppError("User not found", 404);
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

export default { getUsersInfo, deleteAccount };
