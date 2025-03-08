import Users from "../repositories/user.repositories";
import { ErrorResponse } from "../middlewares/error.handlers";

const getUsersInfo = async (userId: string) => {
  const usersInfo = await Users.queryGetUsersInfo(userId);

  if (usersInfo.length === 0) {
    throw new ErrorResponse("User not found", 404);
  }

  return usersInfo;
};

export default { getUsersInfo };
