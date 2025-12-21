"use client";

import { useState, useEffect } from 'react';
import { useSoloOnboardingStore } from '@/store/solo-onboarding-store';
import { OnboardingLayout } from './OnboardingLayout';
import { FastingType } from '@/types/user';
import { cn } from '@/lib/utils';
import { Clock, Moon, Sun, Info } from 'lucide-react';

const fastingOptions: { id: FastingType; label: string; desc: string; hours?: string }[] = [
    {
        id: 'none',
        label: 'Pas de jeune',
        desc: 'Je mange sans restriction horaire',
    },
    {
        id: '16_8',
        label: 'Jeune 16/8',
        desc: '16h de jeune, 8h pour manger',
        hours: '12h-20h'
    },
    {
        id: '18_6',
        label: 'Jeune 18/6',
        desc: '18h de jeune, 6h pour manger',
        hours: '12h-18h'
    },
    {
        id: '20_4',
        label: 'Jeune 20/4',
        desc: '20h de jeune, 4h pour manger',
        hours: '14h-18h'
    },
    {
        id: '5_2',
        label: 'Methode 5:2',
        desc: '5 jours normaux, 2 jours reduits',
    },
];

export const StepFasting = () => {
    const { data, updateData, nextStep, prevStep } = useSoloOnboardingStore();
    const [eatingWindowStart, setEatingWindowStart] = useState(
        data.fastingSchedule?.eatingWindowStart || '12:00'
    );
    const [eatingWindowEnd, setEatingWindowEnd] = useState(
        data.fastingSchedule?.eatingWindowEnd || '20:00'
    );
    const [isHydrated, setIsHydrated] = useState(false);

    const selectedType = data.fastingSchedule?.type || 'none';
    const showTimeInputs = selectedType !== 'none' && selectedType !== '5_2';

    useEffect(() => {
        setIsHydrated(true);
        if (data.fastingSchedule?.eatingWindowStart) {
            setEatingWindowStart(data.fastingSchedule.eatingWindowStart);
        }
        if (data.fastingSchedule?.eatingWindowEnd) {
            setEatingWindowEnd(data.fastingSchedule.eatingWindowEnd);
        }
    }, []);

    const handleTypeChange = (type: FastingType) => {
        // Set default times based on fasting type
        let start = '12:00';
        let end = '20:00';

        if (type === '18_6') {
            start = '12:00';
            end = '18:00';
        } else if (type === '20_4') {
            start = '14:00';
            end = '18:00';
        }

        setEatingWindowStart(start);
        setEatingWindowEnd(end);

        updateData({
            fastingSchedule: {
                type,
                eatingWindowStart: start,
                eatingWindowEnd: end,
            }
        });
    };

    const handleContinue = () => {
        updateData({
            fastingSchedule: {
                type: selectedType,
                eatingWindowStart: showTimeInputs ? eatingWindowStart : undefined,
                eatingWindowEnd: showTimeInputs ? eatingWindowEnd : undefined,
            }
        });
        nextStep();
    };

    const canContinue = selectedType !== undefined;

    return (
        <OnboardingLayout
            title="Jeune intermittent"
            subtitle="Pratiquez-vous le jeune intermittent ? (Optionnel)"
            currentStep={7}
            totalSteps={8}
            showBack={true}
            onBack={prevStep}
        >
            <div className="space-y-6">
                {/* Fasting Type Selection */}
                <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <Moon className="text-gray-500" size={18} />
                        Type de jeune
                    </h3>
                    <div className="space-y-2">
                        {fastingOptions.map((option) => {
                            const isSelected = selectedType === option.id;

                            return (
                                <button
                                    key={option.id}
                                    onClick={() => handleTypeChange(option.id)}
                                    className={cn(
                                        "w-full p-3 rounded-xl border-2 text-left transition-all",
                                        isSelected
                                            ? "border-gray-900 bg-gray-900"
                                            : "border-gray-200 bg-white hover:border-gray-300"
                                    )}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
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
                                        {option.hours && (
                                            <span className={cn(
                                                "text-xs px-2 py-1 rounded-lg",
                                                isSelected
                                                    ? "bg-white/20 text-white"
                                                    : "bg-gray-100 text-gray-600"
                                            )}>
                                                {option.hours}
                                            </span>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Time Window (shown only for time-based fasting) */}
                {showTimeInputs && (
                    <div className="bg-gray-50 rounded-2xl p-4 space-y-4">
                        <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <Clock className="text-gray-500" size={18} />
                            Fenetre alimentaire
                        </h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-gray-500 block mb-1">
                                    <Sun size={12} className="inline mr-1" />
                                    Debut des repas
                                </label>
                                <input
                                    type="time"
                                    value={eatingWindowStart}
                                    onChange={(e) => setEatingWindowStart(e.target.value)}
                                    className="w-full p-3 rounded-xl border-2 border-gray-200 bg-white text-gray-900 font-medium focus:border-gray-900 outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 block mb-1">
                                    <Moon size={12} className="inline mr-1" />
                                    Fin des repas
                                </label>
                                <input
                                    type="time"
                                    value={eatingWindowEnd}
                                    onChange={(e) => setEatingWindowEnd(e.target.value)}
                                    className="w-full p-3 rounded-xl border-2 border-gray-200 bg-white text-gray-900 font-medium focus:border-gray-900 outline-none"
                                />
                            </div>
                        </div>

                        <p className="text-xs text-gray-500">
                            Vos repas seront planifies dans cette plage horaire.
                        </p>
                    </div>
                )}

                {/* Info */}
                <div className="bg-amber-50 rounded-xl p-3 border border-amber-100">
                    <div className="flex gap-2">
                        <Info size={16} className="text-amber-600 shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-700">
                            Le jeune intermittent est optionnel. Si vous n'en pratiquez pas,
                            selectionnez simplement "Pas de jeune".
                        </p>
                    </div>
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
