import { createHash } from "node:crypto";

import { config } from "dotenv";
import { Binary } from "mongodb";
import { NextRequest } from "next/server";

import { POST as logoutPost } from "../src/app/api/email-auth/logout/route";
import { POST as requestOtpPost } from "../src/app/api/email-auth/request-otp/route";
import { GET as getSession } from "../src/app/api/email-auth/session/route";
import { POST as verifyOtpPost } from "../src/app/api/email-auth/verify-otp/route";
import { EMAIL_AUTH_SESSION_COOKIE_NAME } from "../src/lib/email-auth/shared";
import { getMongoDb } from "../src/lib/mongodb";

config({ path: ".env.local" });

type OtpDocument = {
  _id: unknown;
  emailLower: string;
  mode: "login" | "signup";
  otpHash: Buffer | Binary | { value?: (asRaw?: boolean) => unknown; buffer?: Buffer };
  createdAt: Date;
  expiresAt: Date;
  attempts: number;
  consumedAt: Date | null;
};

function normalizeStoredHash(value: OtpDocument["otpHash"]) {
  if (Buffer.isBuffer(value)) {
    return value;
  }

  if (value instanceof Binary) {
    return value.buffer;
  }

  if (
    value &&
    typeof value === "object" &&
    "value" in value &&
    typeof value.value === "function"
  ) {
    const resolved = value.value(true);
    if (Buffer.isBuffer(resolved)) {
      return resolved;
    }
  }

  if (
    value &&
    typeof value === "object" &&
    "buffer" in value &&
    Buffer.isBuffer(value.buffer)
  ) {
    return value.buffer;
  }

  throw new Error("Stored OTP hash could not be normalized.");
}

function createOtpHash(emailLower: string, otpCode: string) {
  const secret = process.env.EMAIL_AUTH_SECRET?.trim() || process.env.NEXTAUTH_SECRET?.trim();

  if (!secret) {
    throw new Error("EMAIL_AUTH_SECRET or NEXTAUTH_SECRET is required.");
  }

  return createHash("sha256")
    .update(`otp:${secret}:${emailLower}:${otpCode}`)
    .digest();
}

function deriveOtpCode(emailLower: string, otpHash: OtpDocument["otpHash"]) {
  const storedHash = normalizeStoredHash(otpHash);

  for (let index = 0; index < 1_000_000; index += 1) {
    const otpCode = index.toString().padStart(6, "0");
    const candidateHash = createOtpHash(emailLower, otpCode);

    if (candidateHash.equals(storedHash)) {
      return otpCode;
    }
  }

  throw new Error("Unable to derive OTP code from stored hash.");
}

async function main() {
  const email = `digitantra.helpdesk+e2e-${Date.now()}@gmail.com`;
  const db = await getMongoDb();
  const otps = db.collection<OtpDocument>("auth_email_otps");

  async function runOtpCycle(mode: "signup" | "login") {
    const requestOtpResponse = await requestOtpPost(
      new NextRequest("http://localhost:9002/api/email-auth/request-otp", {
        method: "POST",
        body: JSON.stringify({
          email,
          mode,
        }),
        headers: {
          "content-type": "application/json",
        },
      })
    );

    const requestOtpPayload = await requestOtpResponse.json();

    if (!requestOtpResponse.ok) {
      throw new Error(`${mode} OTP request failed: ${JSON.stringify(requestOtpPayload)}`);
    }

    const otpDocument = await otps.findOne(
      {
        emailLower: email.toLowerCase(),
        mode,
        consumedAt: null,
      },
      {
        sort: { createdAt: -1 },
      }
    );

    if (!otpDocument) {
      throw new Error(`${mode} OTP document was not stored in MongoDB.`);
    }

    const otpCode = deriveOtpCode(email.toLowerCase(), otpDocument.otpHash);

    const verifyOtpResponse = await verifyOtpPost(
      new NextRequest("http://localhost:9002/api/email-auth/verify-otp", {
        method: "POST",
        body: JSON.stringify({
          email,
          otp: otpCode,
          mode,
        }),
        headers: {
          "content-type": "application/json",
        },
      })
    );

    const verifyOtpPayload = await verifyOtpResponse.json();

    if (!verifyOtpResponse.ok) {
      throw new Error(`${mode} OTP verification failed: ${JSON.stringify(verifyOtpPayload)}`);
    }

    const setCookieHeader = verifyOtpResponse.headers.get("set-cookie");

    if (!setCookieHeader) {
      throw new Error(`${mode} verification did not issue a session cookie.`);
    }

    const cookiePair = setCookieHeader.split(";")[0];
    const [cookieName, cookieValue] = cookiePair.split("=");

    if (cookieName !== EMAIL_AUTH_SESSION_COOKIE_NAME || !cookieValue) {
      throw new Error(`Unexpected session cookie header for ${mode}: ${setCookieHeader}`);
    }

    const sessionResponse = await getSession(
      new NextRequest("http://localhost:9002/api/email-auth/session", {
        headers: {
          cookie: `${EMAIL_AUTH_SESSION_COOKIE_NAME}=${cookieValue}`,
        },
      })
    );

    const sessionPayload = await sessionResponse.json();

    if (!sessionResponse.ok || !sessionPayload.authenticated) {
      throw new Error(`${mode} session lookup failed: ${JSON.stringify(sessionPayload)}`);
    }

    return {
      requestOtpPayload,
      verifyOtpPayload,
      sessionPayload,
      sessionCookie: `${EMAIL_AUTH_SESSION_COOKIE_NAME}=${cookieValue}`,
      otpCode,
    };
  }

  const signupResult = await runOtpCycle("signup");

  const logoutResponse = await logoutPost(
    new NextRequest("http://localhost:9002/api/email-auth/logout", {
      method: "POST",
      headers: {
        cookie: signupResult.sessionCookie,
      },
    })
  );

  const logoutPayload = await logoutResponse.json();

  if (!logoutResponse.ok) {
    throw new Error(`Logout failed: ${JSON.stringify(logoutPayload)}`);
  }

  const postLogoutSessionResponse = await getSession(
    new NextRequest("http://localhost:9002/api/email-auth/session", {
      headers: {
        cookie: signupResult.sessionCookie,
      },
    })
  );

  const postLogoutSessionPayload = await postLogoutSessionResponse.json();

  if (!postLogoutSessionResponse.ok || postLogoutSessionPayload.authenticated) {
    throw new Error(`Session still active after logout: ${JSON.stringify(postLogoutSessionPayload)}`);
  }

  const loginResult = await runOtpCycle("login");

  console.log(
    JSON.stringify(
      {
        ok: true,
        email,
        signup: {
          otpCode: signupResult.otpCode,
          otpExpiresAt: signupResult.requestOtpPayload.expiresAt,
          verifiedUser: signupResult.verifyOtpPayload.user,
          sessionUser: signupResult.sessionPayload.user,
        },
        logout: logoutPayload,
        login: {
          otpCode: loginResult.otpCode,
          otpExpiresAt: loginResult.requestOtpPayload.expiresAt,
          verifiedUser: loginResult.verifyOtpPayload.user,
          sessionUser: loginResult.sessionPayload.user,
        },
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
