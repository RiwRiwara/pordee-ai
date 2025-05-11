import crypto from "crypto";

import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import User from "@/models/User";
import connectToDatabase from "@/lib/mongodb";

// Import all other necessary dependencies

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          await connectToDatabase();

          // Find user by email
          const user = await User.findOne({ email: credentials.email });

          if (!user) {
            return null;
          }

          // Hash the password for comparison
          const hashedPassword = crypto
            .createHash("sha256")
            .update(credentials.password)
            .digest("hex");

          // Check if passwords match
          if (user.passwordHash !== hashedPassword) {
            return null;
          }

          // Return user data (excluding password)
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            image: user.profileImageUrl,
            languagePreference: user.languagePreference,
          };
        } catch (error) {
          console.error("Authorization error:", error);

          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.languagePreference = user.languagePreference;
        token.profileImageUrl = user.image || undefined; // Pass image from user to token (with null check)
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.firstName = token.firstName as string | undefined;
        session.user.lastName = token.lastName as string | undefined;
        session.user.languagePreference = token.languagePreference as
          | string
          | undefined;
        session.user.profileImageUrl = token.profileImageUrl as
          | string
          | undefined; // Pass image from token to session
      }

      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
    signOut: "/",
    error: "/auth/error",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
