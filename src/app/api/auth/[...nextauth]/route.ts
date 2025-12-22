import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma";

// ==========================================
// CONFIGURATION NEXTAUTH
// ==========================================

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  // Session - Utiliser "jwt" ou "database". Avec l'adapteur, "database" est le défaut,
  // mais on peut forcer JWT si on veut moins d'I/O DB à chaque requête
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 jours
  },

  // Providers
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    // Provider de dev pour tester sans OAuth
    CredentialsProvider({
      name: "Development",
      credentials: {
        email: { label: "Email", type: "email" },
      },
      async authorize(credentials) {
        // En dev uniquement, permettre la connexion avec juste un email
        if (process.env.NODE_ENV === "development" && credentials?.email) {
          // On peut créer l'user en DB s'il n'existe pas pour simuler le flow complet
          const user = await prisma.user.upsert({
            where: { email: credentials.email },
            update: {},
            create: {
              email: credentials.email,
              name: "Utilisateur Dev",
              image: null,
              subscriptionPlan: "premium"
            }
          });

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            subscriptionPlan: user.subscriptionPlan as "free" | "premium" | "family",
          };
        }
        return null;
      },
    }),
  ],

  // Pages personnalisées
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },

  // Callbacks
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // user object is only available on first signin
        token.id = user.id;
        token.subscriptionPlan = (user as any).subscriptionPlan || "free";
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.subscriptionPlan = (token.subscriptionPlan as "free" | "premium" | "family") || "free";
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      // Si URL relative, utiliser baseUrl
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Si même domaine, autoriser
      try {
        if (new URL(url).origin === baseUrl) return url;
      } catch {
        // URL invalide, retourner baseUrl
        return baseUrl;
      }
      // Sinon rediriger vers home
      return baseUrl;
    },
  },

  // Debug en dev
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
