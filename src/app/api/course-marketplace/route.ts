import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

import {
  buildRefreshSummary,
  getCourseMarketplaceCatalog,
  refreshCourseMarketplaceCatalog,
} from "@/lib/course-marketplace/server";
import { enforceApiRateLimit } from "@/lib/security/api";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const CRON_TOKEN_ENV_KEY = "COURSE_MARKETPLACE_REFRESH_TOKEN";
const VERCEL_CRON_SECRET_ENV_KEY = "CRON_SECRET";
const MAX_TOKEN_LENGTH = 512;

function sanitizeTokenCandidate(value: string | null | undefined) {
  const trimmed = value?.trim();

  if (!trimmed) {
    return null;
  }

  if (trimmed.length > MAX_TOKEN_LENGTH) {
    return null;
  }

  // Reject non-printable characters in auth tokens.
  if (/[^\x21-\x7e]/.test(trimmed)) {
    return null;
  }

  return trimmed;
}

function getRefreshTokenCandidate(request: NextRequest) {
  const authorizationHeader = request.headers.get("authorization");

  if (authorizationHeader?.startsWith("Bearer ")) {
    return sanitizeTokenCandidate(authorizationHeader.slice("Bearer ".length));
  }

  return sanitizeTokenCandidate(request.headers.get("x-refresh-token"));
}

function tokensMatch(expectedToken: string, providedToken: string) {
  const expectedBuffer = Buffer.from(expectedToken);
  const providedBuffer = Buffer.from(providedToken);

  if (expectedBuffer.length !== providedBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, providedBuffer);
}

function getConfiguredRefreshTokens() {
  return [process.env[CRON_TOKEN_ENV_KEY], process.env[VERCEL_CRON_SECRET_ENV_KEY]]
    .map((value) => value?.trim())
    .filter((value): value is string => Boolean(value));
}

function isAuthorizedRefreshToken(providedToken: string, expectedTokens: string[]) {
  return expectedTokens.some((token) => tokensMatch(token, providedToken));
}

function buildRefreshPayload(catalog: Awaited<ReturnType<typeof refreshCourseMarketplaceCatalog>>) {
  return {
    ok: true,
    refreshedAt: catalog.refreshedAt,
    nextSuggestedRefreshAt: catalog.nextSuggestedRefreshAt,
    refreshIntervalMinutes: catalog.refreshIntervalMinutes,
    summary: buildRefreshSummary(catalog),
  };
}

export async function GET(request: NextRequest) {
  const blockedResponse = await enforceApiRateLimit(request, {
    routeId: "course-marketplace:get",
  });

  if (blockedResponse) {
    return blockedResponse;
  }

  const providedToken = getRefreshTokenCandidate(request);
  const expectedTokens = getConfiguredRefreshTokens();

  if (providedToken) {
    if (!expectedTokens.length) {
      return NextResponse.json(
        {
          error: `${CRON_TOKEN_ENV_KEY} or ${VERCEL_CRON_SECRET_ENV_KEY} is not configured.`,
        },
        { status: 500 }
      );
    }

    if (!isAuthorizedRefreshToken(providedToken, expectedTokens)) {
      return NextResponse.json(
        {
          error: "Unauthorized refresh request.",
        },
        { status: 401 }
      );
    }

    const refreshedCatalog = await refreshCourseMarketplaceCatalog();
    return NextResponse.json(buildRefreshPayload(refreshedCatalog));
  }

  const catalog = await getCourseMarketplaceCatalog();
  return NextResponse.json(catalog);
}

export async function POST(request: NextRequest) {
  const blockedResponse = await enforceApiRateLimit(request, {
    routeId: "course-marketplace:post",
  });

  if (blockedResponse) {
    return blockedResponse;
  }

  const expectedTokens = getConfiguredRefreshTokens();

  if (!expectedTokens.length) {
    return NextResponse.json(
      {
        error: `${CRON_TOKEN_ENV_KEY} or ${VERCEL_CRON_SECRET_ENV_KEY} is not configured.`,
      },
      { status: 500 }
    );
  }

  const providedToken = getRefreshTokenCandidate(request);

  if (!providedToken || !isAuthorizedRefreshToken(providedToken, expectedTokens)) {
    return NextResponse.json(
      {
        error: "Unauthorized refresh request.",
      },
      { status: 401 }
    );
  }

  const catalog = await refreshCourseMarketplaceCatalog();
  return NextResponse.json(buildRefreshPayload(catalog));
}
