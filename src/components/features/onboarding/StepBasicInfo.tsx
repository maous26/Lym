"use client";

import { useSoloOnboardingStore } from '@/store/solo-onboarding-store';
import { OnboardingLayout } from './OnboardingLayout';
import { User, Ruler, Weight, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

export const StepBasicInfo = () => {
    const { data, updateData, nextStep } = useSoloOnboardingStore();

    const isComplete = data.firstName && data.birthDate && data.gender && data.height && data.weight;

    return (
        <OnboardingLayout
            title="Faisons connaissance"
            subtitle="Ces informations nous permettent de calculer vos besoins précis."
            currentStep={1}
            totalSteps={8}
            showBack={false}
        >
            <div className="space-y-6">
                {/* Name */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Prénom</label>
                    <div className="relative">
                        <User className="absolute left-4 top-3.5 text-gray-400 h-5 w-5" />
                        <input
                            type="text"
                            value={data.firstName}
                            onChange={(e) => updateData({ firstName: e.target.value })}
                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all bg-white text-gray-900 placeholder:text-gray-400"
                            placeholder="Votre prénom"
                        />
                    </div>
                </div>

                {/* Gender */}
                <div className="grid grid-cols-2 gap-4">
                    {(['male', 'female'] as const).map((g) => (
                        <button
                            key={g}
                            onClick={() => updateData({ gender: g })}
                            className={cn(
                                "py-3 px-4 rounded-xl border-2 transition-all font-medium",
                                data.gender === g
                                    ? "border-primary-500 bg-primary-50 text-primary-700"
                                    : "border-gray-100 bg-white text-gray-500 hover:border-gray-200"
                            )}
                        >
                            {g === 'male' ? 'Homme' : 'Femme'}
                        </button>
                    ))}
                </div>

                {/* Birth Date & Height */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Date de naissance</label>
                        <div className="relative">
                            <Calendar className="absolute left-4 top-3.5 text-gray-400 h-5 w-5" />
                            <input
                                type="date"
                                value={data.birthDate || ''}
                                onChange={(e) => updateData({ birthDate: e.target.value })}
                                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all bg-white text-gray-900 placeholder:text-gray-400"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Taille (cm)</label>
                        <div className="relative">
                            <Ruler className="absolute left-4 top-3.5 text-gray-400 h-5 w-5" />
                            <input
                                type="number"
                                value={data.height || ''}
                                onChange={(e) => updateData({ height: parseInt(e.target.value) })}
                                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all bg-white text-gray-900 placeholder:text-gray-400"
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
                            value={data.weight || ''}
                            onChange={(e) => updateData({ weight: parseFloat(e.target.value) })}
                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all bg-white text-gray-900 placeholder:text-gray-400"
                            placeholder="kg"
                        />
                    </div>
                </div>
            </div>

            <div className="mt-auto pt-8">
                <button
                    onClick={nextStep}
                    disabled={!isComplete}
                    className="w-full bg-gray-900 disabled:bg-gray-300 text-white py-4 rounded-xl font-bold shadow-lg transition-all hover:bg-black disabled:cursor-not-allowed"
                >
                    Continuer
                </button>
            </div>
        </OnboardingLayout>
    );
};
