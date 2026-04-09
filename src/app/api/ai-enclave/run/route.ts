import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import {
  runAiEnclaveService,
  type RunAiEnclaveServiceInput,
} from "@/ai/flows/run-ai-enclave-service";
import { AI_ENCLAVE_SERVICE_SECTIONS } from "@/lib/ai-enclave/services";
import { authOptions } from "@/lib/auth";
import { getEmailAuthUserFromToken } from "@/lib/email-auth/server";
import { EMAIL_AUTH_SESSION_COOKIE_NAME } from "@/lib/email-auth/shared";
import {
  enforceApiRateLimit,
  getJsonMaxBytes,
  isApiPayloadError,
  parseJsonBody,
} from "@/lib/security/api";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const validServiceIds = new Set<string>(
  AI_ENCLAVE_SERVICE_SECTIONS.flatMap((section) => section.services.map((service) => service.id))
);

const runAiEnclaveSchema = z
  .object({
    serviceId: z
      .string()
      .trim()
      .min(1, "Service ID is required.")
      .max(80, "Service ID is too long.")
      .refine((value) => validServiceIds.has(value), {
        message: "Invalid AI Enclave service.",
      }),
    values: z.record(z.string().trim().max(8_000, "Input value is too long.")),
  })
  .strict()
  .superRefine((value, context) => {
    const entries = Object.entries(value.values);

    if (!entries.length) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "At least one input field is required.",
      });
      return;
    }

    if (entries.length > 64) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Too many input fields were provided.",
      });
      return;
    }

    for (const [key] of entries) {
      if (key.length > 64) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Input field names must be 64 characters or fewer.",
        });
        return;
      }

      if (!/^[a-zA-Z0-9_-]+$/.test(key)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Input field names can only contain letters, numbers, hyphens, or underscores.",
        });
        return;
      }
    }
  });

export async function POST(request: NextRequest) {
  const blockedResponse = await enforceApiRateLimit(request, {
    routeId: "ai-enclave/run",
  });

  if (blockedResponse) {
    return blockedResponse;
  }

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
    body = await parseJsonBody(request, runAiEnclaveSchema, {
      maxBytes: getJsonMaxBytes("default"),
      oversizeMessage: "AI Enclave payload is too large.",
    });
  } catch (error) {
    if (isApiPayloadError(error)) {
      return NextResponse.json(
        {
          error: error.message,
        },
        { status: error.status }
      );
    }

    return NextResponse.json(
      {
        error: "Invalid AI Enclave request payload.",
      },
      { status: 400 }
    );
  }

  try {
    const result = await runAiEnclaveService(body);
    return NextResponse.json(result);
  } catch (error) {
    console.error("ai-enclave route execution failed", error);

    return NextResponse.json(
      {
        error: "Failed to run AI enclave service.",
      },
      { status: 500 }
    );
  }
}
