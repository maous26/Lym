import type { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
    interface User extends DefaultUser {
        id: string;
        subscriptionPlan?: "basic" | "premium" | "family";
    }

    interface Session {
        user?: User & DefaultSession["user"];
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id?: string;
        subscriptionPlan?: "basic" | "premium" | "family";
    }
}
