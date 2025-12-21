'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { motion } from 'framer-motion';
import { MarketingCarouselCompact } from '@/components/features/auth/MarketingCarousel';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn('google', { callbackUrl: '/auth/plan-selection' });
    } catch (error) {
      console.error('Sign in error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Marketing Carousel (hidden on mobile) */}
      <div className="hidden lg:block lg:w-1/2 xl:w-3/5">
        <MarketingCarouselCompact className="h-screen" />
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex flex-col min-h-screen bg-white">
        {/* Mobile Header with gradient */}
        <div className="lg:hidden relative h-48 bg-gradient-to-br from-emerald-50 via-white to-amber-50 overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-gradient-to-br from-primary-200/40 to-transparent" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-gradient-to-tr from-secondary-200/30 to-transparent" />

          {/* Logo */}
          <div className="absolute top-8 left-6">
            <h1 className="text-3xl font-bold text-stone-800">
              LYM<span className="text-primary-500">.</span>
            </h1>
            <p className="text-sm text-stone-500 mt-1">Ta nutrition, simplifiée.</p>
          </div>

          {/* Floating Icon */}
          <motion.div
            className="absolute bottom-4 right-6 w-16 h-16 rounded-2xl bg-white shadow-lg flex items-center justify-center"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <span className="text-3xl">🌱</span>
          </motion.div>
        </div>

        {/* Login Content */}
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-sm"
          >
            {/* Desktop Logo */}
            <div className="hidden lg:block text-center mb-10">
              <h1 className="text-4xl font-bold text-stone-800">
                LYM<span className="text-primary-500">.</span>
              </h1>
              <p className="text-stone-500 mt-2">Bienvenue !</p>
            </div>

            {/* Welcome Text */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-stone-800">
                Connecte-toi
              </h2>
              <p className="text-stone-500 mt-2">
                Pour accéder à ton espace personnalisé
              </p>
            </div>

            {/* Auth Buttons */}
            <div className="space-y-4">
              {/* Google Sign In */}
              <Button
                onClick={handleGoogleSignIn}
                isLoading={isLoading}
                variant="glass"
                size="lg"
                fullWidth
                leftIcon={
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                }
              >
                Continuer avec Google
              </Button>

              {/* Apple Sign In (placeholder) */}
              <Button
                variant="outline"
                size="lg"
                fullWidth
                disabled
                leftIcon={
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                  </svg>
                }
              >
                Continuer avec Apple
              </Button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4 my-8">
              <div className="flex-1 h-px bg-stone-200" />
              <span className="text-sm text-stone-400">ou</span>
              <div className="flex-1 h-px bg-stone-200" />
            </div>

            {/* Email Sign In (placeholder for future) */}
            <Button
              variant="ghost"
              size="lg"
              fullWidth
              disabled
            >
              Continuer avec un email
            </Button>

            {/* Terms */}
            <p className="text-center text-xs text-stone-400 mt-8">
              En continuant, tu acceptes nos{' '}
              <a href="#" className="text-primary-600 hover:underline">
                Conditions d'utilisation
              </a>{' '}
              et notre{' '}
              <a href="#" className="text-primary-600 hover:underline">
                Politique de confidentialité
              </a>
            </p>
          </motion.div>
        </div>

        {/* Footer */}
        <div className="py-6 text-center">
          <p className="text-xs text-stone-400">
            © {new Date().getFullYear()} LYM. Tous droits réservés.
          </p>
        </div>
      </div>
    </div>
  );
}
