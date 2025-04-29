import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      firstName?: string;
      lastName?: string;
      languagePreference?: string;
      profileImageUrl?: string;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    firstName?: string;
    lastName?: string;
    languagePreference?: string;
    profileImageUrl?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    firstName?: string;
    lastName?: string;
    languagePreference?: string;
    profileImageUrl?: string;
  }
}
