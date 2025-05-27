import {
  verificationCodeEmail,
  passwordResetEmail,
} from "../helpers/html.content";
import { transporter } from "../../../config/nodemailer.config";

export const sendOTPVerification = async (
  email: string,
  otp: string,
  expirationTime: string,
  isUpdate: boolean
): Promise<void> => {
  await transporter.sendMail({
    from: '"Endurofy" <endurofy@gmail.com>',
    to: email,
    subject: "Your Verification Code",
    text: `Your verification code is: ${otp}. It will expire in ${expirationTime}.`,
    html: verificationCodeEmail(otp, expirationTime, isUpdate),
  });
};

export const sendPasswordResetEmail = async (
  firstName: string,
  email: string,
  resetPasswordLink: string,
  expirationTime: string
): Promise<void> => {
  await transporter.sendMail({
    from: '"Endurofy" <endurofy@gmail.com>',
    to: email,
    subject: "Your Password Reset Link",
    text: `A request was made to reset your password for your Endurofy account. To procees, please
                            click the link below to reset your password.`,
    html: passwordResetEmail(firstName, resetPasswordLink, expirationTime),
  });
};
