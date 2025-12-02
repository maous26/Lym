"use client";

import { useState } from 'react';
import { useSoloOnboardingStore } from '@/store/solo-onboarding-store';
import { OnboardingLayout } from './OnboardingLayout';
import { CookingSkillLevel } from '@/types/user';
import { cn } from '@/lib/utils';
import { ChefHat, Clock, Calendar, Wallet, Euro } from 'lucide-react';

type PricePreference = 'economy' | 'balanced' | 'premium';

const pricePreferences: { id: PricePreference; label: string; desc: string; icon: string }[] = [
    {
        id: 'economy',
        label: 'Économique',
        desc: 'Premier prix et promotions',
        icon: '💰'
    },
    {
        id: 'balanced',
        label: 'Équilibré',
        desc: 'Bon rapport qualité/prix',
        icon: '⚖️'
    },
    {
        id: 'premium',
        label: 'Premium',
        desc: 'Bio et produits de qualité',
        icon: '✨'
    },
];

const skillLevels: { id: CookingSkillLevel; label: string; desc: string; icon: string }[] = [
    {
        id: 'beginner',
        label: 'Débutant',
        desc: 'Je préfère des recettes simples et rapides',
        icon: '👨‍🍳'
    },
    {
        id: 'intermediate',
        label: 'Intermédiaire',
        desc: 'Je maîtrise les bases et aime expérimenter',
        icon: '👨‍🍳✨'
    },
    {
        id: 'advanced',
        label: 'Avancé',
        desc: 'Je suis à l\'aise avec des recettes complexes',
        icon: '👨‍🍳⭐'
    },
];

export const StepCooking = () => {
    const { profile, updateProfile, nextStep } = useSoloOnboardingStore();
    const [cookingTimeWeekday, setCookingTimeWeekday] = useState(profile.cookingTimeWeekday || 30);
    const [cookingTimeWeekend, setCookingTimeWeekend] = useState(profile.cookingTimeWeekend || 60);
    const [weeklyBudget, setWeeklyBudget] = useState(profile.weeklyBudget || 100);

    const handleContinue = () => {
        updateProfile({
            cookingTimeWeekday,
            cookingTimeWeekend,
            weeklyBudget,
        });
        nextStep();
    };

    return (
        <OnboardingLayout
            title="Parlons cuisine !"
            subtitle="Aidez-nous à adapter les recettes à votre niveau et disponibilité."
        >
            <div className="space-y-6">
                {/* Cooking Skill Level */}
                <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <ChefHat className="text-primary-600" size={20} />
                        Votre niveau en cuisine
                    </h3>
                    <div className="space-y-3">
                        {skillLevels.map((skill) => {
                            const isSelected = profile.cookingSkillLevel === skill.id;

                            return (
                                <button
                                    key={skill.id}
                                    onClick={() => updateProfile({ cookingSkillLevel: skill.id })}
                                    className={cn(
                                        "w-full p-4 rounded-xl border-2 text-left transition-all flex items-center gap-4",
                                        isSelected
                                            ? "border-primary-500 bg-primary-50 shadow-md"
                                            : "border-gray-200 bg-white hover:border-primary-200 hover:bg-primary-50/50"
                                    )}
                                >
                                    <div className="text-3xl">{skill.icon}</div>
                                    <div className="flex-1">
                                        <h4 className={cn(
                                            "font-bold",
                                            isSelected ? "text-primary-900" : "text-gray-900"
                                        )}>
                                            {skill.label}
                                        </h4>
                                        <p className="text-sm text-gray-500">{skill.desc}</p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Cooking Time - Weekday */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                        <Clock className="text-blue-600" size={20} />
                        <h3 className="text-lg font-bold text-gray-900">
                            Temps disponible en semaine
                        </h3>
                    </div>
                    <div className="flex items-center gap-4">
                        <input
                            type="range"
                            min="10"
                            max="120"
                            step="5"
                            value={cookingTimeWeekday}
                            onChange={(e) => setCookingTimeWeekday(parseInt(e.target.value))}
                            className="flex-1 accent-blue-600"
                        />
                        <div className="bg-white rounded-xl px-4 py-2 min-w-[100px] text-center shadow-sm">
                            <span className="text-2xl font-bold text-blue-600">{cookingTimeWeekday}</span>
                            <span className="text-sm text-gray-500 ml-1">min</span>
                        </div>
                    </div>
                    <p className="text-xs text-gray-600 mt-2">
                        {cookingTimeWeekday < 30 && "Recettes express et simples"}
                        {cookingTimeWeekday >= 30 && cookingTimeWeekday < 60 && "Recettes équilibrées en temps"}
                        {cookingTimeWeekday >= 60 && "Recettes élaborées possibles"}
                    </p>
                </div>

                {/* Cooking Time - Weekend */}
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                        <Calendar className="text-orange-600" size={20} />
                        <h3 className="text-lg font-bold text-gray-900">
                            Temps disponible le weekend
                        </h3>
                    </div>
                    <div className="flex items-center gap-4">
                        <input
                            type="range"
                            min="15"
                            max="180"
                            step="15"
                            value={cookingTimeWeekend}
                            onChange={(e) => setCookingTimeWeekend(parseInt(e.target.value))}
                            className="flex-1 accent-orange-600"
                        />
                        <div className="bg-white rounded-xl px-4 py-2 min-w-[100px] text-center shadow-sm">
                            <span className="text-2xl font-bold text-orange-600">{cookingTimeWeekend}</span>
                            <span className="text-sm text-gray-500 ml-1">min</span>
                        </div>
                    </div>
                    <p className="text-xs text-gray-600 mt-2">
                        {cookingTimeWeekend < 45 && "Recettes rapides même le weekend"}
                        {cookingTimeWeekend >= 45 && cookingTimeWeekend < 90 && "Temps pour des plats mijotés"}
                        {cookingTimeWeekend >= 90 && "Possibilité de batch cooking et recettes complexes"}
                    </p>
                </div>

                {/* Weekly Budget */}
                <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                        <Wallet className="text-emerald-600" size={20} />
                        <h3 className="text-lg font-bold text-gray-900">
                            Budget courses hebdomadaire
                        </h3>
                    </div>
                    <div className="flex items-center gap-4">
                        <input
                            type="range"
                            min="30"
                            max="300"
                            step="10"
                            value={weeklyBudget}
                            onChange={(e) => setWeeklyBudget(parseInt(e.target.value))}
                            className="flex-1 accent-emerald-600"
                        />
                        <div className="bg-white rounded-xl px-4 py-2 min-w-[100px] text-center shadow-sm flex items-center justify-center gap-1">
                            <span className="text-2xl font-bold text-emerald-600">{weeklyBudget}</span>
                            <Euro size={18} className="text-emerald-600" />
                        </div>
                    </div>
                    <p className="text-xs text-gray-600 mt-2">
                        {weeklyBudget < 60 && "Budget serré — recettes économiques prioritaires"}
                        {weeklyBudget >= 60 && weeklyBudget < 120 && "Budget moyen — bon équilibre qualité/prix"}
                        {weeklyBudget >= 120 && weeklyBudget < 200 && "Budget confortable — produits de qualité accessibles"}
                        {weeklyBudget >= 200 && "Budget généreux — produits premium et bio possibles"}
                    </p>
                </div>

                {/* Price Preference */}
                <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <Euro className="text-primary-600" size={20} />
                        Gamme de prix préférée
                    </h3>
                    <div className="grid grid-cols-3 gap-3">
                        {pricePreferences.map((pref) => {
                            const isSelected = profile.pricePreference === pref.id;

                            return (
                                <button
                                    key={pref.id}
                                    onClick={() => updateProfile({ pricePreference: pref.id })}
                                    className={cn(
                                        "p-3 rounded-xl border-2 text-center transition-all",
                                        isSelected
                                            ? "border-primary-500 bg-primary-50 shadow-md"
                                            : "border-gray-200 bg-white hover:border-primary-200 hover:bg-primary-50/50"
                                    )}
                                >
                                    <div className="text-2xl mb-1">{pref.icon}</div>
                                    <h4 className={cn(
                                        "font-bold text-sm",
                                        isSelected ? "text-primary-900" : "text-gray-900"
                                    )}>
                                        {pref.label}
                                    </h4>
                                    <p className="text-xs text-gray-500 mt-1">{pref.desc}</p>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Info Box */}
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                    <p className="text-sm text-emerald-800">
                        <span className="font-bold">💡 Astuce :</span> L'IA adaptera les recettes à votre budget et préférence de prix pour optimiser vos courses.
                    </p>
                </div>
            </div>

            <div className="mt-auto pt-8">
                <button
                    onClick={handleContinue}
                    disabled={!profile.cookingSkillLevel}
                    className="w-full bg-primary-600 disabled:bg-gray-300 text-white py-4 rounded-xl font-bold shadow-lg shadow-primary-200 disabled:shadow-none transition-all hover:bg-primary-700"
                >
                    Continuer
                </button>
            </div>
        </OnboardingLayout>
    );
};
