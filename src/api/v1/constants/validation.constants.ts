export const OTP_LENGTH = 6;
export const MIN_PASSWORD_LENGTH = 8;

export const ERROR_MESSAGES = {
  INVALID_OTP: "OTP must be 6 digits",
  INVALID_EMAIL: "Invalid email format",
  REQUIRED_FIELD: (field: string) => `${field} is required`,
} as const;
