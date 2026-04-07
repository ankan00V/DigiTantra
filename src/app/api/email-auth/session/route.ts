import { NextRequest, NextResponse } from "next/server";

import { getEmailAuthUserFromToken } from "@/lib/email-auth/server";
import { EMAIL_AUTH_SESSION_COOKIE_NAME } from "@/lib/email-auth/shared";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const sessionToken =
    request.cookies.get(EMAIL_AUTH_SESSION_COOKIE_NAME)?.value ?? null;
  const user = await getEmailAuthUserFromToken(sessionToken);

  return NextResponse.json({
    authenticated: !!user,
    user,
  });
}
