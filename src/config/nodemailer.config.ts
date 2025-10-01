import nodemailer from "nodemailer";

// for local development, use nodemailer and gmail
export const transporter = nodemailer.createTransport({
  // Configure your email provider
  host: process.env.MAIL_HOST as string,
  port: parseInt(process.env.MAIL_PORT as string),
  secure: true,
  auth: {
    user: process.env.AUTH_EMAIL as string,
    pass: process.env.AUTH_EMAIL_PASSWORD as string,
  },
});
