import type { DefaultSession, DefaultUser } from "next-auth";
import type { JWT as DefaultJWT } from "next-auth/jwt";

// ==========================================
// TYPES NEXTAUTH - Extension des types par défaut
// ==========================================

declare module "next-auth" {
    /**
     * Utilisateur étendu avec le plan d'abonnement
     */
    interface User extends DefaultUser {
        id: string;
        subscriptionPlan?: "basic" | "premium" | "family";
    }

    /**
     * Session étendue avec l'utilisateur typé
     */
    interface Session {
        user: {
            id: string;
            subscriptionPlan: "basic" | "premium" | "family";
        } & DefaultSession["user"];
    }
}

declare module "next-auth/jwt" {
    /**
     * JWT étendu avec les informations utilisateur
     */
    interface JWT extends DefaultJWT {
        id?: string;
        subscriptionPlan?: "basic" | "premium" | "family";
    }
}
