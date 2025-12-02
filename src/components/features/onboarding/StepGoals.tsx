"use client";

import { useState, useEffect } from 'react';
import { useSoloOnboardingStore } from '@/store/solo-onboarding-store';
import { OnboardingLayout } from './OnboardingLayout';
import { Goal } from '@/types/user';
import { cn } from '@/lib/utils';
import { Target, TrendingDown, TrendingUp, Battery, Heart, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const goals: { id: Goal; label: string; icon: any; desc: string }[] = [
    { id: 'weight_loss', label: 'Perdre du poids', icon: TrendingDown, desc: 'Brûler les graisses sainement' },
    { id: 'muscle_gain', label: 'Prendre du muscle', icon: TrendingUp, desc: 'Gagner en force et volume' },
    { id: 'maintenance', label: 'Maintenir mon poids', icon: Target, desc: 'Stabiliser ma forme actuelle' },
    { id: 'health', label: 'Manger plus sainement', icon: Heart, desc: 'Améliorer ma santé globale' },
    { id: 'energy', label: 'Regain d\'énergie', icon: Battery, desc: 'Booster ma vitalité au quotidien' },
];

export const StepGoals = () => {
    const { profile, updateProfile, nextStep } = useSoloOnboardingStore();
    const [weightLossKg, setWeightLossKg] = useState<number>(profile.weightLossGoalKg || 5);
    const [suggestedDuration, setSuggestedDuration] = useState<number>(0);

    // Calculate suggested duration based on weight loss goal
    useEffect(() => {
        if (profile.primaryGoal === 'weight_loss' && weightLossKg > 0) {
            // Safe weight loss: 0.5-1 kg per week
            // We suggest 0.75 kg/week as a balanced approach
            const weeks = Math.ceil(weightLossKg / 0.75);
            setSuggestedDuration(weeks);
            updateProfile({
                weightLossGoalKg: weightLossKg,
                suggestedDurationWeeks: weeks
            });
        }
    }, [weightLossKg, profile.primaryGoal]);

    const handleContinue = () => {
        if (profile.primaryGoal === 'weight_loss') {
            updateProfile({
                weightLossGoalKg: weightLossKg,
                suggestedDurationWeeks: suggestedDuration
            });
        }
        nextStep();
    };

    return (
        <OnboardingLayout
            title="Quel est votre objectif ?"
            subtitle="Nous adapterons votre plan nutritionnel en conséquence."
        >
            <div className="flex flex-col h-full">
                <div className="flex-1 space-y-3">
                    {goals.map((goal) => {
                        const Icon = goal.icon;
                        const isSelected = profile.primaryGoal === goal.id;

                        return (
                            <button
                                key={goal.id}
                                onClick={() => updateProfile({ primaryGoal: goal.id })}
                                className={cn(
                                    "w-full p-3 rounded-2xl border-2 text-left transition-all flex items-center gap-3 group",
                                    isSelected
                                        ? "border-primary-500 bg-primary-50 shadow-md"
                                        : "border-white bg-white/80 hover:border-primary-200 hover:bg-white"
                                )}
                            >
                                <div className={cn(
                                    "h-10 w-10 rounded-xl flex items-center justify-center transition-colors shrink-0",
                                    isSelected ? "bg-primary-500 text-white" : "bg-gray-100 text-gray-500 group-hover:bg-primary-100 group-hover:text-primary-600"
                                )}>
                                    <Icon size={20} />
                                </div>
                                <div>
                                    <h3 className={cn("font-bold text-sm", isSelected ? "text-primary-900" : "text-gray-900")}>
                                        {goal.label}
                                    </h3>
                                    <p className="text-xs text-gray-500">{goal.desc}</p>
                                </div>
                            </button>
                        );
                    })}

                    {/* Weight Loss Details */}
                    <AnimatePresence>
                        {profile.primaryGoal === 'weight_loss' && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-2xl p-4 space-y-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Combien de kilos souhaitez-vous perdre ?
                                        </label>
                                        <div className="flex items-center gap-4">
                                            <input
                                                type="range"
                                                min="1"
                                                max="50"
                                                value={weightLossKg}
                                                onChange={(e) => setWeightLossKg(parseInt(e.target.value))}
                                                className="flex-1 accent-primary-600"
                                            />
                                            <div className="bg-white rounded-xl px-3 py-1.5 min-w-[70px] text-center">
                                                <span className="text-xl font-bold text-primary-600">{weightLossKg}</span>
                                                <span className="text-sm text-gray-500 ml-1">kg</span>
                                            </div>
                                        </div>
                                    </div>

                                    {suggestedDuration > 0 && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="bg-white rounded-xl p-3 flex items-center gap-3"
                                        >
                                            <div className="bg-primary-100 p-2 rounded-xl">
                                                <Calendar className="text-primary-600" size={20} />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-600">Durée recommandée</p>
                                                <p className="text-sm font-bold text-gray-900">
                                                    {suggestedDuration} semaines
                                                    <span className="text-xs font-normal text-gray-500 ml-1">
                                                        (~{Math.ceil(suggestedDuration / 4)} mois)
                                                    </span>
                                                </p>
                                            </div>
                                        </motion.div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="pt-4 shrink-0">
                    <button
                        onClick={handleContinue}
                        disabled={!profile.primaryGoal}
                        className="w-full bg-primary-600 disabled:bg-gray-300 text-white py-4 rounded-xl font-bold shadow-lg shadow-primary-200 disabled:shadow-none transition-all hover:bg-primary-700"
                    >
                        Continuer
                    </button>
                </div>
            </div>
        </OnboardingLayout>
    );
};
