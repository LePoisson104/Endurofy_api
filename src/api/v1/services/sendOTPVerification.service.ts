import { htmlContent } from "../helpers/html.content";
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
    html: htmlContent(otp, expirationTime, isUpdate),
  });
};
