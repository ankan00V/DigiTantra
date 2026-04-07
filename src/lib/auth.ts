import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

import { getMongoDb } from "@/lib/mongodb";

const OAUTH_USERS_COLLECTION = "auth_oauth_users";

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
