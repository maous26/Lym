"use client";

import { useOnboardingStore } from '@/store/onboarding-store';
import { OnboardingLayout } from './OnboardingLayout';
import { DietType } from '@/types/user';
import { cn } from '@/lib/utils';
import { Baby, Utensils, Clock } from 'lucide-react';

const diets: { id: DietType; label: string }[] = [
    { id: 'omnivore', label: 'Omnivore (Tout)' },
    { id: 'vegetarian', label: 'Végétarien' },
    { id: 'vegan', label: 'Végétalien (Vegan)' },
    { id: 'pescatarian', label: 'Pescétarien' },
    { id: 'keto', label: 'Cétogène (Keto)' },
];

export const StepDiet = () => {
    const { profile, updateProfile, nextStep } = useOnboardingStore();

    return (
        <OnboardingLayout
            title="Préférences Alimentaires"
            subtitle="Personnalisez votre expérience nutritionnelle."
        >
            <div className="space-y-8">

                {/* Diet Preference */}
                <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Utensils size={18} />
                        Régime alimentaire
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {diets.map((diet) => (
                            <button
                                key={diet.id}
                                onClick={() => updateProfile({ dietaryPreferences: diet.id })}
                                className={cn(
                                    "px-4 py-2 rounded-full text-sm font-medium transition-all border",
                                    profile.dietaryPreferences === diet.id
                                        ? "bg-primary-600 text-white border-primary-600 shadow-md"
                                        : "bg-white text-gray-600 border-gray-200 hover:border-primary-300"
                                )}
                            >
                                {diet.label}
                            </button>
                        ))}
                    </div>
                </div>

            </div>

            <div className="mt-auto pt-8">
                <button
                    onClick={nextStep}
                    className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold shadow-lg transition-all hover:bg-black hover:scale-[1.02]"
                >
                    Continuer
                </button>
            </div>
        </OnboardingLayout>
    );
};
