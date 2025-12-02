import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import type { Adapter } from "next-auth/adapters";

// ==========================================
// CONFIGURATION NEXTAUTH - AUTHENTIFICATION
// ==========================================

export const authOptions: NextAuthOptions = {
  // Adapter Prisma pour persister les utilisateurs en base
  adapter: PrismaAdapter(prisma) as Adapter,

  // Stratégie de session : JWT pour performance + scalabilité
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 jours
  },

  // Providers d'authentification
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],

  // Pages personnalisées
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
    newUser: "/auth/plan-selection", // Redirection pour les nouveaux utilisateurs
  },

  // Callbacks pour personnaliser le comportement
  callbacks: {
    // Enrichir le JWT avec les données utilisateur
    async jwt({ token, user, trigger, session }) {
      // Première connexion : ajouter les données utilisateur au token
      if (user) {
        token.id = user.id;
        token.subscriptionPlan = user.subscriptionPlan || "basic";
      }

      // Mise à jour de session (ex: changement de plan)
      if (trigger === "update" && session?.subscriptionPlan) {
        token.subscriptionPlan = session.subscriptionPlan;
      }

      return token;
    },

    // Enrichir la session avec les données du token
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.subscriptionPlan = (token.subscriptionPlan as "basic" | "premium" | "family") || "basic";
      }
      return session;
    },

    // Gestion des redirections
    async redirect({ url, baseUrl }) {
      // URLs relatives
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }
      // URLs du même domaine
      if (url.startsWith(baseUrl)) {
        return url;
      }
      // URL NEXTAUTH_URL (pour dev avec IP réseau)
      const nextAuthUrl = process.env.NEXTAUTH_URL;
      if (nextAuthUrl && url.startsWith(nextAuthUrl)) {
        return url;
      }
      return baseUrl;
    },

    // Autoriser la connexion
    async signIn({ user, account }) {
      // Log pour debug
      console.log(`[Auth] User signing in: ${user.email} via ${account?.provider}`);
      return true;
    },
  },

  // Events pour logging
  events: {
    async signIn({ user, isNewUser }) {
      console.log(`[Auth] ${isNewUser ? "New user" : "User"} signed in: ${user.email}`);
    },
    async signOut({ token }) {
      console.log(`[Auth] User signed out: ${token?.email}`);
    },
  },

  // Configuration debug en développement
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
