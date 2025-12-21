'use client';

import { BottomNav } from '@/components/ui/BottomNav';
import { motion } from 'framer-motion';
import { Scale, Target, TrendingDown, ArrowLeft } from 'lucide-react';
import { useSoloProfile } from '@/store/user-store';
import { useRouter } from 'next/navigation';

export default function WeightPage() {
    const router = useRouter();
    const profile = useSoloProfile();

    // Calculer l'objectif de poids
    const targetWeight = profile?.targetWeight;
    const currentWeight = profile?.weight;

    const weightToLose = currentWeight && targetWeight
        ? currentWeight - targetWeight
        : null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 pb-32">
            <div className="container mx-auto px-4 max-w-md pt-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => router.back()}
                            className="h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-gray-600"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </motion.button>
                        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                            <Scale className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Suivi du Poids</h1>
                            <p className="text-sm text-gray-500">Historique et objectifs</p>
                        </div>
                    </div>
                </motion.div>

                {/* Objectif de poids */}
                {targetWeight && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                        className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-5 mb-6 text-white"
                    >
                        <div className="flex items-center gap-2 mb-3">
                            <Target className="h-5 w-5" />
                            <span className="font-medium">Objectif</span>
                        </div>
                        <div className="flex items-end justify-between">
                            <div>
                                <p className="text-emerald-100 text-sm">Poids cible</p>
                                <p className="text-3xl font-bold">{targetWeight} kg</p>
                            </div>
                            {weightToLose && weightToLose > 0 && (
                                <div className="text-right">
                                    <p className="text-emerald-100 text-sm">Reste à perdre</p>
                                    <p className="text-xl font-bold flex items-center gap-1">
                                        <TrendingDown size={18} />
                                        {weightToLose.toFixed(1)} kg
                                    </p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}

                {/* Info card - redirect to home */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6"
                >
                    <div className="text-center py-4">
                        <Scale className="h-12 w-12 text-blue-500 mx-auto mb-3" />
                        <h3 className="font-bold text-gray-900 mb-2">Suivi du poids déplacé</h3>
                        <p className="text-sm text-gray-500 mb-4">
                            Le suivi du poids et les appareils connectés sont maintenant accessibles depuis la page d'accueil pour un accès plus rapide.
                        </p>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => router.push('/')}
                            className="px-6 py-2.5 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors"
                        >
                            Aller à l'accueil
                        </motion.button>
                    </div>
                </motion.div>

                {/* Conseils */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-amber-50 rounded-2xl p-5 border border-amber-200"
                >
                    <h3 className="font-bold text-amber-900 mb-2">Conseils pour un suivi efficace</h3>
                    <ul className="text-sm text-amber-800 space-y-2">
                        <li>• Pesez-vous toujours au même moment (idéalement le matin à jeun)</li>
                        <li>• Ne vous focalisez pas sur les variations quotidiennes</li>
                        <li>• Regardez la tendance sur 1-2 semaines</li>
                        <li>• Connectez votre balance pour un suivi automatique</li>
                    </ul>
                </motion.div>
            </div>

            <BottomNav />
        </div>
    );
}
