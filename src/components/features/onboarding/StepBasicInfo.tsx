"use client";

import { useOnboardingStore } from '@/store/onboarding-store';
import { OnboardingLayout } from './OnboardingLayout';
import { User, Ruler, Weight, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

export const StepBasicInfo = () => {
    const { profile, updateProfile, nextStep } = useOnboardingStore();

    const isComplete = profile.name && profile.age && profile.gender && profile.height && profile.weight;

    return (
        <OnboardingLayout
            title="Faisons connaissance"
            subtitle="Ces informations nous permettent de calculer vos besoins précis."
        >
            <div className="space-y-6">
                {/* Name */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Prénom</label>
                    <div className="relative">
                        <User className="absolute left-4 top-3.5 text-gray-400 h-5 w-5" />
                        <input
                            type="text"
                            value={profile.name}
                            onChange={(e) => updateProfile({ name: e.target.value })}
                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
                            placeholder="Votre prénom"
                        />
                    </div>
                </div>

                {/* Gender */}
                <div className="grid grid-cols-2 gap-4">
                    {['male', 'female'].map((g) => (
                        <button
                            key={g}
                            onClick={() => updateProfile({ gender: g as any })}
                            className={cn(
                                "py-3 px-4 rounded-xl border-2 transition-all font-medium",
                                profile.gender === g
                                    ? "border-primary-500 bg-primary-50 text-primary-700"
                                    : "border-gray-100 bg-white text-gray-500 hover:border-gray-200"
                            )}
                        >
                            {g === 'male' ? 'Homme' : 'Femme'}
                        </button>
                    ))}
                </div>

                {/* Age & Height */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Age</label>
                        <div className="relative">
                            <Calendar className="absolute left-4 top-3.5 text-gray-400 h-5 w-5" />
                            <input
                                type="number"
                                value={profile.age || ''}
                                onChange={(e) => updateProfile({ age: parseInt(e.target.value) })}
                                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
                                placeholder="Ans"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Taille (cm)</label>
                        <div className="relative">
                            <Ruler className="absolute left-4 top-3.5 text-gray-400 h-5 w-5" />
                            <input
                                type="number"
                                value={profile.height || ''}
                                onChange={(e) => updateProfile({ height: parseInt(e.target.value) })}
                                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
                                placeholder="cm"
                            />
                        </div>
                    </div>
                </div>

                {/* Weight */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Poids actuel (kg)</label>
                    <div className="relative">
                        <Weight className="absolute left-4 top-3.5 text-gray-400 h-5 w-5" />
                        <input
                            type="number"
                            value={profile.weight || ''}
                            onChange={(e) => updateProfile({ weight: parseFloat(e.target.value) })}
                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
                            placeholder="kg"
                        />
                    </div>
                </div>
            </div>

            <div className="mt-auto pt-8">
                <button
                    onClick={nextStep}
                    disabled={!isComplete}
                    className="w-full bg-primary-600 disabled:bg-gray-300 text-white py-4 rounded-xl font-bold shadow-lg shadow-primary-200 disabled:shadow-none transition-all hover:bg-primary-700"
                >
                    Continuer
                </button>
            </div>
        </OnboardingLayout>
    );
};
