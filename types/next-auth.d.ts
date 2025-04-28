import { DefaultSession, DefaultUser } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      firstName?: string;
      lastName?: string;
      languagePreference?: string;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    firstName?: string;
    lastName?: string;
    languagePreference?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    firstName?: string;
    lastName?: string;
    languagePreference?: string;
  }
}
