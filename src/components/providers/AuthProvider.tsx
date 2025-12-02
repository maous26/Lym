"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";

// ==========================================
// AUTH PROVIDER - Wrapper pour la session NextAuth
// ==========================================

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  return (
    <SessionProvider
      // Rafraîchir la session toutes les 5 minutes
      refetchInterval={5 * 60}
      // Rafraîchir quand la fenêtre reprend le focus
      refetchOnWindowFocus={true}
    >
      {children}
    </SessionProvider>
  );
}
