"use client";

import { useState, useEffect } from 'react';
import { useSoloOnboardingStore } from '@/store/solo-onboarding-store';
import { OnboardingLayout } from './OnboardingLayout';
import { CookingSkillLevel } from '@/types/user';
import { cn } from '@/lib/utils';
import { ChefHat, Clock, Briefcase, Calendar } from 'lucide-react';

const skillLevels: { id: CookingSkillLevel; label: string; desc: string; icon: string }[] = [
    {
        id: 'beginner',
        label: 'Debutant',
        desc: 'Je prefere des recettes simples et rapides',
        icon: '1'
    },
    {
        id: 'intermediate',
        label: 'Intermediaire',
        desc: 'Je maitrise les bases et aime experimenter',
        icon: '2'
    },
    {
        id: 'advanced',
        label: 'Avance',
        desc: 'Je suis a l\'aise avec des recettes complexes',
        icon: '3'
    },
];

export const StepCooking = () => {
    const { data, updateData, nextStep, prevStep } = useSoloOnboardingStore();
    const [cookingTimeWeekday, setCookingTimeWeekday] = useState(data.cookingTimeWeekday || 30);
    const [cookingTimeWeekend, setCookingTimeWeekend] = useState(data.cookingTimeWeekend || 60);
    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
        setIsHydrated(true);
        if (data.cookingTimeWeekday) setCookingTimeWeekday(data.cookingTimeWeekday);
        if (data.cookingTimeWeekend) setCookingTimeWeekend(data.cookingTimeWeekend);
    }, []);

    const handleContinue = () => {
        updateData({
            cookingTimeWeekday,
            cookingTimeWeekend,
            cookingTimeAvailable: cookingTimeWeekday // For backward compatibility
        });
        nextStep();
    };

    const getTimeDescription = (time: number) => {
        if (time < 30) return "Recettes express";
        if (time < 60) return "Recettes equilibrees";
        return "Recettes elaborees";
    };

    return (
        <OnboardingLayout
            title="Parlons cuisine !"
            subtitle="Aidez-nous a adapter les recettes a votre niveau et disponibilite."
            currentStep={5}
            totalSteps={8}
            showBack={true}
            onBack={prevStep}
        >
            <div className="space-y-6">
                {/* Cooking Skill Level */}
                <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <ChefHat className="text-gray-500" size={18} />
                        Votre niveau en cuisine
                    </h3>
                    <div className="space-y-2">
                        {skillLevels.map((skill) => {
                            const isSelected = data.cookingSkillLevel === skill.id;

                            return (
                                <button
                                    key={skill.id}
                                    onClick={() => updateData({ cookingSkillLevel: skill.id })}
                                    className={cn(
                                        "w-full p-3 rounded-xl border-2 text-left transition-all flex items-center gap-3",
                                        isSelected
                                            ? "border-gray-900 bg-gray-900"
                                            : "border-gray-200 bg-white hover:border-gray-300"
                                    )}
                                >
                                    <div className={cn(
                                        "h-10 w-10 rounded-lg flex items-center justify-center font-bold text-lg",
                                        isSelected ? "bg-white text-gray-900" : "bg-gray-100 text-gray-500"
                                    )}>
                                        {skill.icon}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className={cn(
                                            "font-semibold text-sm",
                                            isSelected ? "text-white" : "text-gray-900"
                                        )}>
                                            {skill.label}
                                        </h4>
                                        <p className={cn(
                                            "text-xs",
                                            isSelected ? "text-gray-300" : "text-gray-500"
                                        )}>{skill.desc}</p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Cooking Time - Weekday */}
                <div className="bg-gray-50 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <Briefcase className="text-gray-500" size={18} />
                        <h3 className="text-sm font-semibold text-gray-700">
                            Temps en semaine
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
                            className="flex-1 accent-gray-900"
                        />
                        <div className="bg-white rounded-xl px-3 py-2 min-w-[80px] text-center shadow-sm border border-gray-100">
                            <span className="text-xl font-bold text-gray-900">{cookingTimeWeekday}</span>
                            <span className="text-xs text-gray-500 ml-1">min</span>
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                        {getTimeDescription(cookingTimeWeekday)}
                    </p>
                </div>

                {/* Cooking Time - Weekend */}
                <div className="bg-gray-50 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <Calendar className="text-gray-500" size={18} />
                        <h3 className="text-sm font-semibold text-gray-700">
                            Temps le week-end
                        </h3>
                    </div>
                    <div className="flex items-center gap-4">
                        <input
                            type="range"
                            min="10"
                            max="180"
                            step="10"
                            value={cookingTimeWeekend}
                            onChange={(e) => setCookingTimeWeekend(parseInt(e.target.value))}
                            className="flex-1 accent-gray-900"
                        />
                        <div className="bg-white rounded-xl px-3 py-2 min-w-[80px] text-center shadow-sm border border-gray-100">
                            <span className="text-xl font-bold text-gray-900">{cookingTimeWeekend}</span>
                            <span className="text-xs text-gray-500 ml-1">min</span>
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                        {getTimeDescription(cookingTimeWeekend)}
                    </p>
                </div>
            </div>

            <div className="mt-auto pt-6">
                <button
                    onClick={handleContinue}
                    disabled={!data.cookingSkillLevel}
                    className="w-full bg-gray-900 disabled:bg-gray-300 text-white py-4 rounded-xl font-bold shadow-lg disabled:cursor-not-allowed transition-all hover:bg-black"
                >
                    Continuer
                </button>
            </div>
        </OnboardingLayout>
    );
};
