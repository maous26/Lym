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
            title="Habitudes & Famille"
            subtitle="Dernière étape pour personnaliser votre expérience."
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

                {/* Cooking Time */}
                <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Clock size={18} />
                        Temps de cuisine (min/jour)
                    </label>
                    <input
                        type="range"
                        min="10"
                        max="120"
                        step="5"
                        value={profile.cookingTimePerDay}
                        onChange={(e) => updateProfile({ cookingTimePerDay: parseInt(e.target.value) })}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                    />
                    <div className="text-center font-bold text-primary-700">
                        {profile.cookingTimePerDay} minutes
                    </div>
                </div>

                {/* Family / Kids */}
                <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Baby size={18} />
                        Cuisinez-vous pour des enfants ?
                    </label>

                    <div className="flex gap-4">
                        <button
                            onClick={() => updateProfile({ isParent: true })}
                            className={cn(
                                "flex-1 py-3 rounded-xl border-2 font-medium transition-all",
                                profile.isParent
                                    ? "border-accent-500 bg-accent-50 text-accent-700"
                                    : "border-gray-100 bg-white text-gray-500"
                            )}
                        >
                            Oui
                        </button>
                        <button
                            onClick={() => updateProfile({ isParent: false })}
                            className={cn(
                                "flex-1 py-3 rounded-xl border-2 font-medium transition-all",
                                !profile.isParent
                                    ? "border-gray-400 bg-gray-50 text-gray-800"
                                    : "border-gray-100 bg-white text-gray-500"
                            )}
                        >
                            Non
                        </button>
                    </div>

                    {profile.isParent && (
                        <div className="p-4 bg-accent-50 rounded-xl border border-accent-100 text-sm text-accent-800 animate-in fade-in slide-in-from-top-2">
                            Super ! Nous activerons le module <strong>Coach Parental</strong> pour vous aider à gérer la nutrition de vos enfants.
                        </div>
                    )}
                </div>

            </div>

            <div className="mt-auto pt-8">
                <button
                    onClick={nextStep}
                    className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold shadow-lg transition-all hover:bg-black hover:scale-[1.02]"
                >
                    Terminer mon profil
                </button>
            </div>
        </OnboardingLayout>
    );
};
