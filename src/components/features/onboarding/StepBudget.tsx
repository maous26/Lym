"use client";

import { useState, useEffect } from 'react';
import { useSoloOnboardingStore } from '@/store/solo-onboarding-store';
import { OnboardingLayout } from './OnboardingLayout';
import { cn } from '@/lib/utils';
import { Wallet, Euro, TrendingUp, TrendingDown, Minus } from 'lucide-react';

type PricePreference = 'economy' | 'balanced' | 'premium';

const priceOptions: { id: PricePreference; label: string; desc: string; icon: any }[] = [
    {
        id: 'economy',
        label: 'Economique',
        desc: 'Recettes a petit budget, ingredients de base',
        icon: TrendingDown
    },
    {
        id: 'balanced',
        label: 'Equilibre',
        desc: 'Bon rapport qualite-prix, variete moderee',
        icon: Minus
    },
    {
        id: 'premium',
        label: 'Premium',
        desc: 'Ingredients de qualite, produits bio/locaux',
        icon: TrendingUp
    },
];

export const StepBudget = () => {
    const { data, updateData, nextStep, prevStep } = useSoloOnboardingStore();
    const [weeklyBudget, setWeeklyBudget] = useState(data.weeklyBudget || 100);
    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
        setIsHydrated(true);
        if (data.weeklyBudget) setWeeklyBudget(data.weeklyBudget);
    }, []);

    const handleContinue = () => {
        updateData({ weeklyBudget });
        nextStep();
    };

    const getBudgetDescription = (budget: number) => {
        if (budget < 50) return "Budget serre - recettes economiques";
        if (budget < 100) return "Budget modere - bonne variete";
        if (budget < 150) return "Budget confortable - qualite et variete";
        return "Budget genereux - ingredients premium possibles";
    };

    const canContinue = data.pricePreference !== undefined;

    return (
        <OnboardingLayout
            title="Votre budget alimentation"
            subtitle="Pour vous proposer des recettes adaptees a vos moyens."
            currentStep={6}
            totalSteps={8}
            showBack={true}
            onBack={prevStep}
        >
            <div className="space-y-6">
                {/* Price Preference */}
                <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <Euro className="text-gray-500" size={18} />
                        Gamme de prix preferee
                    </h3>
                    <div className="space-y-2">
                        {priceOptions.map((option) => {
                            const isSelected = data.pricePreference === option.id;
                            const Icon = option.icon;

                            return (
                                <button
                                    key={option.id}
                                    onClick={() => updateData({ pricePreference: option.id })}
                                    className={cn(
                                        "w-full p-3 rounded-xl border-2 text-left transition-all flex items-center gap-3",
                                        isSelected
                                            ? "border-gray-900 bg-gray-900"
                                            : "border-gray-200 bg-white hover:border-gray-300"
                                    )}
                                >
                                    <div className={cn(
                                        "h-10 w-10 rounded-lg flex items-center justify-center",
                                        isSelected ? "bg-white text-gray-900" : "bg-gray-100 text-gray-500"
                                    )}>
                                        <Icon size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className={cn(
                                            "font-semibold text-sm",
                                            isSelected ? "text-white" : "text-gray-900"
                                        )}>
                                            {option.label}
                                        </h4>
                                        <p className={cn(
                                            "text-xs",
                                            isSelected ? "text-gray-300" : "text-gray-500"
                                        )}>{option.desc}</p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Weekly Budget */}
                <div className="bg-gray-50 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <Wallet className="text-gray-500" size={18} />
                        <h3 className="text-sm font-semibold text-gray-700">
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
                            className="flex-1 accent-gray-900"
                        />
                        <div className="bg-white rounded-xl px-3 py-2 min-w-[90px] text-center shadow-sm border border-gray-100">
                            <span className="text-xl font-bold text-gray-900">{weeklyBudget}</span>
                            <span className="text-xs text-gray-500 ml-1">EUR/sem</span>
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                        {getBudgetDescription(weeklyBudget)}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                        Soit environ {Math.round(weeklyBudget / 7)}EUR par jour
                    </p>
                </div>

                {/* Info */}
                <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                    <p className="text-xs text-blue-700">
                        Ces informations nous permettent de vous suggerer des recettes
                        qui correspondent a votre budget et vos preferences.
                    </p>
                </div>
            </div>

            <div className="mt-auto pt-6">
                <button
                    onClick={handleContinue}
                    disabled={!canContinue}
                    className="w-full bg-gray-900 disabled:bg-gray-300 text-white py-4 rounded-xl font-bold shadow-lg disabled:cursor-not-allowed transition-all hover:bg-black"
                >
                    Continuer
                </button>
            </div>
        </OnboardingLayout>
    );
};
