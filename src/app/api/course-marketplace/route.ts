import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

import {
  buildRefreshSummary,
  getCourseMarketplaceCatalog,
  refreshCourseMarketplaceCatalog,
} from "@/lib/course-marketplace/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const CRON_TOKEN_ENV_KEY = "COURSE_MARKETPLACE_REFRESH_TOKEN";

function getRefreshTokenCandidate(request: NextRequest) {
  const authorizationHeader = request.headers.get("authorization");

  if (authorizationHeader?.startsWith("Bearer ")) {
    return authorizationHeader.slice("Bearer ".length).trim();
  }

  return request.headers.get("x-refresh-token")?.trim() ?? null;
}

function tokensMatch(expectedToken: string, providedToken: string) {
  const expectedBuffer = Buffer.from(expectedToken);
  const providedBuffer = Buffer.from(providedToken);

  if (expectedBuffer.length !== providedBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, providedBuffer);
}

export async function GET() {
  const catalog = await getCourseMarketplaceCatalog();
  return NextResponse.json(catalog);
}

export async function POST(request: NextRequest) {
  const expectedToken = process.env[CRON_TOKEN_ENV_KEY];

  if (!expectedToken) {
    return NextResponse.json(
      {
        error: `${CRON_TOKEN_ENV_KEY} is not configured.`,
      },
      { status: 500 }
    );
  }

  const providedToken = getRefreshTokenCandidate(request);

  if (!providedToken || !tokensMatch(expectedToken, providedToken)) {
    return NextResponse.json(
      {
        error: "Unauthorized refresh request.",
      },
      { status: 401 }
    );
  }

  const catalog = await refreshCourseMarketplaceCatalog();
  return NextResponse.json({
    ok: true,
    refreshedAt: catalog.refreshedAt,
    nextSuggestedRefreshAt: catalog.nextSuggestedRefreshAt,
    refreshIntervalMinutes: catalog.refreshIntervalMinutes,
    summary: buildRefreshSummary(catalog),
  });
}
