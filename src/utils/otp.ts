import crypto from "crypto";

export const OTP_EXPIRY_MINUTES = 10;

export const OTP_RESEND_COOLDOWN_SECONDS = 60;

export const generateOtp = (): string => {
  return crypto
    .randomInt(100000, 1000000)
    .toString();
};

export const generateOtpExpiry = (): Date => {
  return new Date(
    Date.now() +
      OTP_EXPIRY_MINUTES * 60 * 1000,
  );
};

export const getOtpResendWaitSeconds = (
  expiresAt: Date,
): number => {
  const sentAt =
    expiresAt.getTime() -
    OTP_EXPIRY_MINUTES * 60 * 1000;

  const resendAvailableAt =
    sentAt +
    OTP_RESEND_COOLDOWN_SECONDS * 1000;

  const remainingMilliseconds =
    resendAvailableAt - Date.now();

  if (remainingMilliseconds <= 0) {
    return 0;
  }

  return Math.ceil(
    remainingMilliseconds / 1000,
  );
};