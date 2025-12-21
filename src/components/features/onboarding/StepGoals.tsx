"use client";

import { useSoloOnboardingStore } from '@/store/solo-onboarding-store';
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
    const { data, updateData, nextStep, prevStep } = useSoloOnboardingStore();

    return (
        <OnboardingLayout
            title="Quel est votre objectif ?"
            subtitle="Nous adapterons votre plan nutritionnel en conséquence."
            currentStep={3}
            totalSteps={8}
            showBack={true}
            onBack={prevStep}
        >
            <div className="flex flex-col h-full">
                <div className="flex-1 space-y-3">
                    {goals.map((goal) => {
                        const Icon = goal.icon;
                        const isSelected = data.goal === goal.id;

                        return (
                            <button
                                key={goal.id}
                                onClick={() => updateData({ goal: goal.id })}
                                className={cn(
                                    "w-full p-4 rounded-2xl border-2 text-left transition-all flex items-center gap-4 group",
                                    isSelected
                                        ? "border-primary-500 bg-primary-50 shadow-md"
                                        : "border-white bg-white/80 hover:border-primary-200 hover:bg-white"
                                )}
                            >
                                <div className={cn(
                                    "h-12 w-12 rounded-xl flex items-center justify-center transition-colors shrink-0",
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
                        disabled={!data.goal}
                        className="w-full bg-gray-900 disabled:bg-gray-300 text-white py-4 rounded-xl font-bold shadow-lg disabled:cursor-not-allowed transition-all hover:bg-black"
                    >
                        Continuer
                    </button>
                </div>
            </div>
        </OnboardingLayout>
    );
};
