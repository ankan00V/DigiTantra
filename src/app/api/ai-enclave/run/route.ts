import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import {
  runAiEnclaveService,
  type RunAiEnclaveServiceInput,
} from "@/ai/flows/run-ai-enclave-service";
import { authOptions } from "@/lib/auth";
import { getEmailAuthUserFromToken } from "@/lib/email-auth/server";
import { EMAIL_AUTH_SESSION_COOKIE_NAME } from "@/lib/email-auth/shared";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function toErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown error";
}

export async function POST(request: NextRequest) {
  const [oauthSession, emailSession] = await Promise.all([
    getServerSession(authOptions),
    getEmailAuthUserFromToken(
      request.cookies.get(EMAIL_AUTH_SESSION_COOKIE_NAME)?.value ?? null
    ),
  ]);

  const isAuthenticated = Boolean(oauthSession?.user?.email || emailSession);

  if (!isAuthenticated) {
    return NextResponse.json(
      {
        error: "Authentication required.",
      },
      { status: 401 }
    );
  }

  let body: RunAiEnclaveServiceInput;

  try {
    body = (await request.json()) as RunAiEnclaveServiceInput;
  } catch {
    return NextResponse.json(
      {
        error: "Invalid JSON payload.",
      },
      { status: 400 }
    );
  }

  try {
    const result = await runAiEnclaveService(body);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to run AI enclave service.",
        message: toErrorMessage(error),
      },
      { status: 500 }
    );
  }
}
