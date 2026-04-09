import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import {
  aiChatbotAssistance,
} from "@/ai/flows/ai-chatbot-assistance";
import {
  enforceApiRateLimit,
  getJsonMaxBytes,
  isApiPayloadError,
  parseJsonBody,
} from "@/lib/security/api";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const aiChatbotRequestSchema = z.object({
  query: z
    .string()
    .trim()
    .min(1, "Query is required.")
    .max(2_000, "Query is too long."),
  pageContext: z
    .string()
    .trim()
    .max(120, "Page context is too long.")
    .optional(),
}).strict();

export async function POST(request: NextRequest) {
  const blockedResponse = await enforceApiRateLimit(request, {
    routeId: "ai-chatbot",
  });

  if (blockedResponse) {
    return blockedResponse;
  }

  try {
    const body = await parseJsonBody(request, aiChatbotRequestSchema, {
      maxBytes: getJsonMaxBytes("default"),
      oversizeMessage: "Chat request payload is too large.",
    });
    const response = await aiChatbotAssistance(body);

    return NextResponse.json(response);
  } catch (error) {
    if (isApiPayloadError(error)) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error("ai-chatbot request failed", error);

    return NextResponse.json(
      {
        error: "Unable to generate chatbot response.",
      },
      { status: 500 }
    );
  }
}
