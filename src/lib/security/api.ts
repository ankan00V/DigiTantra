import { createHash } from "node:crypto";

import { NextRequest, NextResponse } from "next/server";
import type { z } from "zod";

import { getMongoDb } from "@/lib/mongodb";

const RATE_LIMIT_COLLECTION = "api_rate_limits";
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_TTL_PADDING_MS = 60 * 1000;
const DEFAULT_API_RATE_LIMIT = 120;
const AUTH_API_RATE_LIMIT = 5;
const DEFAULT_JSON_MAX_BYTES = 64 * 1024;
const AUTH_JSON_MAX_BYTES = 2 * 1024 * 1024;

type ApiRateLimitScope = "default" | "auth";

type RateLimitDocument = {
  _id: string;
  clientHash: string;
  count: number;
  createdAt: Date;
  expiresAt: Date;
  routeId: string;
  scope: ApiRateLimitScope;
  updatedAt: Date;
  windowStart: Date;
};

type GlobalSecurityState = typeof globalThis & {
  __digitantraRateLimitIndexesPromise__?: Promise<void>;
};

const globalForSecurity = globalThis as GlobalSecurityState;

export class ApiPayloadError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "ApiPayloadError";
    this.status = status;
  }
}

function toSha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function getClientIp(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip")?.trim();

  if (forwarded) {
    const firstIp = forwarded.split(",")[0]?.trim();
    if (firstIp) {
      return firstIp;
    }
  }

  if (realIp) {
    return realIp;
  }

  return "unknown";
}

function getRateLimitConfig(scope: ApiRateLimitScope) {
  return {
    limit: scope === "auth" ? AUTH_API_RATE_LIMIT : DEFAULT_API_RATE_LIMIT,
    windowMs: RATE_LIMIT_WINDOW_MS,
  };
}

async function ensureRateLimitIndexes() {
  if (!globalForSecurity.__digitantraRateLimitIndexesPromise__) {
    globalForSecurity.__digitantraRateLimitIndexesPromise__ = (async () => {
      const db = await getMongoDb();
      await db
        .collection<RateLimitDocument>(RATE_LIMIT_COLLECTION)
        .createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
    })();
  }

  await globalForSecurity.__digitantraRateLimitIndexesPromise__;
}

function applyRateLimitHeaders(
  response: NextResponse,
  { limit, remaining, resetAtUnix, retryAfterSeconds }: {
    limit: number;
    remaining: number;
    resetAtUnix: number;
    retryAfterSeconds?: number;
  }
) {
  response.headers.set("X-RateLimit-Limit", String(limit));
  response.headers.set("X-RateLimit-Remaining", String(Math.max(0, remaining)));
  response.headers.set("X-RateLimit-Reset", String(resetAtUnix));

  if (typeof retryAfterSeconds === "number") {
    response.headers.set("Retry-After", String(Math.max(1, retryAfterSeconds)));
  }
}

export async function enforceApiRateLimit(
  request: NextRequest,
  options?: {
    routeId?: string;
    scope?: ApiRateLimitScope;
  }
) {
  const scope = options?.scope ?? "default";
  const routeId = options?.routeId ?? request.nextUrl.pathname;
  const { limit, windowMs } = getRateLimitConfig(scope);
  const nowMs = Date.now();
  const windowStartMs = Math.floor(nowMs / windowMs) * windowMs;
  const resetAtMs = windowStartMs + windowMs;
  const resetAtUnix = Math.floor(resetAtMs / 1000);
  const retryAfterSeconds = Math.max(1, Math.ceil((resetAtMs - nowMs) / 1000));
  const clientIp = getClientIp(request);
  const userAgent = request.headers.get("user-agent")?.slice(0, 200) ?? "unknown";
  const clientFingerprint = `${clientIp}:${userAgent}`;
  const clientHash = toSha256(clientFingerprint);
  const key = toSha256(`${scope}:${routeId}:${clientFingerprint}:${windowStartMs}`);

  try {
    await ensureRateLimitIndexes();

    const db = await getMongoDb();
    const collection = db.collection<RateLimitDocument>(RATE_LIMIT_COLLECTION);
    const now = new Date(nowMs);
    const expiresAt = new Date(resetAtMs + RATE_LIMIT_TTL_PADDING_MS);
    const windowStart = new Date(windowStartMs);

    const document = await collection.findOneAndUpdate(
      { _id: key },
      {
        $inc: { count: 1 },
        $set: {
          clientHash,
          expiresAt,
          routeId,
          scope,
          updatedAt: now,
          windowStart,
        },
        $setOnInsert: {
          createdAt: now,
        },
      },
      {
        upsert: true,
        returnDocument: "after",
      }
    );

    const nextCount = document?.count ?? 1;
    const remaining = limit - nextCount;

    if (nextCount > limit) {
      const response = NextResponse.json(
        {
          error:
            scope === "auth"
              ? "Too many auth attempts. Please try again later."
              : "Too many requests. Please try again later.",
        },
        { status: 429 }
      );
      applyRateLimitHeaders(response, {
        limit,
        remaining: 0,
        resetAtUnix,
        retryAfterSeconds,
      });
      return response;
    }

    return null;
  } catch (error) {
    console.error("[security] rate limit enforcement failed", error);

    return NextResponse.json(
      { error: "Unable to verify request limits right now." },
      { status: 503 }
    );
  }
}

function parseContentLength(request: NextRequest) {
  const raw = request.headers.get("content-length");

  if (!raw) {
    return null;
  }

  const parsed = Number(raw);

  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new ApiPayloadError("Invalid Content-Length header.", 400);
  }

  return parsed;
}

function assertJsonContentType(request: NextRequest) {
  const contentType = request.headers.get("content-type");

  if (!contentType || !contentType.toLowerCase().includes("application/json")) {
    throw new ApiPayloadError("Content-Type must be application/json.", 415);
  }
}

function assertPayloadSize(
  length: number,
  maxBytes: number,
  message = "Request payload is too large."
) {
  if (length > maxBytes) {
    throw new ApiPayloadError(message, 413);
  }
}

async function readRequestBodyWithinLimit(
  request: NextRequest,
  maxBytes: number,
  oversizeMessage: string
) {
  if (!request.body) {
    throw new ApiPayloadError("Request body is required.", 400);
  }

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      if (!value) {
        continue;
      }

      totalBytes += value.byteLength;
      assertPayloadSize(totalBytes, maxBytes, oversizeMessage);
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  if (!totalBytes) {
    throw new ApiPayloadError("Request body is required.", 400);
  }

  const merged = new Uint8Array(totalBytes);
  let offset = 0;

  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return new TextDecoder().decode(merged);
}

export async function parseJsonBody<T extends z.ZodTypeAny>(
  request: NextRequest,
  schema: T,
  options?: {
    maxBytes?: number;
    oversizeMessage?: string;
  }
): Promise<z.infer<T>> {
  assertJsonContentType(request);

  const maxBytes = options?.maxBytes ?? DEFAULT_JSON_MAX_BYTES;
  const contentLength = parseContentLength(request);
  const oversizeMessage = options?.oversizeMessage ?? "Request payload is too large.";

  if (contentLength !== null) {
    assertPayloadSize(contentLength, maxBytes, oversizeMessage);
  }

  const rawBody = await readRequestBodyWithinLimit(request, maxBytes, oversizeMessage);

  if (!rawBody.trim()) {
    throw new ApiPayloadError("Request body is required.", 400);
  }

  let jsonBody: unknown;

  try {
    jsonBody = JSON.parse(rawBody);
  } catch {
    throw new ApiPayloadError("Malformed JSON payload.", 400);
  }

  const parsed = schema.safeParse(jsonBody);

  if (!parsed.success) {
    throw new ApiPayloadError(
      parsed.error.issues[0]?.message ?? "Invalid request payload.",
      400
    );
  }

  return parsed.data;
}

export function isApiPayloadError(error: unknown): error is ApiPayloadError {
  return error instanceof ApiPayloadError;
}

export function getJsonMaxBytes(scope: ApiRateLimitScope = "default") {
  return scope === "auth" ? AUTH_JSON_MAX_BYTES : DEFAULT_JSON_MAX_BYTES;
}
