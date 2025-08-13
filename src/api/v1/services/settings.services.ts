import Settings from "../repositories/settings.repositories";
import { AppError } from "../middlewares/error.handlers";

const getSettings = async (userId: string) => {
  if (!userId) {
    throw new AppError("User ID is required", 400);
  }

  const settings = await Settings.GetSettings(userId);

  return settings;
};

const toggleTheme = async (userId: string, theme: string) => {
  if (!userId) {
    throw new AppError("User ID is required", 400);
  }

  const updatedAt = new Date();

  const settings = await Settings.ToggleTheme(userId, theme, updatedAt);

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
