"use client";

import { useSoloOnboardingStore } from '@/store/solo-onboarding-store';
import { OnboardingLayout } from './OnboardingLayout';
import { DietType } from '@/types/user';
import { cn } from '@/lib/utils';
import { Baby, Utensils, Clock, AlertCircle, X } from 'lucide-react';
import { useState } from 'react';

const diets: { id: DietType; label: string }[] = [
    { id: 'omnivore', label: 'Omnivore (Tout)' },
    { id: 'vegetarian', label: 'Végétarien' },
    { id: 'vegan', label: 'Végétalien (Vegan)' },
    { id: 'pescatarian', label: 'Pescétarien' },
    { id: 'keto', label: 'Cétogène (Keto)' },
];

export const StepDiet = () => {
    const { profile, updateProfile, nextStep } = useSoloOnboardingStore();
    const [allergyInput, setAllergyInput] = useState('');

    const addAllergy = () => {
        if (allergyInput.trim()) {
            const currentAllergies = profile.allergies || [];
            updateProfile({ allergies: [...currentAllergies, allergyInput.trim()] });
            setAllergyInput('');
        }
    };

    const removeAllergy = (index: number) => {
        const currentAllergies = profile.allergies || [];
        updateProfile({ allergies: currentAllergies.filter((_, i) => i !== index) });
    };

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

                {/* Allergies */}
                <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <AlertCircle size={18} className="text-red-500" />
                        Allergies alimentaires
                    </label>
                    <p className="text-xs text-gray-500">Ajoutez vos allergies pour éviter ces ingrédients</p>

                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={allergyInput}
                            onChange={(e) => setAllergyInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && addAllergy()}
                            placeholder="Ex: Gluten, Arachides, Lactose..."
                            className="flex-1 p-3 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:ring-0 transition-all outline-none text-sm"
                        />
                        <button
                            onClick={addAllergy}
                            className="px-4 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-all text-sm"
                        >
                            Ajouter
                        </button>
                    </div>

                    {profile.allergies && profile.allergies.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                            {profile.allergies.map((allergy, index) => (
                                <div
                                    key={index}
                                    className="bg-red-50 border-2 border-red-200 text-red-700 px-3 py-2 rounded-full text-sm font-medium flex items-center gap-2"
                                >
                                    {allergy}
                                    <button
                                        onClick={() => removeAllergy(index)}
                                        className="hover:bg-red-200 rounded-full p-0.5 transition-colors"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
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
