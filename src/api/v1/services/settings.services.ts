import Settings from "../repositories/settings.repositories";
import { AppError } from "../middlewares/error.handlers";
import { v4 as uuidv4 } from "uuid";

const getSettings = async (userId: string) => {
  if (!userId) {
    throw new AppError("User ID is required", 400);
  }

  const settings = await Settings.queryGetSettings(userId);

  return settings;
};

export default {
  getSettings,
};
