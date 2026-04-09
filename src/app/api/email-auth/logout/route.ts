import { NextRequest, NextResponse } from "next/server";

import {
  EmailAuthApiError,
  getEmailAuthCookieOptions,
  revokeEmailAuthSession,
} from "@/lib/email-auth/server";
import { EMAIL_AUTH_SESSION_COOKIE_NAME } from "@/lib/email-auth/shared";
import { enforceApiRateLimit } from "@/lib/security/api";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const blockedResponse = await enforceApiRateLimit(request, {
    routeId: "email-auth/logout",
  });

  if (blockedResponse) {
    return blockedResponse;
  }

  try {
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
  } catch (error) {
    const cookie = getEmailAuthCookieOptions(new Date(0));
    const response = NextResponse.json(
      {
        ok: false,
        error:
          error instanceof EmailAuthApiError
            ? error.message
            : "Unable to revoke the email auth session right now.",
      },
      { status: error instanceof EmailAuthApiError ? error.status : 503 }
    );

    response.cookies.set({
      ...cookie.options,
      name: cookie.name,
      value: "",
      expires: new Date(0),
    });

    return response;
  }
}
