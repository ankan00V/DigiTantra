import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import {
  EmailAuthApiError,
  requestEmailOtp,
} from "@/lib/email-auth/server";
import {
  enforceApiRateLimit,
  getJsonMaxBytes,
  isApiPayloadError,
  parseJsonBody,
} from "@/lib/security/api";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const requestOtpSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Please enter a valid email address.")
    .max(320, "Email is too long."),
  mode: z.literal("signup"),
  signup: z.object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters long.")
      .max(80, "Name must be 80 characters or fewer."),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long.")
      .max(128, "Password is too long.")
      .regex(/[a-z]/, "Password must include a lowercase letter.")
      .regex(/[A-Z]/, "Password must include an uppercase letter.")
      .regex(/\d/, "Password must include a number.")
      .regex(/[^A-Za-z0-9]/, "Password must include a special character."),
    image: z
      .string()
      .max(2_200_000, "Profile photo payload is too large.")
      .regex(
        /^data:image\/(?:png|jpeg|jpg|webp|gif);base64,[a-z0-9+/=]+$/i,
        "Profile photo must be a valid PNG, JPG, WEBP, or GIF image."
      )
      .nullable()
      .optional(),
  }).strict(),
}).strict();

export async function POST(request: NextRequest) {
  const blockedResponse = await enforceApiRateLimit(request, {
    scope: "auth",
    routeId: "email-auth/request-otp",
  });

  if (blockedResponse) {
    return blockedResponse;
  }

  try {
    const body = await parseJsonBody(request, requestOtpSchema, {
      maxBytes: getJsonMaxBytes("auth"),
      oversizeMessage: "Signup OTP payload is too large.",
    });
    const result = await requestEmailOtp(body);

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
        { error: error.issues[0]?.message ?? "Invalid OTP request." },
        { status: 400 }
      );
    }

    if (error instanceof EmailAuthApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error("email-auth request-otp error", error);
    return NextResponse.json(
      { error: "Unable to send the OTP right now. Please try again shortly." },
      { status: 500 }
    );
  }
}
