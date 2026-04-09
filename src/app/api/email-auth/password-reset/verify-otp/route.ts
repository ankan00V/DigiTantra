import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import {
  EmailAuthApiError,
  resetPasswordWithOtp,
} from "@/lib/email-auth/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const verifyPasswordResetSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  otp: z.string().trim().regex(/^\d{6}$/, "Enter the 6-digit OTP."),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters long.")
    .max(128, "Password is too long.")
    .regex(/[a-z]/, "Password must include a lowercase letter.")
    .regex(/[A-Z]/, "Password must include an uppercase letter.")
    .regex(/\d/, "Password must include a number.")
    .regex(/[^A-Za-z0-9]/, "Password must include a special character."),
});

export async function POST(request: NextRequest) {
  try {
    const body = verifyPasswordResetSchema.parse(await request.json());
    const result = await resetPasswordWithOtp(body);

    return NextResponse.json({
      ok: true,
      email: result.email,
    });
  } catch (error) {
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
