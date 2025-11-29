"use client";

import { useOnboardingStore } from '@/store/onboarding-store';
import { OnboardingLayout } from './OnboardingLayout';
import { ActivityLevel } from '@/types/user';
import { cn } from '@/lib/utils';
import { Armchair, Footprints, Bike, Dumbbell, Trophy } from 'lucide-react';

const activities: { id: ActivityLevel; label: string; icon: any; desc: string }[] = [
    { id: 'sedentary', label: 'Sédentaire', icon: Armchair, desc: 'Peu ou pas d\'exercice, travail de bureau' },
    { id: 'light', label: 'Légèrement actif', icon: Footprints, desc: 'Exercice léger 1-3 jours/semaine' },
    { id: 'moderate', label: 'Modérément actif', icon: Bike, desc: 'Sport modéré 3-5 jours/semaine' },
    { id: 'active', label: 'Très actif', icon: Dumbbell, desc: 'Sport intense 6-7 jours/semaine' },
    { id: 'athlete', label: 'Athlète', icon: Trophy, desc: 'Entraînement physique très intense quotidien' },
];

export const StepActivity = () => {
    const { profile, updateProfile, nextStep } = useOnboardingStore();

    return (
        <OnboardingLayout
            title="Votre niveau d'activité"
            subtitle="Pour calculer votre dépense énergétique journalière."
        >
            <div className="space-y-4">
                {activities.map((level) => {
                    const Icon = level.icon;
                    const isSelected = profile.activityLevel === level.id;

                    return (
                        <button
                            key={level.id}
                            onClick={() => updateProfile({ activityLevel: level.id })}
                            className={cn(
                                "w-full p-4 rounded-2xl border-2 text-left transition-all flex items-center gap-4 group",
                                isSelected
                                    ? "border-secondary-500 bg-secondary-50 shadow-md"
                                    : "border-white bg-white/80 hover:border-secondary-200 hover:bg-white"
                            )}
                        >
                            <div className={cn(
                                "h-12 w-12 rounded-xl flex items-center justify-center transition-colors",
                                isSelected ? "bg-secondary-500 text-white" : "bg-gray-100 text-gray-500 group-hover:bg-secondary-100 group-hover:text-secondary-600"
                            )}>
                                <Icon size={24} />
                            </div>
                            <div>
                                <h3 className={cn("font-bold", isSelected ? "text-secondary-900" : "text-gray-900")}>
                                    {level.label}
                                </h3>
                                <p className="text-sm text-gray-500">{level.desc}</p>
                            </div>
                        </button>
                    );
                })}
            </div>

            <div className="mt-auto pt-8">
                <button
                    onClick={nextStep}
                    disabled={!profile.activityLevel}
                    className="w-full bg-secondary-600 disabled:bg-gray-300 text-white py-4 rounded-xl font-bold shadow-lg shadow-secondary-200 disabled:shadow-none transition-all hover:bg-secondary-700"
                >
                    Continuer
                </button>
            </div>
        </OnboardingLayout>
    );
};
