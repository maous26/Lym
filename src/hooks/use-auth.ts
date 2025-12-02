'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

// ==========================================
// HOOK AUTHENTIFICATION - Utilitaires client
// ==========================================

/**
 * Hook personnalisé pour gérer l'authentification côté client
 * Fournit des fonctions et états pratiques pour la gestion de session
 */
export function useAuth() {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  // États dérivés
  const isAuthenticated = status === 'authenticated';
  const isLoading = status === 'loading';
  const user = session?.user ?? null;

  /**
   * Connexion avec Google
   */
  const loginWithGoogle = useCallback(async (callbackUrl?: string) => {
    try {
      await signIn('google', {
        callbackUrl: callbackUrl ?? '/auth/plan-selection',
      });
    } catch (error) {
      console.error('[Auth] Google login error:', error);
      throw error;
    }
  }, []);

  /**
   * Déconnexion
   */
  const logout = useCallback(async (redirectTo?: string) => {
    try {
      await signOut({
        callbackUrl: redirectTo ?? '/auth/login',
      });
    } catch (error) {
      console.error('[Auth] Logout error:', error);
      throw error;
    }
  }, []);

  /**
   * Mise à jour de la session (ex: changement de plan)
   */
  const updateSession = useCallback(async (data: { subscriptionPlan?: string }) => {
    try {
      await update(data);
    } catch (error) {
      console.error('[Auth] Session update error:', error);
      throw error;
    }
  }, [update]);

  /**
   * Redirection vers login si non authentifié
   */
  const requireAuth = useCallback((callbackUrl?: string) => {
    if (!isLoading && !isAuthenticated) {
      const url = new URL('/auth/login', window.location.origin);
      if (callbackUrl) {
        url.searchParams.set('callbackUrl', callbackUrl);
      }
      router.push(url.toString());
    }
  }, [isAuthenticated, isLoading, router]);

  return {
    // État de session
    session,
    user,
    status,
    isAuthenticated,
    isLoading,

    // Actions
    loginWithGoogle,
    logout,
    updateSession,
    requireAuth,

    // Raccourcis utilisateur
    userId: user?.id ?? null,
    userName: user?.name ?? null,
    userEmail: user?.email ?? null,
    userImage: user?.image ?? null,
    subscriptionPlan: user?.subscriptionPlan ?? 'basic',
  };
}
