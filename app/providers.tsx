"use client";

import type { ThemeProviderProps } from "next-themes";

import * as React from "react";
import { HeroUIProvider } from "@heroui/system";
import { useRouter } from "next/navigation";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { SessionProvider } from "next-auth/react";
import { ToastProvider } from "@heroui/toast";

import { AuthProvider } from "@/context/AuthContext";
import { GuestProvider } from "@/context/GuestContext";

export interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
}

declare module "@react-types/shared" {
  interface RouterConfig {
    routerOptions: NonNullable<
      Parameters<ReturnType<typeof useRouter>["push"]>[1]
    >;
  }
}

export function Providers({ children, themeProps }: ProvidersProps) {
  const router = useRouter();

  return (
    <SessionProvider>
      <HeroUIProvider navigate={router.push}>
        <ToastProvider placement="top-center" />
        <NextThemesProvider {...themeProps}>
          <AuthProvider>
            <GuestProvider>{children}</GuestProvider>
          </AuthProvider>
        </NextThemesProvider>
      </HeroUIProvider>
    </SessionProvider>
  );
}
