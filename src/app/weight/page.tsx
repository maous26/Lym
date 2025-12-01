'use client';

import { BottomNav } from '@/components/ui/BottomNav';
import { WeightTracker } from '@/components/features/weight/WeightTracker';
import { ConnectedDevices } from '@/components/features/weight/ConnectedDevices';
import { motion } from 'framer-motion';
import { Scale, Target, TrendingDown, Calendar } from 'lucide-react';
import { useOnboardingStore } from '@/store/onboarding-store';

export default function WeightPage() {
    const { profile } = useOnboardingStore();

    // Calculer l'objectif de poids
    const targetWeight = profile.primaryGoal === 'weight_loss' && profile.weight && profile.weightLossGoalKg
        ? profile.weight - profile.weightLossGoalKg
        : profile.targetWeight;

    const weightToLose = profile.weight && targetWeight
        ? profile.weight - targetWeight
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
                        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                            <Scale className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Suivi du Poids</h1>
                            <p className="text-sm text-gray-500">Suivez votre progression</p>
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
                        {profile.suggestedDurationWeeks && (
                            <div className="mt-3 pt-3 border-t border-white/20 flex items-center gap-2 text-sm text-emerald-100">
                                <Calendar size={14} />
                                <span>Durée estimée : {profile.suggestedDurationWeeks} semaines</span>
                            </div>
                        )}
                    </motion.div>
                )}

                {/* Suivi du poids principal */}
                <div className="mb-6">
                    <WeightTracker />
                </div>

                {/* Appareils connectés */}
                <div className="mb-6">
                    <ConnectedDevices />
                </div>

                {/* Conseils */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-amber-50 rounded-2xl p-5 border border-amber-200"
                >
                    <h3 className="font-bold text-amber-900 mb-2">💡 Conseils pour un suivi efficace</h3>
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



