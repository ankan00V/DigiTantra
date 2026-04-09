import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import {
  EmailAuthApiError,
  requestPasswordResetOtp,
} from "@/lib/email-auth/server";
import {
  enforceApiRateLimit,
  getJsonMaxBytes,
  isApiPayloadError,
  parseJsonBody,
} from "@/lib/security/api";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const requestPasswordResetSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Please enter a valid email address.")
    .max(320, "Email is too long."),
}).strict();

export async function POST(request: NextRequest) {
  const blockedResponse = await enforceApiRateLimit(request, {
    scope: "auth",
    routeId: "email-auth/password-reset/request-otp",
  });

  if (blockedResponse) {
    return blockedResponse;
  }

  try {
    const body = await parseJsonBody(request, requestPasswordResetSchema, {
      maxBytes: getJsonMaxBytes("auth"),
      oversizeMessage: "Password reset request payload is too large.",
    });
    const result = await requestPasswordResetOtp(body);

    return NextResponse.json({
      ok: true,
      email: result.email,
      expiresAt: result.expiresAt,
    });
  } catch (error) {
    if (isApiPayloadError(error)) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "Invalid password reset request." },
        { status: 400 }
      );
    }

    if (error instanceof EmailAuthApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error("password-reset request-otp error", error);
    return NextResponse.json(
      { error: "Unable to send reset OTP right now. Please try again shortly." },
      { status: 500 }
    );
  }
}
