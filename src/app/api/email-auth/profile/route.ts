import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { ObjectId } from "mongodb";

import { authOptions, OAUTH_USERS_COLLECTION } from "@/lib/auth";
import {
  EmailAuthApiError,
  getEmailAuthUserFromToken,
  updateEmailAuthProfile,
} from "@/lib/email-auth/server";
import { EMAIL_AUTH_SESSION_COOKIE_NAME } from "@/lib/email-auth/shared";
import { getMongoDb } from "@/lib/mongodb";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_PROFILE_IMAGE_BYTES = 1_500_000;

const updateProfileSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters long.").optional(),
  image: z.string().nullable().optional(),
});

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

function normalizeOAuthProfileImageDataUrl(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const normalized = value.trim();

  if (!normalized) {
    return null;
  }

  const match = normalized.match(
    /^data:image\/(?:png|jpeg|jpg|webp|gif);base64,([a-z0-9+/=]+)$/i
  );

  if (!match) {
    throw new EmailAuthApiError(
      "Profile photo must be a valid PNG, JPG, WEBP, or GIF image.",
      400
    );
  }

  const decoded = Buffer.from(match[1], "base64");

  if (!decoded.length || decoded.length > MAX_PROFILE_IMAGE_BYTES) {
    throw new EmailAuthApiError("Profile photo must be 1.5 MB or smaller.", 400);
  }

  return normalized;
}

async function getOAuthSessionEmail() {
  const oauthSession = await getServerSession(authOptions);
  const sessionEmail = oauthSession?.user?.email?.trim();

  if (!sessionEmail) {
    return null;
  }

  return sessionEmail;
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

async function updateOAuthProfile({
  email,
  name,
  image,
}: {
  email: string;
  name?: string;
  image?: string | null;
}) {
  const db = await getMongoDb();
  const users = db.collection<OAuthUserDocument>(OAUTH_USERS_COLLECTION);
  const emailLower = normalizeEmail(email);

  const updates: Partial<Pick<OAuthUserDocument, "name" | "image">> = {};

  if (typeof name !== "undefined") {
    updates.name = name.trim();
  }

  if (typeof image !== "undefined") {
    updates.image = normalizeOAuthProfileImageDataUrl(image);
  }

  if (!Object.keys(updates).length) {
    throw new EmailAuthApiError("No profile changes were provided.", 400);
  }

  const now = new Date();

  await users.updateOne(
    { emailLower },
    {
      $set: {
        ...updates,
        email,
        emailLower,
      },
      $setOnInsert: {
        createdAt: now,
        lastLoginAt: now,
      },
    },
    { upsert: true }
  );

  return users.findOne({ emailLower });
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

    const sessionEmail = await getOAuthSessionEmail();

    if (!sessionEmail) {
      return NextResponse.json(
        {
          authenticated: false,
          user: null,
        },
        { status: 401 }
      );
    }

    const oauthUser = await getOrCreateOAuthUser(sessionEmail);

    if (!oauthUser) {
      return NextResponse.json(
        { authenticated: false, user: null, error: "Unable to load profile right now." },
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

    console.error("email-auth profile get error", error);
    return NextResponse.json(
      { authenticated: false, user: null, error: "Unable to load profile right now." },
      { status: 503 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const sessionToken =
      request.cookies.get(EMAIL_AUTH_SESSION_COOKIE_NAME)?.value ?? null;
    const body = updateProfileSchema.parse(await request.json());

    const emailSessionUser = await getEmailAuthUserFromToken(sessionToken);
    if (emailSessionUser) {
      const user = await updateEmailAuthProfile({
        sessionToken,
        name: body.name,
        image: body.image,
      });

      return NextResponse.json({
        ok: true,
        user,
      });
    }

    const sessionEmail = await getOAuthSessionEmail();

    if (!sessionEmail) {
      throw new EmailAuthApiError("You must be logged in to update profile.", 401);
    }

    const updatedOAuthUser = await updateOAuthProfile({
      email: sessionEmail,
      name: body.name,
      image: body.image,
    });

    if (!updatedOAuthUser) {
      throw new EmailAuthApiError("Unable to update profile right now.", 503);
    }

    return NextResponse.json({
      ok: true,
      user: toOAuthApiUser(updatedOAuthUser),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "Invalid profile update request." },
        { status: 400 }
      );
    }

    if (error instanceof EmailAuthApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error("email-auth profile patch error", error);
    return NextResponse.json(
      { error: "Unable to update profile right now. Please try again." },
      { status: 500 }
    );
  }
}
