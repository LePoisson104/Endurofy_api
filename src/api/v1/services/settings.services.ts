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

const toggleTheme = async (userId: string, theme: string) => {
  if (!userId) {
    throw new AppError("User ID is required", 400);
  }

  const updatedAt = new Date();

  const settings = await Settings.queryToggleTheme(userId, theme, updatedAt);

  if (settings.affectedRows === 0) {
    throw new AppError("Failed to toggle theme", 400);
  }

  return {
    message: "Theme toggled successfully",
  };
};

export default {
  getSettings,
  toggleTheme,
};
