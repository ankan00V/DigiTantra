import {
  createHash,
  randomBytes,
  randomInt,
  scrypt,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";

import nodemailer, { type Transporter } from "nodemailer";
import { ObjectId } from "mongodb";

import { getMongoDb } from "@/lib/mongodb";
import {
  EMAIL_AUTH_OTP_LENGTH,
  EMAIL_AUTH_SESSION_COOKIE_NAME,
  type EmailAuthOtpMode,
  type EmailAuthUser,
} from "@/lib/email-auth/shared";

const USERS_COLLECTION = "auth_email_users";
const OTPS_COLLECTION = "auth_email_otps";
const SESSIONS_COLLECTION = "auth_email_sessions";

const OTP_TTL_MS = 10 * 60 * 1000;
const OTP_REQUEST_COOLDOWN_MS = 30 * 1000;
const OTP_MAX_ATTEMPTS = 5;
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const PASSWORD_HASH_KEYLEN = 64;
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 128;
const MAX_PROFILE_IMAGE_BYTES = 1_500_000;

const scryptAsync = promisify(scrypt);

type EmailAuthUserDocument = {
  _id: ObjectId;
  email: string;
  emailLower: string;
  name: string | null;
  image: string | null;
  passwordHash: Buffer | null;
  passwordSalt: Buffer | null;
  emailVerifiedAt: Date | null;
  createdAt: Date;
  lastLoginAt: Date | null;
};

type SignupOtpPayload = {
  name: string;
  image: string | null;
  passwordHash: Buffer;
  passwordSalt: Buffer;
};

type EmailAuthOtpDocument = {
  _id: ObjectId;
  email: string;
  emailLower: string;
  mode: EmailAuthOtpMode;
  otpHash: Buffer;
  createdAt: Date;
  expiresAt: Date;
  attempts: number;
  consumedAt: Date | null;
  signupPayload: SignupOtpPayload | null;
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

type GlobalEmailAuthState = typeof globalThis & {
  __digitantraEmailAuthIndexesPromise__?: Promise<void>;
  __digitantraSmtpTransporter__?: Transporter;
};

const globalForEmailAuth = globalThis as GlobalEmailAuthState;

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

function normalizeDisplayName(value: string) {
  const normalized = value.trim().replace(/\s+/g, " ");

  if (normalized.length < 2) {
    throw new EmailAuthApiError("Name must be at least 2 characters long.", 400);
  }

  if (normalized.length > 80) {
    throw new EmailAuthApiError("Name must be 80 characters or fewer.", 400);
  }

  return normalized;
}

function validatePasswordForSignup(password: string) {
  if (password.length < PASSWORD_MIN_LENGTH) {
    throw new EmailAuthApiError(
      `Password must be at least ${PASSWORD_MIN_LENGTH} characters long.`,
      400
    );
  }

  if (password.length > PASSWORD_MAX_LENGTH) {
    throw new EmailAuthApiError("Password is too long.", 400);
  }

  if (!/[a-z]/.test(password)) {
    throw new EmailAuthApiError(
      "Password must include at least one lowercase letter.",
      400
    );
  }

  if (!/[A-Z]/.test(password)) {
    throw new EmailAuthApiError(
      "Password must include at least one uppercase letter.",
      400
    );
  }

  if (!/\d/.test(password)) {
    throw new EmailAuthApiError(
      "Password must include at least one number.",
      400
    );
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    throw new EmailAuthApiError(
      "Password must include at least one special character.",
      400
    );
  }

  return password;
}

function validatePasswordForLogin(password: string) {
  if (!password || !password.trim()) {
    throw new EmailAuthApiError("Password is required.", 400);
  }

  if (password.length > PASSWORD_MAX_LENGTH) {
    throw new EmailAuthApiError("Password is too long.", 400);
  }

  return password;
}

function normalizeProfileImageDataUrl(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const normalized = value.trim();

  if (!normalized) {
    return null;
  }

  const match = normalized.match(
    /^data:image\/(?:png|jpeg|jpg|webp|gif);base64,([a-z0-9+/=]+)$/i
  );

  if (!match) {
    throw new EmailAuthApiError(
      "Profile photo must be a valid PNG, JPG, WEBP, or GIF image.",
      400
    );
  }

  const decoded = Buffer.from(match[1], "base64");

  if (!decoded.length || decoded.length > MAX_PROFILE_IMAGE_BYTES) {
    throw new EmailAuthApiError("Profile photo must be 1.5 MB or smaller.", 400);
  }

  return normalized;
}

function getEmailAuthSecret() {
  const secret =
    process.env.EMAIL_AUTH_SECRET?.trim() || process.env.NEXTAUTH_SECRET?.trim();

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

async function derivePasswordHash(password: string, salt: Buffer) {
  return (await scryptAsync(password, salt, PASSWORD_HASH_KEYLEN)) as Buffer;
}

async function createPasswordHash(password: string) {
  const passwordSalt = randomBytes(16);
  const passwordHash = await derivePasswordHash(password, passwordSalt);

  return {
    passwordHash,
    passwordSalt,
  };
}

async function passwordMatches(
  password: string,
  expectedHash: unknown,
  expectedSalt: unknown
) {
  const normalizedSalt = normalizeStoredHash(expectedSalt);
  const candidateHash = await derivePasswordHash(password, normalizedSalt);

  return hashesMatch(expectedHash, candidateHash);
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
    provider: "email-password",
    emailVerifiedAt: user.emailVerifiedAt?.toISOString() ?? null,
    createdAt: user.createdAt.toISOString(),
    lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
  };
}

async function ensureIndexes() {
  if (!globalForEmailAuth.__digitantraEmailAuthIndexesPromise__) {
    globalForEmailAuth.__digitantraEmailAuthIndexesPromise__ = (async () => {
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

  await globalForEmailAuth.__digitantraEmailAuthIndexesPromise__;
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

  if (!globalForEmailAuth.__digitantraSmtpTransporter__) {
    const port = Number(portRaw);
    globalForEmailAuth.__digitantraSmtpTransporter__ = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
    });
  }

  return globalForEmailAuth.__digitantraSmtpTransporter__;
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
  mode: EmailAuthOtpMode;
}) {
  const transporter = getSmtpTransporter();
  const fromEmail = process.env.AUTH_OTP_FROM_EMAIL?.trim();
  const companyName = process.env.AUTH_COMPANY_NAME?.trim() || "DigiTantra";
  const fromName = process.env.AUTH_OTP_FROM_NAME?.trim() || companyName;
  const supportEmail = process.env.AUTH_SUPPORT_EMAIL?.trim() || fromEmail;
  const companyAddress =
    process.env.AUTH_COMPANY_ADDRESS?.trim() || "Jalandhar, Punjab, India";
  const supportUrl = "https://digitantra.vercel.app";

  if (!fromEmail) {
    throw new EmailAuthApiError("AUTH_OTP_FROM_EMAIL is not configured.", 500);
  }

  const isPasswordReset = mode === "password-reset";
  const subject = isPasswordReset
    ? `${companyName} password reset code • Expires in 10 minutes`
    : `${companyName} sign-up verification code • Expires in 10 minutes`;
  const actionLabel = isPasswordReset ? "reset your password" : "complete sign up";
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

async function assertSignupAccess(emailLower: string) {
  const user = await getUserByEmail(emailLower);

  if (user?.passwordHash && user?.passwordSalt) {
    throw new EmailAuthApiError(
      "An account already exists for this email. Use Log in instead.",
      409
    );
  }

  return user;
}

async function assertLoginAccess(emailLower: string) {
  const user = await getUserByEmail(emailLower);

  if (!user) {
    throw new EmailAuthApiError(
      "No DigiTantra account exists for this email yet. Use Sign up first.",
      404
    );
  }

  if (!user.passwordHash || !user.passwordSalt) {
    throw new EmailAuthApiError(
      "This account must complete sign up with password and OTP before login.",
      409
    );
  }

  return user;
}

async function assertPasswordResetAccess(emailLower: string) {
  const user = await assertLoginAccess(emailLower);

  if (!user.emailVerifiedAt) {
    throw new EmailAuthApiError(
      "Your account email is not verified yet. Complete sign up first.",
      409
    );
  }

  return user;
}

async function createSessionForUser({
  sessions,
  user,
}: {
  sessions: Awaited<ReturnType<typeof getCollections>>["sessions"];
  user: EmailAuthUserDocument;
}) {
  const issuedAt = new Date();
  const sessionToken = randomBytes(48).toString("hex");
  const sessionExpiresAt = new Date(Date.now() + SESSION_TTL_MS);

  const sessionDocument: EmailAuthSessionInsert = {
    tokenHash: createScopedHash("session", sessionToken),
    userId: user._id,
    email: user.email,
    emailLower: user.emailLower,
    createdAt: issuedAt,
    expiresAt: sessionExpiresAt,
    lastSeenAt: issuedAt,
  };

  await sessions.insertOne(sessionDocument as EmailAuthSessionDocument);

  return {
    sessionToken,
    sessionExpiresAt,
  };
}

export async function requestEmailOtp({
  email,
  mode,
  signup,
}: {
  email: string;
  mode: "signup";
  signup: {
    name: string;
    password: string;
    image?: string | null;
  };
}) {
  const normalizedEmail = normalizeEmail(email);
  const { otps } = await getCollections();

  await assertSignupAccess(normalizedEmail);

  const signupName = normalizeDisplayName(signup.name);
  const signupPassword = validatePasswordForSignup(signup.password);
  const signupImage = normalizeProfileImageDataUrl(signup.image);
  const { passwordHash, passwordSalt } = await createPasswordHash(signupPassword);

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
    signupPayload: {
      name: signupName,
      image: signupImage,
      passwordHash,
      passwordSalt,
    },
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
  mode: "signup";
}) {
  const normalizedEmail = normalizeEmail(email);
  const { users, otps } = await getCollections();

  const existingUser = await assertSignupAccess(normalizedEmail);
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

  if (!otpDocument.signupPayload) {
    throw new EmailAuthApiError("Sign-up payload is missing for this OTP.", 500);
  }

  await otps.updateOne(
    { _id: otpDocument._id },
    { $set: { consumedAt: new Date() } }
  );

  const completedAt = new Date();
  let user: EmailAuthUserDocument;

  if (existingUser) {
    await users.updateOne(
      { _id: existingUser._id },
      {
        $set: {
          name: otpDocument.signupPayload.name,
          image: otpDocument.signupPayload.image,
          passwordHash: otpDocument.signupPayload.passwordHash,
          passwordSalt: otpDocument.signupPayload.passwordSalt,
          emailVerifiedAt: completedAt,
          lastLoginAt: completedAt,
        },
      }
    );

    user = {
      ...existingUser,
      name: otpDocument.signupPayload.name,
      image: otpDocument.signupPayload.image,
      passwordHash: otpDocument.signupPayload.passwordHash,
      passwordSalt: otpDocument.signupPayload.passwordSalt,
      emailVerifiedAt: completedAt,
      lastLoginAt: completedAt,
    };
  } else {
    const newUser: EmailAuthUserInsert = {
      email: normalizedEmail,
      emailLower: normalizedEmail,
      name: otpDocument.signupPayload.name,
      image: otpDocument.signupPayload.image,
      passwordHash: otpDocument.signupPayload.passwordHash,
      passwordSalt: otpDocument.signupPayload.passwordSalt,
      emailVerifiedAt: completedAt,
      createdAt: completedAt,
      lastLoginAt: completedAt,
    };

    const inserted = await users.insertOne(newUser as EmailAuthUserDocument);

    user = {
      _id: inserted.insertedId,
      ...newUser,
    };
  }

  return {
    user: toEmailAuthUser(user),
  };
}

export async function requestPasswordResetOtp({ email }: { email: string }) {
  const normalizedEmail = normalizeEmail(email);
  const { otps } = await getCollections();
  const mode: EmailAuthOtpMode = "password-reset";

  await assertPasswordResetAccess(normalizedEmail);

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
    signupPayload: null,
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

export async function resetPasswordWithOtp({
  email,
  otp,
  newPassword,
}: {
  email: string;
  otp: string;
  newPassword: string;
}) {
  const normalizedEmail = normalizeEmail(email);
  const mode: EmailAuthOtpMode = "password-reset";
  const { users, otps, sessions } = await getCollections();
  const user = await assertPasswordResetAccess(normalizedEmail);
  const password = validatePasswordForSignup(newPassword);

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

  const { passwordHash, passwordSalt } = await createPasswordHash(password);

  await users.updateOne(
    { _id: user._id },
    {
      $set: {
        passwordHash,
        passwordSalt,
      },
    }
  );

  // Invalidate every active session after password change.
  await sessions.deleteMany({ userId: user._id });

  return {
    email: normalizedEmail,
  };
}

export async function loginWithEmailPassword({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  const normalizedEmail = normalizeEmail(email);
  const passwordValue = validatePasswordForLogin(password);
  const { users, sessions } = await getCollections();
  const user = await assertLoginAccess(normalizedEmail);

  const passwordIsValid = await passwordMatches(
    passwordValue,
    user.passwordHash,
    user.passwordSalt
  );

  if (!passwordIsValid) {
    throw new EmailAuthApiError("Invalid email or password.", 401);
  }

  const loginAt = new Date();
  await users.updateOne(
    { _id: user._id },
    {
      $set: {
        lastLoginAt: loginAt,
      },
    }
  );

  const updatedUser: EmailAuthUserDocument = {
    ...user,
    lastLoginAt: loginAt,
  };

  const session = await createSessionForUser({
    sessions,
    user: updatedUser,
  });

  return {
    ...session,
    user: toEmailAuthUser(updatedUser),
  };
}

async function getSessionAndUserFromToken(sessionToken: string | null) {
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

  return {
    user,
    session,
    sessions,
    users,
  };
}

export async function getEmailAuthUserFromToken(sessionToken: string | null) {
  const resolved = await getSessionAndUserFromToken(sessionToken);

  if (!resolved) {
    return null;
  }

  void resolved.sessions.updateOne(
    { _id: resolved.session._id },
    { $set: { lastSeenAt: new Date() } }
  );

  return toEmailAuthUser(resolved.user);
}

export async function updateEmailAuthProfile({
  sessionToken,
  name,
  image,
}: {
  sessionToken: string | null;
  name?: string;
  image?: string | null;
}) {
  if (!sessionToken) {
    throw new EmailAuthApiError("You must be logged in to update profile.", 401);
  }

  const resolved = await getSessionAndUserFromToken(sessionToken);

  if (!resolved) {
    throw new EmailAuthApiError("Your session is not valid. Please log in again.", 401);
  }

  const updates: Partial<Pick<EmailAuthUserDocument, "name" | "image">> = {};

  if (typeof name !== "undefined") {
    updates.name = normalizeDisplayName(name);
  }

  if (typeof image !== "undefined") {
    updates.image = normalizeProfileImageDataUrl(image);
  }

  if (!Object.keys(updates).length) {
    throw new EmailAuthApiError("No profile changes were provided.", 400);
  }

  await resolved.users.updateOne({ _id: resolved.user._id }, { $set: updates });

  return toEmailAuthUser({
    ...resolved.user,
    ...updates,
  });
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
