'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { MarketingCarousel } from '@/components/features/auth/MarketingCarousel';
import { Mail, Chrome } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [step, setStep] = useState<'carousel' | 'auth'>('carousel');
    const router = useRouter();

    const handleEmailSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const result = await signIn('email', {
                email,
                redirect: false,
            });

            if (result?.ok) {
                // Email sent successfully
                setEmail('');
                // Show success message or redirect
                router.push('/auth/verify-email?email=' + encodeURIComponent(email));
            } else {
                console.error('Sign in error:', result?.error);
            }
        } catch (error) {
            console.error('Error signing in:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        try {
            await signIn('google', {
                redirect: true,
                callbackUrl: '/auth/plan-selection',
            });
        } catch (error) {
            console.error('Google sign in error:', error);
            setIsLoading(false);
        }
    };

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
                                <p className="text-gray-600">Choisissez votre méthode de connexion</p>
                            </div>

                            {/* Google Sign In */}
                            <button
                                onClick={handleGoogleSignIn}
                                disabled={isLoading}
                                className="w-full py-3 px-4 rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all flex items-center justify-center gap-2 font-semibold text-gray-900 disabled:opacity-50"
                            >
                                <Chrome size={20} />
                                Continuer avec Google
                            </button>

                            {/* Divider */}
                            <div className="flex items-center gap-4">
                                <div className="flex-1 h-px bg-gray-200" />
                                <span className="text-sm text-gray-500">Ou</span>
                                <div className="flex-1 h-px bg-gray-200" />
                            </div>

                            {/* Email Sign In */}
                            <form onSubmit={handleEmailSignIn} className="space-y-4">
                                <div>
                                    <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
                                        Adresse Email
                                    </label>
                                    <input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="vous@email.com"
                                        required
                                        disabled={isLoading}
                                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none disabled:opacity-50 transition-colors"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading || !email}
                                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    <Mail size={20} />
                                    {isLoading ? 'Envoi...' : 'Continuer avec Email'}
                                </button>
                            </form>

                            {/* Back Button */}
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
