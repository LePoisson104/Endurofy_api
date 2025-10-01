import {
  verificationCodeEmail,
  passwordResetEmail,
} from "../helpers/html.content";
import { transporter } from "../../../config/nodemailer.config";
import { Resend } from "resend";

const isDevelopment = process.env.NODE_ENV === "development";
const resend = new Resend(process.env.RESEND_API_KEY);

export const sendOTPVerification = async (
  email: string,
  otp: string,
  expirationTime: string,
  isUpdate: boolean
): Promise<void> => {
  const otpEmailContent = {
    from: '"Endurofy" <support@endurofy.app>',
    to: email,
    subject: "Your Verification Code",
    text: `Your verification code is: ${otp}. It will expire in ${expirationTime}.`,
    html: verificationCodeEmail(otp, expirationTime, isUpdate),
  };

  if (isDevelopment) {
    await transporter.sendMail(otpEmailContent);
  } else {
    await resend.emails.send(otpEmailContent);
  }
};

export const sendPasswordResetEmail = async (
  firstName: string,
  email: string,
  resetPasswordLink: string,
  expirationTime: string
): Promise<void> => {
  const passwordResetEmailContent = {
    from: '"Endurofy" <support@endurofy.app>',
    to: email,
    subject: "Your Password Reset Link",
    text: `A request was made to reset your password for your Endurofy account. To procees, please
                            click the link below to reset your password.`,
    html: passwordResetEmail(firstName, resetPasswordLink, expirationTime),
  };

  if (isDevelopment) {
    await transporter.sendMail(passwordResetEmailContent);
  } else {
    await resend.emails.send(passwordResetEmailContent);
  }
};
