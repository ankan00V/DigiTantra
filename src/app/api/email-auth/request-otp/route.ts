import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import {
  EmailAuthApiError,
  requestEmailOtp,
} from "@/lib/email-auth/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const requestOtpSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  mode: z.enum(["login", "signup"]),
});

export async function POST(request: NextRequest) {
  try {
    const body = requestOtpSchema.parse(await request.json());
    const result = await requestEmailOtp(body);

    return NextResponse.json({
      ok: true,
      email: result.email,
      expiresAt: result.expiresAt,
    });
  } catch (error) {
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
