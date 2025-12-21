'use client';

import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/user-store';
import { Users, User, ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export function ModeSelection() {
    const router = useRouter();
    const setActiveMode = useUserStore((state) => state.setActiveMode);
    const soloOnboardingCompleted = useUserStore((state) => state.soloOnboardingCompleted);
    const familyOnboardingCompleted = useUserStore((state) => state.familyOnboardingCompleted);

    const handleSelectMode = (mode: 'solo' | 'family') => {
        setActiveMode(mode);

        if (mode === 'solo' && !soloOnboardingCompleted) {
            router.push('/onboarding/solo');
        } else if (mode === 'family' && !familyOnboardingCompleted) {
            router.push('/onboarding/family');
        } else {
            router.push('/');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
            <div className="max-w-4xl w-full">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <Sparkles className="text-primary-600" size={32} />
                        <h1 className="text-4xl font-bold text-gray-900">LYM</h1>
                    </div>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Choisissez le mode qui correspond a vos besoins
                    </p>
                </motion.div>

                {/* Mode Cards */}
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Mode Solo */}
                    <motion.button
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        onClick={() => handleSelectMode('solo')}
                        className="group relative bg-white rounded-3xl p-8 shadow-lg border-2 border-gray-100 hover:border-primary-500 hover:shadow-xl transition-all text-left"
                    >
                        {/* Badge si deja cree */}
                        {soloOnboardingCompleted && (
                            <div className="absolute top-4 right-4 bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">
                                Configure
                            </div>
                        )}

                        {/* Icon */}
                        <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <User size={32} className="text-white" />
                        </div>

                        {/* Content */}
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">Mode Solo</h2>
                        <p className="text-gray-600 mb-6">
                            Suivi personnel avec objectifs individualises, plans de repas personnalises, et coaching IA adapte a vos besoins.
                        </p>

                        {/* Features */}
                        <ul className="space-y-2 mb-6">
                            <li className="flex items-center gap-2 text-sm text-gray-700">
                                <div className="w-5 h-5 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="text-primary-600 text-xs">✓</span>
                                </div>
                                Objectifs caloriques personnalises
                            </li>
                            <li className="flex items-center gap-2 text-sm text-gray-700">
                                <div className="w-5 h-5 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="text-primary-600 text-xs">✓</span>
                                </div>
                                Suivi de poids et evolution
                            </li>
                            <li className="flex items-center gap-2 text-sm text-gray-700">
                                <div className="w-5 h-5 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="text-primary-600 text-xs">✓</span>
                                </div>
                                Plans de repas adaptatifs
                            </li>
                        </ul>

                        {/* CTA */}
                        <div className="flex items-center justify-between">
                            <span className="text-primary-600 font-semibold group-hover:translate-x-1 transition-transform inline-flex items-center gap-2">
                                {soloOnboardingCompleted ? 'Acceder' : 'Commencer'}
                                <ArrowRight size={20} />
                            </span>
                        </div>
                    </motion.button>

                    {/* Mode Famille */}
                    <motion.button
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        onClick={() => handleSelectMode('family')}
                        className="group relative bg-white rounded-3xl p-8 shadow-lg border-2 border-gray-100 hover:border-purple-500 hover:shadow-xl transition-all text-left"
                    >
                        {/* Badge si deja cree */}
                        {familyOnboardingCompleted && (
                            <div className="absolute top-4 right-4 bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">
                                Configure
                            </div>
                        )}

                        {/* Icon */}
                        <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Users size={32} className="text-white" />
                        </div>

                        {/* Content */}
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">Mode Famille</h2>
                        <p className="text-gray-600 mb-6">
                            Repas communs pour toute la famille, portions automatiques, liste de courses optimisee selon l'OMS.
                        </p>

                        {/* Features */}
                        <ul className="space-y-2 mb-6">
                            <li className="flex items-center gap-2 text-sm text-gray-700">
                                <div className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="text-purple-600 text-xs">✓</span>
                                </div>
                                Repas communs pour tous
                            </li>
                            <li className="flex items-center gap-2 text-sm text-gray-700">
                                <div className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="text-purple-600 text-xs">✓</span>
                                </div>
                                Portions enfants/adultes automatiques
                            </li>
                            <li className="flex items-center gap-2 text-sm text-gray-700">
                                <div className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="text-purple-600 text-xs">✓</span>
                                </div>
                                Liste de courses optimisee
                            </li>
                        </ul>

                        {/* CTA */}
                        <div className="flex items-center justify-between">
                            <span className="text-purple-600 font-semibold group-hover:translate-x-1 transition-transform inline-flex items-center gap-2">
                                {familyOnboardingCompleted ? 'Acceder' : 'Commencer'}
                                <ArrowRight size={20} />
                            </span>
                        </div>
                    </motion.button>
                </div>

                {/* Info supplementaire */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mt-8 text-center"
                >
                    <p className="text-sm text-gray-500">
                        Vous pourrez creer les deux types de comptes et basculer entre eux a tout moment
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
