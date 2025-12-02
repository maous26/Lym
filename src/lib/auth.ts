import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// ==========================================
// AUTH UTILITIES - Fonctions utilitaires pour l'authentification
// ==========================================

/**
 * Récupère la session côté serveur (Server Components, API Routes, Server Actions)
 * @returns La session utilisateur ou null
 */
export async function getSession() {
  return await getServerSession(authOptions);
}

/**
 * Récupère l'utilisateur courant côté serveur
 * @returns L'utilisateur ou null
 */
export async function getCurrentUser() {
  const session = await getSession();
  return session?.user ?? null;
}

/**
 * Vérifie si l'utilisateur est authentifié côté serveur
 * @returns true si authentifié, false sinon
 */
export async function isAuthenticated() {
  const session = await getSession();
  return !!session?.user;
}

/**
 * Récupère l'ID de l'utilisateur courant
 * @returns L'ID utilisateur ou null
 */
export async function getCurrentUserId() {
  const user = await getCurrentUser();
  return user?.id ?? null;
}

/**
 * Récupère le plan d'abonnement de l'utilisateur
 * @returns Le plan ou "basic" par défaut
 */
export async function getUserSubscriptionPlan() {
  const user = await getCurrentUser();
  return user?.subscriptionPlan ?? "basic";
}
