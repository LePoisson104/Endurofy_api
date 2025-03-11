import Users from "../repositories/users.repositories";
import { AppError } from "../middlewares/error.handlers";
import { UserInfoServiceResponse } from "../interfaces/service.interfaces";

// should get user info including their profile (age, height, etc) from the profile table
// check if the user profile is compelete or not
// if not, return the user info with the profile not compelete
// if compelete, return the user info with the profile compelete
// requir the user to complete the profile if it is not compelete
const getUsersInfo = async (
  userId: string
): Promise<UserInfoServiceResponse> => {
  const usersInfo = await Users.queryGetUsersInfo(userId);

  if (usersInfo.length === 0) {
    throw new AppError("User not found", 404);
  }

  return {
    success: true,
    data: {
      userInfo: usersInfo[0],
    },
  };
};

export default { getUsersInfo };
