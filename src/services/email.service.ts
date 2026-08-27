import nodemailer from "nodemailer";
import { env } from "../config/env";

const transporter = nodemailer.createTransport({
  host: env.smtpHost,
  port: env.smtpPort,
  secure: env.smtpPort === 465,
  auth: {
    user: env.smtpUser,
    pass: env.smtpPassword,
  },
});

export const sendAdminPasswordResetOtp = async (
  email: string,
  otp: string,
): Promise<void> => {
  await transporter.sendMail({
    from: env.smtpFrom,
    to: email,
    subject: "Admin Password Reset OTP",
    text: `Your password reset OTP is ${otp}. This OTP will expire in 10 minutes.`,
    html: `
      <div>
        <h2>Password Reset</h2>

        <p>Your admin password reset OTP is:</p>

        <h1>${otp}</h1>

        <p>This OTP will expire in 10 minutes.</p>

        <p>If you did not request a password reset, please ignore this email.</p>
      </div>
    `,
  });
};




export const sendAdminEmailChangeOtp = async (
  email: string,
  otp: string,
): Promise<void> => {
  await transporter.sendMail({
    from: env.smtpFrom,
    to: email,
    subject: "Verify New Admin Email",

    text: `Your email change verification OTP is ${otp}. This OTP will expire in 10 minutes.`,

    html: `
      <div>
        <h2>Verify New Email Address</h2>

        <p>Your OTP for changing the admin email is:</p>

        <h1>${otp}</h1>

        <p>This OTP will expire in 10 minutes.</p>

        <p>
          If you did not request this email change,
          please ignore this email.
        </p>
      </div>
    `,
  });
};