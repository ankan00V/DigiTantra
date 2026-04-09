import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import {
  EmailAuthApiError,
  getEmailAuthCookieOptions,
  loginWithEmailPassword,
} from "@/lib/email-auth/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

export async function POST(request: NextRequest) {
  try {
    const body = loginSchema.parse(await request.json());
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
