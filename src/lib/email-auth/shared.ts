export const EMAIL_AUTH_SESSION_COOKIE_NAME = "digitantra_email_session";

export const EMAIL_AUTH_OTP_LENGTH = 6;

export type EmailAuthMode = "login" | "signup";

export interface EmailAuthUser {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  provider: "email-otp";
  createdAt: string;
  lastLoginAt: string | null;
}
