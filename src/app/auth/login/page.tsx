'use client';

import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { Chrome, Loader2, Utensils, Heart, TrendingUp, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isCallbackProcessing, setIsCallbackProcessing] = useState(false);
    const router = useRouter();
    const { status, update } = useSession();

    // Écouter les URL callbacks depuis Safari (OAuth)
    useEffect(() => {
        if (!Capacitor.isNativePlatform()) return;

        const handleAppUrlOpen = async (event: any) => {
            console.log('[OAuth Callback] App URL opened:', event.url);
            
            try {
                setIsCallbackProcessing(true);
                
                // Fermer le navigateur
                await Browser.close();
                console.log('[OAuth Callback] Browser closed');
                
                // Attendre que la session soit bien sauvegardée côté serveur
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                // Forcer la mise à jour de la session plusieurs fois
                console.log('[OAuth Callback] Updating session...');
                for (let i = 0; i < 3; i++) {
                    await update();
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
                console.log('[OAuth Callback] Session update complete');
                
                // Laisser le useEffect ci-dessous gérer la redirection
                setIsLoading(false);
                setIsCallbackProcessing(false);
            } catch (error) {
                console.error('[OAuth Callback] Error:', error);
                setIsLoading(false);
                setIsCallbackProcessing(false);
            }
        };

        let listenerHandle: any;
        App.addListener('appUrlOpen', handleAppUrlOpen).then(handle => {
            listenerHandle = handle;
        });

        return () => {
            if (listenerHandle) {
                listenerHandle.remove();
            }
        };
    }, [router, update]);

    // Rediriger si déjà connecté (mais pas pendant le traitement du callback)
    useEffect(() => {
        console.log('[Login Page] Session status:', status, 'Callback processing:', isCallbackProcessing);
        if (status === 'authenticated' && !isCallbackProcessing) {
            console.log('[Login Page] Authenticated, redirecting to plan-selection');
            router.push('/auth/plan-selection');
        }
    }, [status, router, isCallbackProcessing]);

    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        setError(null);
        
        try {
            // Si on est sur mobile, ouvrir dans le navigateur système
            if (Capacitor.isNativePlatform()) {
                const baseUrl = window.location.origin;
                const authUrl = `${baseUrl}/api/auth/signin/google?callbackUrl=${encodeURIComponent('/auth/plan-selection')}`;
                
                console.log('Opening browser with URL:', authUrl);
                await Browser.open({ url: authUrl });
                
                // Ne pas désactiver le loading ici, on attend le callback
                return;
            }

            // Sur web, utiliser la méthode classique
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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center py-12 px-4">
            <div className="w-full max-w-6xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid md:grid-cols-2 gap-12 items-center"
                >
                    {/* Section gauche - Marketing */}
                    <div className="space-y-8">
                        <div>
                            <h1 className="text-5xl font-bold text-gray-900 mb-4">
                                LYM
                            </h1>
                            <p className="text-2xl text-gray-700 mb-6">
                                Votre Coach Nutritionnel Personnel Intelligent
                            </p>
                            <p className="text-lg text-gray-600">
                                Transformez votre alimentation avec l'IA, atteignez vos objectifs santé
                            </p>
                        </div>

                        {/* Features */}
                        <div className="space-y-4">
                            <div className="flex items-start gap-4">
                                <div className="bg-blue-100 p-3 rounded-xl">
                                    <Utensils className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">Plans Personnalisés</h3>
                                    <p className="text-gray-600 text-sm">Repas adaptés à vos besoins et préférences</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="bg-green-100 p-3 rounded-xl">
                                    <TrendingUp className="w-6 h-6 text-green-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">Suivi en Temps Réel</h3>
                                    <p className="text-gray-600 text-sm">Analysez vos progrès et ajustez votre parcours</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="bg-purple-100 p-3 rounded-xl">
                                    <Users className="w-6 h-6 text-purple-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">Mode Famille</h3>
                                    <p className="text-gray-600 text-sm">Gérez la nutrition de toute la famille</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="bg-pink-100 p-3 rounded-xl">
                                    <Heart className="w-6 h-6 text-pink-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">Coach IA</h3>
                                    <p className="text-gray-600 text-sm">Assistant intelligent disponible 24/7</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section droite - Authentification */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="bg-white rounded-3xl shadow-2xl p-8 space-y-6">
                            <div className="text-center">
                                <h2 className="text-3xl font-bold text-gray-900 mb-2">Commencer</h2>
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
                                className="w-full py-4 px-4 rounded-xl bg-white border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all flex items-center justify-center gap-3 font-semibold text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
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
                            <p className="text-center text-xs text-gray-500">
                                En vous connectant, vous acceptez nos{' '}
                                <a href="#" className="text-blue-600 hover:underline">
                                    conditions d'utilisation
                                </a>{' '}
                                et notre{' '}
                                <a href="#" className="text-blue-600 hover:underline">
                                    politique de confidentialité
                                </a>
                            </p>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}
