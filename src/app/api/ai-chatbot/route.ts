import { NextRequest, NextResponse } from "next/server";

import {
  aiChatbotAssistance,
  type AiChatbotAssistanceInput,
} from "@/ai/flows/ai-chatbot-assistance";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as AiChatbotAssistanceInput;
    const response = await aiChatbotAssistance(body);

    return NextResponse.json(response);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to generate chatbot response.";

    return NextResponse.json(
      {
        error: message,
      },
      { status: 500 }
    );
  }
}
