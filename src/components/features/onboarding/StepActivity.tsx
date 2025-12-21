"use client";

import { useState, useEffect } from 'react';
import { useSoloOnboardingStore, SportIntensity } from '@/store/onboarding-store';
import { OnboardingLayout } from './OnboardingLayout';
import { ActivityLevel } from '@/types/user';
import { cn } from '@/lib/utils';
import { Armchair, Footprints, Bike, Dumbbell, Trophy, ChevronDown } from 'lucide-react';

// Liste des sports les plus pratiqués
const POPULAR_SPORTS = [
    { id: 'running', label: 'Course à pied / Jogging' },
    { id: 'gym', label: 'Musculation / Fitness' },
    { id: 'swimming', label: 'Natation' },
    { id: 'cycling', label: 'Cyclisme / Vélo' },
    { id: 'football', label: 'Football' },
    { id: 'tennis', label: 'Tennis' },
    { id: 'yoga', label: 'Yoga / Pilates' },
    { id: 'basketball', label: 'Basketball' },
    { id: 'boxing', label: 'Boxe / Arts martiaux' },
    { id: 'hiking', label: 'Randonnée' },
    { id: 'crossfit', label: 'CrossFit' },
    { id: 'dancing', label: 'Danse' },
    { id: 'other', label: 'Autre sport...' },
];

const activities: { id: ActivityLevel; label: string; icon: any; desc: string }[] = [
    { id: 'sedentary', label: 'Sédentaire', icon: Armchair, desc: 'Peu ou pas d\'exercice, travail de bureau' },
    { id: 'light', label: 'Légèrement actif', icon: Footprints, desc: 'Marche quotidienne, activités légères' },
    { id: 'moderate', label: 'Modérément actif', icon: Bike, desc: 'Travail actif ou exercice régulier' },
    { id: 'active', label: 'Très actif', icon: Dumbbell, desc: 'Travail physique ou sport quotidien' },
    { id: 'athlete', label: 'Athlète', icon: Trophy, desc: 'Entraînement intense biquotidien' },
];

const frequencies = [
    { value: 1, label: '1 jour/sem' },
    { value: 2, label: '2 jours/sem' },
    { value: 3, label: '3 jours/sem' },
    { value: 4, label: '4 jours/sem' },
    { value: 5, label: '5 jours/sem' },
    { value: 6, label: '6 jours/sem' },
    { value: 7, label: 'Tous les jours' },
];

const intensities: { id: SportIntensity; label: string; desc: string }[] = [
    { id: 'light', label: 'Légère', desc: 'Essoufflement léger, conversation possible' },
    { id: 'moderate', label: 'Modérée', desc: 'Essoufflement modéré, conversation difficile' },
    { id: 'intense', label: 'Intense', desc: 'Essoufflement fort, impossible de parler' },
];

export const StepActivity = () => {
    const { data, updateData, nextStep, prevStep } = useSoloOnboardingStore();
    const [isHydrated, setIsHydrated] = useState(false);
    const [showSportDetails, setShowSportDetails] = useState(false);

    // Attendre l'hydratation avant d'utiliser les valeurs du store
    useEffect(() => {
        setIsHydrated(true);
        setShowSportDetails(data.doesSport === true);
    }, []);

    // Mettre à jour showSportDetails quand data.doesSport change (après hydratation)
    useEffect(() => {
        if (isHydrated) {
            setShowSportDetails(data.doesSport === true);
        }
    }, [data.doesSport, isHydrated]);

    const handleDoesSport = (value: boolean) => {
        updateData({ doesSport: value });
        setShowSportDetails(value);
        if (!value) {
            // Reset sport fields if no sport
            updateData({
                sportType: undefined,
                sportOther: undefined,
                sportFrequency: undefined,
                sportIntensity: undefined,
            });
        }
    };

    const canContinue = data.doesSport !== undefined && (
        !data.doesSport ||
        (data.sportType && data.sportFrequency && data.sportIntensity)
    );

    return (
        <OnboardingLayout
            title=""
            subtitle=""
            currentStep={2}
            totalSteps={8}
            showBack={true}
            onBack={prevStep}
        >
            <div className="space-y-6">
                {/* Question sport */}
                <div className="bg-gray-50 rounded-2xl p-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">
                        Pratiquez-vous un sport ?
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => handleDoesSport(true)}
                            className={cn(
                                "py-3 px-4 rounded-xl border-2 font-semibold transition-all",
                                data.doesSport === true
                                    ? "border-gray-900 bg-gray-900 text-white"
                                    : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                            )}
                        >
                            Oui
                        </button>
                        <button
                            onClick={() => handleDoesSport(false)}
                            className={cn(
                                "py-3 px-4 rounded-xl border-2 font-semibold transition-all",
                                data.doesSport === false
                                    ? "border-gray-900 bg-gray-900 text-white"
                                    : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                            )}
                        >
                            Non
                        </button>
                    </div>

                    {data.doesSport === false && (
                        <p className="text-xs text-gray-500 mt-3 text-center">
                            Vous pourrez ajouter une activité sportive plus tard dans votre profil.
                        </p>
                    )}
                </div>

                {/* Détails du sport */}
                {showSportDetails && data.doesSport && (
                    <div className="space-y-4 bg-gray-50 rounded-2xl p-4">
                        {/* Type de sport */}
                        <div>
                            <label className="text-sm font-semibold text-gray-700 block mb-2">
                                Quel sport pratiquez-vous ?
                            </label>
                            <div className="relative">
                                <select
                                    value={data.sportType || ''}
                                    onChange={(e) => {
                                        updateData({ sportType: e.target.value });
                                        if (e.target.value !== 'other') {
                                            updateData({ sportOther: undefined });
                                        }
                                    }}
                                    className="w-full p-3 pr-10 rounded-xl border-2 border-gray-200 bg-white text-gray-900 font-medium appearance-none focus:border-gray-900 outline-none"
                                >
                                    <option value="">Sélectionnez un sport</option>
                                    {POPULAR_SPORTS.map((sport) => (
                                        <option key={sport.id} value={sport.id}>
                                            {sport.label}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                            </div>

                            {/* Champ autre sport */}
                            {data.sportType === 'other' && (
                                <input
                                    type="text"
                                    value={data.sportOther || ''}
                                    onChange={(e) => updateData({ sportOther: e.target.value })}
                                    placeholder="Précisez votre sport..."
                                    className="w-full mt-2 p-3 rounded-xl border-2 border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:border-gray-900 outline-none"
                                />
                            )}
                        </div>

                        {/* Fréquence */}
                        <div>
                            <label className="text-sm font-semibold text-gray-700 block mb-2">
                                À quelle fréquence ?
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {frequencies.map((freq) => (
                                    <button
                                        key={freq.value}
                                        onClick={() => updateData({ sportFrequency: freq.value })}
                                        className={cn(
                                            "px-3 py-2 rounded-lg text-sm font-medium transition-all border-2",
                                            data.sportFrequency === freq.value
                                                ? "border-gray-900 bg-gray-900 text-white"
                                                : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                                        )}
                                    >
                                        {freq.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Intensité */}
                        <div>
                            <label className="text-sm font-semibold text-gray-700 block mb-2">
                                Quelle intensité ?
                            </label>
                            <div className="space-y-2">
                                {intensities.map((intensity) => (
                                    <button
                                        key={intensity.id}
                                        onClick={() => updateData({ sportIntensity: intensity.id })}
                                        className={cn(
                                            "w-full p-3 rounded-xl border-2 text-left transition-all",
                                            data.sportIntensity === intensity.id
                                                ? "border-gray-900 bg-gray-900"
                                                : "border-gray-200 bg-white hover:border-gray-300"
                                        )}
                                    >
                                        <span className={cn(
                                            "font-semibold text-sm",
                                            data.sportIntensity === intensity.id ? "text-white" : "text-gray-900"
                                        )}>
                                            {intensity.label}
                                        </span>
                                        <span className={cn(
                                            "text-xs ml-2",
                                            data.sportIntensity === intensity.id ? "text-gray-300" : "text-gray-500"
                                        )}>
                                            — {intensity.desc}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-auto pt-6">
                <button
                    onClick={nextStep}
                    disabled={!canContinue}
                    className="w-full bg-gray-900 disabled:bg-gray-300 text-white py-4 rounded-xl font-bold shadow-lg transition-all hover:bg-black disabled:cursor-not-allowed"
                >
                    Continuer
                </button>
            </div>
        </OnboardingLayout>
    );
};
