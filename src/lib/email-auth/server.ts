import "server-only";

import {
  createHash,
  randomBytes,
  randomInt,
  timingSafeEqual,
} from "node:crypto";

import nodemailer, { type Transporter } from "nodemailer";
import { ObjectId } from "mongodb";

import { getMongoDb } from "@/lib/mongodb";
import {
  EMAIL_AUTH_OTP_LENGTH,
  EMAIL_AUTH_SESSION_COOKIE_NAME,
  type EmailAuthMode,
  type EmailAuthUser,
} from "@/lib/email-auth/shared";

const USERS_COLLECTION = "auth_email_users";
const OTPS_COLLECTION = "auth_email_otps";
const SESSIONS_COLLECTION = "auth_email_sessions";

const OTP_TTL_MS = 10 * 60 * 1000;
const OTP_REQUEST_COOLDOWN_MS = 30 * 1000;
const OTP_MAX_ATTEMPTS = 5;
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

type EmailAuthUserDocument = {
  _id: ObjectId;
  email: string;
  emailLower: string;
  name: string | null;
  image: string | null;
  createdAt: Date;
  lastLoginAt: Date | null;
};

type EmailAuthOtpDocument = {
  _id: ObjectId;
  email: string;
  emailLower: string;
  mode: EmailAuthMode;
  otpHash: Buffer;
  createdAt: Date;
  expiresAt: Date;
  attempts: number;
  consumedAt: Date | null;
};

type EmailAuthSessionDocument = {
  _id: ObjectId;
  tokenHash: Buffer;
  userId: ObjectId;
  email: string;
  emailLower: string;
  createdAt: Date;
  expiresAt: Date;
  lastSeenAt: Date;
};

type EmailAuthUserInsert = Omit<EmailAuthUserDocument, "_id">;
type EmailAuthOtpInsert = Omit<EmailAuthOtpDocument, "_id">;
type EmailAuthSessionInsert = Omit<EmailAuthSessionDocument, "_id">;

declare global {
  // eslint-disable-next-line no-var
  var __digitantraEmailAuthIndexesPromise__: Promise<void> | undefined;
  // eslint-disable-next-line no-var
  var __digitantraSmtpTransporter__: Transporter | undefined;
}

export class EmailAuthApiError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "EmailAuthApiError";
    this.status = status;
  }
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function getEmailAuthSecret() {
  const secret = process.env.EMAIL_AUTH_SECRET?.trim() || process.env.NEXTAUTH_SECRET?.trim();

  if (!secret) {
    throw new EmailAuthApiError("EMAIL_AUTH_SECRET is not configured.", 500);
  }

  return secret;
}

function createScopedHash(scope: "otp" | "session", value: string) {
  return createHash("sha256")
    .update(`${scope}:${getEmailAuthSecret()}:${value}`)
    .digest();
}

function normalizeStoredHash(value: unknown) {
  if (Buffer.isBuffer(value)) {
    return value;
  }

  if (
    value &&
    typeof value === "object" &&
    "value" in value &&
    typeof (value as { value?: unknown }).value === "function"
  ) {
    const resolved = (value as { value: (asRaw?: boolean) => unknown }).value(true);
    if (Buffer.isBuffer(resolved)) {
      return resolved;
    }
  }

  if (
    value &&
    typeof value === "object" &&
    "buffer" in value &&
    Buffer.isBuffer((value as { buffer?: unknown }).buffer)
  ) {
    return (value as { buffer: Buffer }).buffer;
  }

  throw new EmailAuthApiError("Stored auth hash is invalid.", 500);
}

function hashesMatch(expectedHash: unknown, candidateHash: Buffer) {
  const normalizedExpectedHash = normalizeStoredHash(expectedHash);

  if (normalizedExpectedHash.length !== candidateHash.length) {
    return false;
  }

  return timingSafeEqual(normalizedExpectedHash, candidateHash);
}

function createOtpCode() {
  return randomInt(0, 10 ** EMAIL_AUTH_OTP_LENGTH)
    .toString()
    .padStart(EMAIL_AUTH_OTP_LENGTH, "0");
}

function toEmailAuthUser(user: EmailAuthUserDocument): EmailAuthUser {
  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    image: user.image,
    provider: "email-otp",
    createdAt: user.createdAt.toISOString(),
    lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
  };
}

async function ensureIndexes() {
  if (!global.__digitantraEmailAuthIndexesPromise__) {
    global.__digitantraEmailAuthIndexesPromise__ = (async () => {
      const db = await getMongoDb();
      await Promise.all([
        db
          .collection<EmailAuthUserDocument>(USERS_COLLECTION)
          .createIndex({ emailLower: 1 }, { unique: true }),
        db
          .collection<EmailAuthOtpDocument>(OTPS_COLLECTION)
          .createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
        db
          .collection<EmailAuthOtpDocument>(OTPS_COLLECTION)
          .createIndex({ emailLower: 1, mode: 1, createdAt: -1 }),
        db
          .collection<EmailAuthSessionDocument>(SESSIONS_COLLECTION)
          .createIndex({ tokenHash: 1 }, { unique: true }),
        db
          .collection<EmailAuthSessionDocument>(SESSIONS_COLLECTION)
          .createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
      ]);
    })();
  }

  await global.__digitantraEmailAuthIndexesPromise__;
}

function getSmtpTransporter() {
  const host = process.env.SMTP_HOST?.trim();
  const portRaw = process.env.SMTP_PORT?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASSWORD?.trim();

  if (!host || !portRaw || !user || !pass) {
    throw new EmailAuthApiError(
      "Email OTP is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, and AUTH_OTP_FROM_EMAIL.",
      500
    );
  }

  if (!global.__digitantraSmtpTransporter__) {
    const port = Number(portRaw);
    global.__digitantraSmtpTransporter__ = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
    });
  }

  return global.__digitantraSmtpTransporter__;
}

async function getCollections() {
  await ensureIndexes();
  const db = await getMongoDb();

  return {
    users: db.collection<EmailAuthUserDocument>(USERS_COLLECTION),
    otps: db.collection<EmailAuthOtpDocument>(OTPS_COLLECTION),
    sessions: db.collection<EmailAuthSessionDocument>(SESSIONS_COLLECTION),
  };
}

async function getUserByEmail(emailLower: string) {
  const { users } = await getCollections();
  return users.findOne({ emailLower });
}

async function sendOtpEmail({
  email,
  otpCode,
  mode,
}: {
  email: string;
  otpCode: string;
  mode: EmailAuthMode;
}) {
  const transporter = getSmtpTransporter();
  const fromEmail = process.env.AUTH_OTP_FROM_EMAIL?.trim();
  const companyName = process.env.AUTH_COMPANY_NAME?.trim() || "DigiTantra";
  const fromName = process.env.AUTH_OTP_FROM_NAME?.trim() || companyName;
  const supportEmail = process.env.AUTH_SUPPORT_EMAIL?.trim() || fromEmail;
  const companyAddress =
    process.env.AUTH_COMPANY_ADDRESS?.trim() || "Jalandhar, Punjab, India";
  const supportUrl = process.env.AUTH_SUPPORT_URL?.trim() || "https://digitantra.in";

  if (!fromEmail) {
    throw new EmailAuthApiError("AUTH_OTP_FROM_EMAIL is not configured.", 500);
  }

  const subject =
    mode === "signup"
      ? `${companyName} sign-up verification code • Expires in 10 minutes`
      : `${companyName} login verification code • Expires in 10 minutes`;

  const actionLabel = mode === "signup" ? "complete sign up" : "log in";
  const plainTextLines = [
    `${companyName} verification`,
    "",
    `Your verification code is ${otpCode}.`,
    `Use this code to ${actionLabel} to DigiTantra.`,
    "This code expires in 10 minutes.",
    "",
    `If you did not request this email, you can ignore it safely.`,
    "",
    `${companyName}`,
    companyAddress,
    supportEmail ? `Support: ${supportEmail}` : null,
    supportUrl ? `Website: ${supportUrl}` : null,
  ].filter(Boolean);

  await transporter.sendMail({
    from: `"${fromName}" <${fromEmail}>`,
    to: email,
    subject,
    text: plainTextLines.join("\n"),
    html: `
      <div style="font-family: Inter, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #e5e7eb; background: #0b1020; border: 1px solid rgba(139,92,246,0.24); border-radius: 20px;">
        <div style="font-size: 13px; letter-spacing: 0.16em; text-transform: uppercase; color: #a78bfa; margin-bottom: 12px;">${companyName} Security</div>
        <h1 style="font-size: 28px; line-height: 1.2; color: #ffffff; margin: 0 0 12px;">Your verification code</h1>
        <p style="font-size: 16px; line-height: 1.7; color: #cbd5e1; margin: 0 0 24px;">
          Use the code below to ${actionLabel} to ${companyName}. This code stays valid for 10 minutes.
        </p>
        <div style="font-size: 36px; font-weight: 700; letter-spacing: 0.4em; color: #8b5cf6; background: rgba(139,92,246,0.1); border: 1px solid rgba(139,92,246,0.24); border-radius: 18px; padding: 20px 24px; text-align: center; margin: 0 0 24px;">
          ${otpCode}
        </div>
        <p style="font-size: 14px; line-height: 1.7; color: #94a3b8; margin: 0 0 20px;">
          If you did not request this code, you can safely ignore this email.
        </p>
        <div style="border-top: 1px solid rgba(148,163,184,0.16); padding-top: 18px; margin-top: 18px;">
          <div style="font-size: 15px; font-weight: 600; color: #ffffff; margin-bottom: 8px;">${companyName}</div>
          <p style="font-size: 13px; line-height: 1.7; color: #94a3b8; margin: 0;">
            ${companyAddress}<br />
            ${supportEmail ? `Support: <a href="mailto:${supportEmail}" style="color: #c4b5fd; text-decoration: none;">${supportEmail}</a><br />` : ""}
            ${supportUrl ? `Website: <a href="${supportUrl}" style="color: #c4b5fd; text-decoration: none;">${supportUrl}</a>` : ""}
          </p>
        </div>
      </div>
    `,
  });
}

async function assertModeAccess(mode: EmailAuthMode, emailLower: string) {
  const user = await getUserByEmail(emailLower);

  if (mode === "signup" && user) {
    throw new EmailAuthApiError(
      "An account already exists for this email. Use Log in instead.",
      409
    );
  }

  if (mode === "login" && !user) {
    throw new EmailAuthApiError(
      "No DigiTantra account exists for this email yet. Use Sign up first.",
      404
    );
  }

  return user;
}

export async function requestEmailOtp({
  email,
  mode,
}: {
  email: string;
  mode: EmailAuthMode;
}) {
  const normalizedEmail = normalizeEmail(email);
  const { otps } = await getCollections();

  await assertModeAccess(mode, normalizedEmail);

  const mostRecentOtp = await otps.findOne(
    {
      emailLower: normalizedEmail,
      mode,
      consumedAt: null,
      expiresAt: { $gt: new Date() },
    },
    { sort: { createdAt: -1 } }
  );

  if (
    mostRecentOtp &&
    Date.now() - mostRecentOtp.createdAt.getTime() < OTP_REQUEST_COOLDOWN_MS
  ) {
    throw new EmailAuthApiError(
      "A code was just sent. Please wait 30 seconds before requesting another one.",
      429
    );
  }

  const otpCode = createOtpCode();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + OTP_TTL_MS);

  await otps.deleteMany({ emailLower: normalizedEmail, mode });

  const otpDocument: EmailAuthOtpInsert = {
    email: normalizedEmail,
    emailLower: normalizedEmail,
    mode,
    otpHash: createScopedHash("otp", `${normalizedEmail}:${otpCode}`),
    createdAt: now,
    expiresAt,
    attempts: 0,
    consumedAt: null,
  };

  const inserted = await otps.insertOne(otpDocument as EmailAuthOtpDocument);

  try {
    await sendOtpEmail({ email: normalizedEmail, otpCode, mode });
  } catch (error) {
    await otps.deleteOne({ _id: inserted.insertedId });
    throw error;
  }

  return {
    email: normalizedEmail,
    expiresAt: expiresAt.toISOString(),
  };
}

export async function verifyEmailOtp({
  email,
  otp,
  mode,
}: {
  email: string;
  otp: string;
  mode: EmailAuthMode;
}) {
  const normalizedEmail = normalizeEmail(email);
  const { users, otps, sessions } = await getCollections();

  const existingUser = await assertModeAccess(mode, normalizedEmail);
  const otpDocument = await otps.findOne(
    {
      emailLower: normalizedEmail,
      mode,
      consumedAt: null,
      expiresAt: { $gt: new Date() },
    },
    { sort: { createdAt: -1 } }
  );

  if (!otpDocument) {
    throw new EmailAuthApiError(
      "This code is no longer valid. Request a new OTP and try again.",
      410
    );
  }

  const providedHash = createScopedHash("otp", `${normalizedEmail}:${otp}`);

  if (!hashesMatch(otpDocument.otpHash, providedHash)) {
    const nextAttempts = otpDocument.attempts + 1;

    await otps.updateOne(
      { _id: otpDocument._id },
      {
        $set: {
          attempts: nextAttempts,
          consumedAt: nextAttempts >= OTP_MAX_ATTEMPTS ? new Date() : null,
        },
      }
    );

    throw new EmailAuthApiError(
      nextAttempts >= OTP_MAX_ATTEMPTS
        ? "Too many incorrect attempts. Request a fresh OTP and try again."
        : "That code is incorrect. Please check the OTP and try again.",
      400
    );
  }

  await otps.updateOne(
    { _id: otpDocument._id },
    { $set: { consumedAt: new Date() } }
  );

  const loginTimestamp = new Date();
  let user = existingUser;

  if (user) {
    await users.updateOne(
      { _id: user._id },
      { $set: { lastLoginAt: loginTimestamp } }
    );
    user = {
      ...user,
      lastLoginAt: loginTimestamp,
    };
  } else {
    const newUser: EmailAuthUserInsert = {
      email: normalizedEmail,
      emailLower: normalizedEmail,
      name: null,
      image: null,
      createdAt: loginTimestamp,
      lastLoginAt: loginTimestamp,
    };
    const inserted = await users.insertOne(newUser as EmailAuthUserDocument);

    user = {
      _id: inserted.insertedId,
      email: normalizedEmail,
      emailLower: normalizedEmail,
      name: null,
      image: null,
      createdAt: loginTimestamp,
      lastLoginAt: loginTimestamp,
    };
  }

  const sessionToken = randomBytes(48).toString("hex");
  const sessionExpiresAt = new Date(Date.now() + SESSION_TTL_MS);

  const sessionDocument: EmailAuthSessionInsert = {
    tokenHash: createScopedHash("session", sessionToken),
    userId: user._id,
    email: user.email,
    emailLower: user.emailLower,
    createdAt: loginTimestamp,
    expiresAt: sessionExpiresAt,
    lastSeenAt: loginTimestamp,
  };

  await sessions.insertOne(sessionDocument as EmailAuthSessionDocument);

  return {
    sessionToken,
    sessionExpiresAt,
    user: toEmailAuthUser(user),
  };
}

export async function getEmailAuthUserFromToken(sessionToken: string | null) {
  if (!sessionToken) {
    return null;
  }

  const { users, sessions } = await getCollections();
  const sessionHash = createScopedHash("session", sessionToken);
  const session = await sessions.findOne({
    tokenHash: sessionHash,
    expiresAt: { $gt: new Date() },
  });

  if (!session) {
    return null;
  }

  const user = await users.findOne({ _id: session.userId });

  if (!user) {
    await sessions.deleteOne({ _id: session._id });
    return null;
  }

  void sessions.updateOne(
    { _id: session._id },
    { $set: { lastSeenAt: new Date() } }
  );

  return toEmailAuthUser(user);
}

export async function revokeEmailAuthSession(sessionToken: string | null) {
  if (!sessionToken) {
    return;
  }

  const { sessions } = await getCollections();
  await sessions.deleteOne({
    tokenHash: createScopedHash("session", sessionToken),
  });
}

export function getEmailAuthCookieOptions(expiresAt: Date) {
  return {
    name: EMAIL_AUTH_SESSION_COOKIE_NAME,
    value: "",
    options: {
      httpOnly: true,
      sameSite: "lax" as const,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      expires: expiresAt,
    },
  };
}
