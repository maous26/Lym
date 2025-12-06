'use client';

import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { Chrome, Loader2, Utensils, Heart, TrendingUp, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const { status } = useSession();

    // Rediriger si déjà connecté
    useEffect(() => {
        if (status === 'authenticated') {
            router.push('/auth/plan-selection');
        }
    }, [status, router]);

    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        setError(null);
        
        try {
            const result = await signIn('google', {
                redirect: false,
                callbackUrl: '/auth/plan-selection',
            });

            if (result?.error) {
                setError('Erreur lors de la connexion. Veuillez réessayer.');
                console.error('Google sign in error:', result.error);
            } else if (result?.url) {
                router.push(result.url);
            }
        } catch (error) {
            console.error('Google sign in error:', error);
            setError('Une erreur inattendue s\'est produite.');
        } finally {
            setIsLoading(false);
        }
    };

    // Afficher un loader si on vérifie la session
    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-12 px-4">
            <div className="w-full max-w-5xl">
                {step === 'carousel' ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-8"
                    >
                        <div className="text-center">
                            <h1 className="text-4xl font-bold text-gray-900 mb-2">LYM</h1>
                            <p className="text-xl text-gray-600">Votre Coach Nutritionnel Personnel</p>
                        </div>

                        <MarketingCarousel />

                        <div className="flex justify-center">
                            <button
                                onClick={() => setStep('auth')}
                                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold rounded-xl hover:shadow-lg transition-all hover:scale-105"
                            >
                                Commencer →
                            </button>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-md mx-auto"
                    >
                        <div className="bg-white rounded-3xl shadow-2xl p-8 space-y-6">
                            <div className="text-center">
                                <h2 className="text-3xl font-bold text-gray-900 mb-2">Se Connecter</h2>
                                <p className="text-gray-600">Connectez-vous pour accéder à LYM</p>
                            </div>

                            {/* Afficher les erreurs */}
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                                    {error}
                                </div>
                            )}

                            {/* Bouton Google */}
                            <button
                                onClick={handleGoogleSignIn}
                                disabled={isLoading}
                                className="w-full py-4 px-4 rounded-xl bg-white border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all flex items-center justify-center gap-3 font-semibold text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Connexion en cours...
                                    </>
                                ) : (
                                    <>
                                        <Chrome size={24} />
                                        Continuer avec Google
                                    </>
                                )}
                            </button>

                            {/* Informations */}
                            <p className="text-center text-sm text-gray-500">
                                En vous connectant, vous acceptez nos{' '}
                                <a href="#" className="text-blue-600 hover:underline">
                                    conditions d'utilisation
                                </a>{' '}
                                et notre{' '}
                                <a href="#" className="text-blue-600 hover:underline">
                                    politique de confidentialité
                                </a>
                            </p>

                            <button
                                onClick={() => setStep('carousel')}
                                className="w-full py-2 text-gray-600 hover:text-gray-900 font-semibold transition-colors"
                            >
                                ← Retour
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
