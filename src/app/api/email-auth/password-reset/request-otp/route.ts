import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import {
  EmailAuthApiError,
  requestPasswordResetOtp,
} from "@/lib/email-auth/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const requestPasswordResetSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
});

export async function POST(request: NextRequest) {
  try {
    const body = requestPasswordResetSchema.parse(await request.json());
    const result = await requestPasswordResetOtp(body);

    return NextResponse.json({
      ok: true,
      email: result.email,
      expiresAt: result.expiresAt,
    });
  } catch (error) {
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
