import { randomInt } from "crypto";
import { OTP_LENGTH } from "../constants/validation.constants";

/**
 * Generates a cryptographically secure OTP
 * Uses Node's crypto.randomInt which provides uniform distribution
 * @returns A 6-digit OTP string
 */
export const generateOTP = (): string => {
  // Using randomInt ensures uniform distribution without modulo bias
  const otp = randomInt(0, 999999);
  // Pad with leading zeros to ensure 6 digits
  return otp.toString().padStart(OTP_LENGTH, "0");
};
