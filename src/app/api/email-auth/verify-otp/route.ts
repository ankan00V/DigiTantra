import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import {
  EmailAuthApiError,
  verifyEmailOtp,
} from "@/lib/email-auth/server";
import {
  enforceApiRateLimit,
  getJsonMaxBytes,
  isApiPayloadError,
  parseJsonBody,
} from "@/lib/security/api";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const verifyOtpSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Please enter a valid email address.")
    .max(320, "Email is too long."),
  otp: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Enter the 6-digit OTP."),
  mode: z.literal("signup"),
}).strict();

export async function POST(request: NextRequest) {
  const blockedResponse = await enforceApiRateLimit(request, {
    scope: "auth",
    routeId: "email-auth/verify-otp",
  });

  if (blockedResponse) {
    return blockedResponse;
  }

  try {
    const body = await parseJsonBody(request, verifyOtpSchema, {
      maxBytes: getJsonMaxBytes("auth"),
      oversizeMessage: "OTP verification payload is too large.",
    });
    const result = await verifyEmailOtp(body);
    return NextResponse.json({
      ok: true,
      user: result.user,
    });
  } catch (error) {
    if (isApiPayloadError(error)) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "Invalid OTP verification request." },
        { status: 400 }
      );
    }

    if (error instanceof EmailAuthApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error("email-auth verify-otp error", error);
    return NextResponse.json(
      { error: "Unable to verify that OTP right now. Please try again." },
      { status: 500 }
    );
  }
}
