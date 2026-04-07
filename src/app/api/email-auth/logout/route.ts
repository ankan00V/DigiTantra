import { NextRequest, NextResponse } from "next/server";

import {
  getEmailAuthCookieOptions,
  revokeEmailAuthSession,
} from "@/lib/email-auth/server";
import { EMAIL_AUTH_SESSION_COOKIE_NAME } from "@/lib/email-auth/shared";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const sessionToken =
    request.cookies.get(EMAIL_AUTH_SESSION_COOKIE_NAME)?.value ?? null;
  await revokeEmailAuthSession(sessionToken);

  const response = NextResponse.json({ ok: true });
  const cookie = getEmailAuthCookieOptions(new Date(0));

  response.cookies.set({
    ...cookie.options,
    name: cookie.name,
    value: "",
    expires: new Date(0),
  });

  return response;
}
