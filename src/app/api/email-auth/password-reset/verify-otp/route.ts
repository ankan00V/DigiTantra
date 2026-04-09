import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import {
  EmailAuthApiError,
  resetPasswordWithOtp,
} from "@/lib/email-auth/server";
import {
  enforceApiRateLimit,
  getJsonMaxBytes,
  isApiPayloadError,
  parseJsonBody,
} from "@/lib/security/api";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const verifyPasswordResetSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Please enter a valid email address.")
    .max(320, "Email is too long."),
  otp: z.string().trim().regex(/^\d{6}$/, "Enter the 6-digit OTP."),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters long.")
    .max(128, "Password is too long.")
    .regex(/[a-z]/, "Password must include a lowercase letter.")
    .regex(/[A-Z]/, "Password must include an uppercase letter.")
    .regex(/\d/, "Password must include a number.")
    .regex(/[^A-Za-z0-9]/, "Password must include a special character."),
}).strict();

export async function POST(request: NextRequest) {
  const blockedResponse = await enforceApiRateLimit(request, {
    scope: "auth",
    routeId: "email-auth/password-reset/verify-otp",
  });

  if (blockedResponse) {
    return blockedResponse;
  }

  try {
    const body = await parseJsonBody(request, verifyPasswordResetSchema, {
      maxBytes: getJsonMaxBytes("auth"),
      oversizeMessage: "Password reset verification payload is too large.",
    });
    const result = await resetPasswordWithOtp(body);

    return NextResponse.json({
      ok: true,
      email: result.email,
    });
  } catch (error) {
    if (isApiPayloadError(error)) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "Invalid password reset verification." },
        { status: 400 }
      );
    }

    if (error instanceof EmailAuthApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error("password-reset verify-otp error", error);
    return NextResponse.json(
      { error: "Unable to reset password right now. Please try again." },
      { status: 500 }
    );
  }
}
