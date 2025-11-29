"use client";

import { useOnboardingStore } from '@/store/onboarding-store';
import { OnboardingLayout } from './OnboardingLayout';
import { Goal } from '@/types/user';
import { cn } from '@/lib/utils';
import { Target, TrendingDown, TrendingUp, Battery, Heart } from 'lucide-react';

const goals: { id: Goal; label: string; icon: any; desc: string }[] = [
    { id: 'weight_loss', label: 'Perdre du poids', icon: TrendingDown, desc: 'Brûler les graisses sainement' },
    { id: 'muscle_gain', label: 'Prendre du muscle', icon: TrendingUp, desc: 'Gagner en force et volume' },
    { id: 'maintenance', label: 'Maintenir mon poids', icon: Target, desc: 'Stabiliser ma forme actuelle' },
    { id: 'health', label: 'Manger plus sainement', icon: Heart, desc: 'Améliorer ma santé globale' },
    { id: 'energy', label: 'Regain d\'énergie', icon: Battery, desc: 'Booster ma vitalité au quotidien' },
];

export const StepGoals = () => {
    const { profile, updateProfile, nextStep } = useOnboardingStore();

    return (
        <OnboardingLayout
            title="Quel est votre objectif ?"
            subtitle="Nous adapterons votre plan nutritionnel en conséquence."
        >
            <div className="space-y-4">
                {goals.map((goal) => {
                    const Icon = goal.icon;
                    const isSelected = profile.primaryGoal === goal.id;

                    return (
                        <button
                            key={goal.id}
                            onClick={() => updateProfile({ primaryGoal: goal.id })}
                            className={cn(
                                "w-full p-4 rounded-2xl border-2 text-left transition-all flex items-center gap-4 group",
                                isSelected
                                    ? "border-primary-500 bg-primary-50 shadow-md"
                                    : "border-white bg-white/80 hover:border-primary-200 hover:bg-white"
                            )}
                        >
                            <div className={cn(
                                "h-12 w-12 rounded-xl flex items-center justify-center transition-colors",
                                isSelected ? "bg-primary-500 text-white" : "bg-gray-100 text-gray-500 group-hover:bg-primary-100 group-hover:text-primary-600"
                            )}>
                                <Icon size={24} />
                            </div>
                            <div>
                                <h3 className={cn("font-bold", isSelected ? "text-primary-900" : "text-gray-900")}>
                                    {goal.label}
                                </h3>
                                <p className="text-sm text-gray-500">{goal.desc}</p>
                            </div>
                        </button>
                    );
                })}
            </div>

            <div className="mt-auto pt-8">
                <button
                    onClick={nextStep}
                    disabled={!profile.primaryGoal}
                    className="w-full bg-primary-600 disabled:bg-gray-300 text-white py-4 rounded-xl font-bold shadow-lg shadow-primary-200 disabled:shadow-none transition-all hover:bg-primary-700"
                >
                    Continuer
                </button>
            </div>
        </OnboardingLayout>
    );
};
