"use client";

import { useState } from 'react';
import { useOnboardingStore } from '@/store/onboarding-store';
import { OnboardingLayout } from './OnboardingLayout';
import { DietType, FastingType } from '@/types/user';
import { cn } from '@/lib/utils';
import { Utensils, Timer, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const diets: { id: DietType; label: string }[] = [
    { id: 'omnivore', label: 'Omnivore (Tout)' },
    { id: 'vegetarian', label: 'Végétarien' },
    { id: 'vegan', label: 'Végétalien (Vegan)' },
    { id: 'pescatarian', label: 'Pescétarien' },
    { id: 'keto', label: 'Cétogène (Keto)' },
];

const fastingTypes: { id: FastingType; label: string; desc: string; window?: string }[] = [
    { id: 'none', label: 'Non', desc: 'Je ne pratique pas le jeûne' },
    { id: '16_8', label: '16:8', desc: '16h de jeûne, 8h pour manger', window: '12:00 - 20:00' },
    { id: '18_6', label: '18:6', desc: '18h de jeûne, 6h pour manger', window: '12:00 - 18:00' },
    { id: '20_4', label: '20:4 (OMAD)', desc: '20h de jeûne, 4h pour manger', window: '14:00 - 18:00' },
    { id: '5_2', label: '5:2', desc: '5 jours normaux, 2 jours à 500kcal' },
];

const timeSlots = [
    '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', 
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'
];

export const StepDiet = () => {
    const { profile, updateProfile, nextStep } = useOnboardingStore();
    const [eatingWindowStart, setEatingWindowStart] = useState(profile.fastingSchedule?.eatingWindowStart || '12:00');
    const [eatingWindowEnd, setEatingWindowEnd] = useState(profile.fastingSchedule?.eatingWindowEnd || '20:00');
    
    const selectedFasting = profile.fastingSchedule?.type || 'none';
    const showTimeSelector = selectedFasting !== 'none' && selectedFasting !== '5_2';

    const handleFastingSelect = (type: FastingType) => {
        // Définir des fenêtres par défaut selon le type
        let defaultStart = '12:00';
        let defaultEnd = '20:00';
        
        if (type === '18_6') {
            defaultEnd = '18:00';
        } else if (type === '20_4') {
            defaultStart = '14:00';
            defaultEnd = '18:00';
        }
        
        setEatingWindowStart(defaultStart);
        setEatingWindowEnd(defaultEnd);
        
        updateProfile({
            fastingSchedule: {
                type,
                eatingWindowStart: type !== 'none' && type !== '5_2' ? defaultStart : undefined,
                eatingWindowEnd: type !== 'none' && type !== '5_2' ? defaultEnd : undefined,
            }
        });
    };

    const handleTimeChange = (which: 'start' | 'end', value: string) => {
        if (which === 'start') {
            setEatingWindowStart(value);
        } else {
            setEatingWindowEnd(value);
        }
        
        updateProfile({
            fastingSchedule: {
                type: selectedFasting,
                eatingWindowStart: which === 'start' ? value : eatingWindowStart,
                eatingWindowEnd: which === 'end' ? value : eatingWindowEnd,
            }
        });
    };

    return (
        <OnboardingLayout
            title="Habitudes alimentaires"
            subtitle="Personnalisez votre expérience nutritionnelle."
        >
            <div className="flex flex-col h-full">
                <div className="flex-1 space-y-6">

                    {/* Diet Preference */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            <Utensils size={16} />
                            Régime alimentaire
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {diets.map((diet) => (
                                <button
                                    key={diet.id}
                                    onClick={() => updateProfile({ dietaryPreferences: diet.id })}
                                    className={cn(
                                        "px-3 py-1.5 rounded-full text-sm font-medium transition-all border",
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

                    {/* Intermittent Fasting */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            <Timer size={16} />
                            Pratiquez-vous le jeûne intermittent ?
                        </label>

                        <div className="grid grid-cols-2 gap-2">
                            {fastingTypes.map((fasting) => (
                                <button
                                    key={fasting.id}
                                    onClick={() => handleFastingSelect(fasting.id)}
                                    className={cn(
                                        "p-3 rounded-xl border-2 text-left transition-all",
                                        selectedFasting === fasting.id
                                            ? "border-secondary-500 bg-secondary-50 shadow-md"
                                            : "border-gray-100 bg-white hover:border-secondary-200"
                                    )}
                                >
                                    <div className={cn(
                                        "font-bold text-sm",
                                        selectedFasting === fasting.id ? "text-secondary-700" : "text-gray-900"
                                    )}>
                                        {fasting.label}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-0.5">{fasting.desc}</div>
                                </button>
                            ))}
                        </div>

                        {/* Time Selector for fasting window */}
                        <AnimatePresence>
                            {showTimeSelector && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="bg-gradient-to-br from-secondary-50 to-primary-50 rounded-xl p-4 space-y-3">
                                        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                            <Clock size={16} />
                                            Votre fenêtre alimentaire
                                        </div>
                                        
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1">
                                                <label className="text-xs text-gray-500 mb-1 block">Début</label>
                                                <select
                                                    value={eatingWindowStart}
                                                    onChange={(e) => handleTimeChange('start', e.target.value)}
                                                    className="w-full p-2 rounded-lg border border-gray-200 text-sm font-medium"
                                                >
                                                    {timeSlots.map((time) => (
                                                        <option key={time} value={time}>{time}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="text-gray-400 font-bold pt-4">→</div>
                                            <div className="flex-1">
                                                <label className="text-xs text-gray-500 mb-1 block">Fin</label>
                                                <select
                                                    value={eatingWindowEnd}
                                                    onChange={(e) => handleTimeChange('end', e.target.value)}
                                                    className="w-full p-2 rounded-lg border border-gray-200 text-sm font-medium"
                                                >
                                                    {timeSlots.map((time) => (
                                                        <option key={time} value={time}>{time}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                        
                                        <p className="text-xs text-gray-600">
                                            💡 L'IA adaptera vos repas pour respecter votre fenêtre de {eatingWindowStart} à {eatingWindowEnd}.
                                        </p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {selectedFasting === '5_2' && (
                            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800">
                                💡 Les jours de restriction (500 kcal), l'IA vous proposera des repas légers et nutritifs.
                            </div>
                        )}
                    </div>

                </div>

                <div className="pt-4 shrink-0">
                    <button
                        onClick={nextStep}
                        className="w-full bg-primary-600 disabled:bg-gray-300 text-white py-4 rounded-xl font-bold shadow-lg shadow-primary-200 disabled:shadow-none transition-all hover:bg-primary-700"
                    >
                        Continuer
                    </button>
                </div>
            </div>
        </OnboardingLayout>
    );
};
