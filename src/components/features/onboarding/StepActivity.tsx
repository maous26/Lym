"use client";

import { useOnboardingStore } from '@/store/onboarding-store';
import { OnboardingLayout } from './OnboardingLayout';
import { ActivityLevel } from '@/types/user';
import { cn } from '@/lib/utils';
import { Armchair, Footprints, Bike, Dumbbell, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

            <AnimatePresence>
                {profile.activityLevel && profile.activityLevel !== 'sedentary' && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="mt-8 space-y-6 pt-4 border-t border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-900">Détails de votre activité</h3>

                            {/* Sport Type */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Quel sport pratiquez-vous principalement ?</label>
                                <input
                                    type="text"
                                    value={profile.sportType || ''}
                                    onChange={(e) => updateProfile({ sportType: e.target.value })}
                                    placeholder="Ex: Course à pied, Musculation, Tennis..."
                                    className="w-full p-4 rounded-xl border-2 border-gray-100 bg-white focus:border-secondary-500 focus:ring-0 transition-all outline-none"
                                />
                            </div>

                            {/* Frequency */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">À quelle fréquence ?</label>
                                <select
                                    value={profile.sportFrequency || ''}
                                    onChange={(e) => updateProfile({ sportFrequency: e.target.value })}
                                    className="w-full p-4 rounded-xl border-2 border-gray-100 bg-white focus:border-secondary-500 focus:ring-0 transition-all outline-none appearance-none"
                                >
                                    <option value="" disabled>Sélectionnez une fréquence</option>
                                    <option value="1-2">1-2 fois par semaine</option>
                                    <option value="3-4">3-4 fois par semaine</option>
                                    <option value="5+">5 fois ou plus par semaine</option>
                                </select>
                            </div>

                            {/* Intensity */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Quelle intensité ?</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { id: 'low', label: 'Faible', emoji: '😌' },
                                        { id: 'medium', label: 'Moyenne', emoji: '😅' },
                                        { id: 'high', label: 'Élevée', emoji: '🥵' }
                                    ].map((level) => (
                                        <button
                                            key={level.id}
                                            onClick={() => updateProfile({ sportIntensity: level.id as any })}
                                            className={cn(
                                                "p-3 rounded-xl border-2 text-center transition-all",
                                                profile.sportIntensity === level.id
                                                    ? "border-secondary-500 bg-secondary-50 text-secondary-900 font-bold"
                                                    : "border-gray-100 bg-white text-gray-600 hover:border-secondary-200"
                                            )}
                                        >
                                            <div className="text-2xl mb-1">{level.emoji}</div>
                                            <div className="text-sm">{level.label}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="mt-auto pt-8">
                <button
                    onClick={nextStep}
                    disabled={
                        !profile.activityLevel ||
                        (profile.activityLevel !== 'sedentary' && (!profile.sportType || !profile.sportFrequency || !profile.sportIntensity))
                    }
                    className="w-full bg-secondary-600 disabled:bg-gray-300 text-white py-4 rounded-xl font-bold shadow-lg shadow-secondary-200 disabled:shadow-none transition-all hover:bg-secondary-700"
                >
                    Continuer
                </button>
            </div>
        </OnboardingLayout>
    );
};
