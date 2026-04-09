import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { ObjectId } from "mongodb";

import { authOptions, OAUTH_USERS_COLLECTION } from "@/lib/auth";
import { EmailAuthApiError, getEmailAuthUserFromToken } from "@/lib/email-auth/server";
import { EMAIL_AUTH_SESSION_COOKIE_NAME } from "@/lib/email-auth/shared";
import { getMongoDb } from "@/lib/mongodb";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type OAuthUserDocument = {
  _id: ObjectId;
  email: string;
  emailLower: string;
  name: string | null;
  image: string | null;
  providers?: string[];
  createdAt: Date;
  lastLoginAt: Date | null;
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

async function getOrCreateOAuthUser(sessionEmail: string) {
  const db = await getMongoDb();
  const users = db.collection<OAuthUserDocument>(OAUTH_USERS_COLLECTION);
  const emailLower = normalizeEmail(sessionEmail);
  const now = new Date();

  await users.updateOne(
    { emailLower },
    {
      $set: {
        email: sessionEmail,
        emailLower,
      },
      $setOnInsert: {
        name: null,
        image: null,
        createdAt: now,
        lastLoginAt: now,
      },
    },
    { upsert: true }
  );

  return users.findOne({ emailLower });
}

function toOAuthApiUser(user: OAuthUserDocument) {
  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    image: user.image,
    provider: "google-oauth",
    emailVerifiedAt: null,
    createdAt: user.createdAt.toISOString(),
    lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
  };
}

export async function GET(request: NextRequest) {
  try {
    const sessionToken =
      request.cookies.get(EMAIL_AUTH_SESSION_COOKIE_NAME)?.value ?? null;
    const user = await getEmailAuthUserFromToken(sessionToken);

    if (user) {
      return NextResponse.json({
        authenticated: true,
        user,
      });
    }

    const oauthSession = await getServerSession(authOptions);
    const sessionEmail = oauthSession?.user?.email?.trim();

    if (!sessionEmail) {
      return NextResponse.json({
        authenticated: false,
        user: null,
      });
    }

    const oauthUser = await getOrCreateOAuthUser(sessionEmail);

    if (!oauthUser) {
      return NextResponse.json(
        {
          authenticated: false,
          user: null,
          error: "Unable to read the OAuth session right now.",
        },
        { status: 503 }
      );
    }

    return NextResponse.json({
      authenticated: true,
      user: toOAuthApiUser(oauthUser),
    });
  } catch (error) {
    if (error instanceof EmailAuthApiError) {
      return NextResponse.json(
        {
          authenticated: false,
          user: null,
          error: error.message,
        },
        { status: error.status }
      );
    }

    console.error("email-auth session error", error);
    return NextResponse.json(
      {
        authenticated: false,
        user: null,
        error: "Unable to read the email auth session right now.",
      },
      { status: 503 }
    );
  }
}
