import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import {
  EmailAuthApiError,
  getEmailAuthCookieOptions,
  loginWithEmailPassword,
} from "@/lib/email-auth/server";
import {
  enforceApiRateLimit,
  getJsonMaxBytes,
  isApiPayloadError,
  parseJsonBody,
} from "@/lib/security/api";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Please enter a valid email address.")
    .max(320, "Email is too long."),
  password: z
    .string()
    .min(1, "Password is required.")
    .max(128, "Password is too long."),
}).strict();

export async function POST(request: NextRequest) {
  const blockedResponse = await enforceApiRateLimit(request, {
    scope: "auth",
    routeId: "email-auth/login",
  });

  if (blockedResponse) {
    return blockedResponse;
  }

  try {
    const body = await parseJsonBody(request, loginSchema, {
      maxBytes: getJsonMaxBytes("auth"),
      oversizeMessage: "Login payload is too large.",
    });
    const result = await loginWithEmailPassword(body);
    const response = NextResponse.json({
      ok: true,
      user: result.user,
    });

    const cookie = getEmailAuthCookieOptions(result.sessionExpiresAt);
    response.cookies.set({
      ...cookie.options,
      name: cookie.name,
      value: result.sessionToken,
    });

    return response;
  } catch (error) {
    if (isApiPayloadError(error)) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "Invalid login request." },
        { status: 400 }
      );
    }

    if (error instanceof EmailAuthApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error("email-auth login error", error);
    return NextResponse.json(
      { error: "Unable to log in right now. Please try again." },
      { status: 500 }
    );
  }
}
