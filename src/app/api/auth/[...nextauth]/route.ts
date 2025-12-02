import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";

const handler = NextAuth({
  session: {
    strategy: "jwt",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST || "",
        port: process.env.EMAIL_SERVER_PORT ? parseInt(process.env.EMAIL_SERVER_PORT) : 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_SERVER_USER || "",
          pass: process.env.EMAIL_SERVER_PASSWORD || "",
        },
      },
      from: process.env.EMAIL_FROM || "noreply@lym.app",
    }),
  ],
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  callbacks: {
    async session({ session, token }: any) {
      if (session.user && token) {
        session.user.id = token.sub;
        (session.user as any).subscriptionPlan = (token as any).subscriptionPlan || "basic";
      }
      return session;
    },
    async jwt({ token, user }: any) {
      if (user) {
        token.sub = user.id;
        (token as any).subscriptionPlan = (user as any).subscriptionPlan || "basic";
      }
      return token;
    },
    async redirect({ url, baseUrl }: any) {
      // Allow redirects to the network IP address
      const networkUrl = process.env.NEXTAUTH_URL || baseUrl;
      if (url.startsWith(networkUrl)) return url;
      if (url.startsWith(baseUrl)) return url;
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      return baseUrl;
    },
  },
  events: {
    async signIn({ user }: any) {
      console.log("User signed in:", (user as any).email);
    },
  },
});

export { handler as GET, handler as POST };
