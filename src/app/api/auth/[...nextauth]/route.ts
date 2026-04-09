import authHandler from "@/lib/auth";
import { NextRequest } from "next/server";

import { enforceApiRateLimit } from "@/lib/security/api";

type RouteContext = {
  params: Promise<{
    nextauth: string[];
  }>;
};

const typedAuthHandler = authHandler as unknown as (
  request: NextRequest,
  context: RouteContext
) => Promise<Response>;

async function runAuthHandler(request: NextRequest, context: RouteContext) {
  const resolvedParams = await context.params;
  const nextAuthAction = resolvedParams.nextauth?.[0] ?? "unknown";
  const blockedResponse = await enforceApiRateLimit(request, {
    scope: "default",
    routeId: `auth/nextauth/${nextAuthAction}`,
  });

  if (blockedResponse) {
    return blockedResponse;
  }

  return typedAuthHandler(request, context);
}

export async function GET(request: NextRequest, context: RouteContext) {
  return runAuthHandler(request, context);
}

export async function POST(request: NextRequest, context: RouteContext) {
  return runAuthHandler(request, context);
}
