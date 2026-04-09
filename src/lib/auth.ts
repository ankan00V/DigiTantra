import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

import { getMongoDb } from "@/lib/mongodb";

export const OAUTH_USERS_COLLECTION = "auth_oauth_users";

function parseUrl(value: string) {
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

function normalizeVercelOrigin() {
  const vercelUrl = process.env.VERCEL_URL?.trim();

  if (!vercelUrl) {
    return null;
  }

  const candidate = vercelUrl.startsWith("http://") || vercelUrl.startsWith("https://")
    ? vercelUrl
    : `https://${vercelUrl}`;
  const parsed = parseUrl(candidate);

  if (!parsed) {
    return null;
  }

  return `https://${parsed.host}`;
}

function validateAuthEnvironment() {
  if (process.env.NODE_ENV !== "production") {
    return;
  }

  const isVercelDeployment = process.env.VERCEL === "1";
  const isVercelProductionEnv =
    process.env.VERCEL_ENV === "production" || process.env.NEXT_PUBLIC_VERCEL_ENV === "production";

  // Keep local production builds and non-Vercel environments unblocked.
  // Hard enforcement runs for real Vercel production deployments.
  if (!isVercelDeployment || !isVercelProductionEnv) {
    return;
  }

  let nextAuthUrl = process.env.NEXTAUTH_URL?.trim();
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
  const nextAuthSecret = process.env.NEXTAUTH_SECRET?.trim();

  if (!clientId || !clientSecret) {
    throw new Error(
      "Google OAuth is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in production."
    );
  }

  if (!nextAuthSecret) {
    throw new Error("NEXTAUTH_SECRET is required in production.");
  }

  const parsedNextAuthUrl = nextAuthUrl ? parseUrl(nextAuthUrl) : null;
  const hasUnsafeNextAuthUrl =
    Boolean(nextAuthUrl) &&
    (!parsedNextAuthUrl ||
      parsedNextAuthUrl.protocol !== "https:" ||
      parsedNextAuthUrl.hostname === "localhost" ||
      parsedNextAuthUrl.hostname === "127.0.0.1");

  if (hasUnsafeNextAuthUrl) {
    const vercelOrigin = normalizeVercelOrigin();

    if (vercelOrigin) {
      nextAuthUrl = vercelOrigin;
      process.env.NEXTAUTH_URL = vercelOrigin;
      process.env.NEXTAUTH_URL_INTERNAL = vercelOrigin;
    }
  }

  if (!nextAuthUrl) {
    return;
  }

  const parsedUrl = parseUrl(nextAuthUrl);

  if (!parsedUrl) {
    throw new Error(
      `NEXTAUTH_URL is invalid: "${nextAuthUrl}". Set it to your deployed origin, for example https://digitantra.vercel.app.`
    );
  }

  if (parsedUrl.protocol !== "https:") {
    throw new Error(
      `NEXTAUTH_URL must use https in production. Received "${nextAuthUrl}".`
    );
  }

  if (parsedUrl.hostname === "localhost" || parsedUrl.hostname === "127.0.0.1") {
    throw new Error(
      `NEXTAUTH_URL points to localhost in production. Set it to your deployed origin and register ${parsedUrl.origin.replace(parsedUrl.origin, "https://your-domain.com")}/api/auth/callback/google in Google Cloud Console.`
    );
  }
}

validateAuthEnvironment();

async function syncOAuthUser(input: {
  email: string;
  name?: string | null;
  image?: string | null;
  provider?: string | null;
}) {
  const db = await getMongoDb();
  const users = db.collection(OAUTH_USERS_COLLECTION);
  const now = new Date();
  const emailLower = input.email.trim().toLowerCase();

  await users.updateOne(
    { emailLower },
    {
      $set: {
        email: input.email,
        emailLower,
        name: input.name ?? null,
        image: input.image ?? null,
        lastLoginAt: now,
      },
      ...(input.provider
        ? {
            $addToSet: {
              providers: input.provider,
            },
          }
        : {}),
      $setOnInsert: {
        createdAt: now,
      },
    },
    { upsert: true }
  );
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.email = user.email ?? token.email;
        token.name = user.name ?? token.name;
        token.picture = user.image ?? token.picture;
      }

      if (trigger === "update" && session) {
        if (typeof session.name === "string") {
          token.name = session.name;
        }

        if (typeof session.image === "string") {
          token.picture = session.image;
        } else if ("image" in session && session.image === null) {
          delete token.picture;
        }
      }

      return token;
    },
    async signIn({ user, account }) {
      if (!user.email) {
        return false;
      }

      await syncOAuthUser({
        email: user.email,
        name: user.name,
        image: user.image,
        provider: account?.provider ?? null,
      });

      return true;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.email = (token.email as string | undefined) ?? session.user.email;
        session.user.name = (token.name as string | undefined) ?? session.user.name;
        session.user.image = (token.picture as string | undefined) ?? session.user.image;
      }

      return session;
    },
  },
};

export default NextAuth(authOptions);
