import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import {
  EmailAuthApiError,
  getEmailAuthCookieOptions,
  verifyEmailOtp,
} from "@/lib/email-auth/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const verifyOtpSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  otp: z.string().trim().regex(/^\d{6}$/, "Enter the 6-digit OTP."),
  mode: z.enum(["login", "signup"]),
});

export async function POST(request: NextRequest) {
  try {
    const body = verifyOtpSchema.parse(await request.json());
    const result = await verifyEmailOtp(body);
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
