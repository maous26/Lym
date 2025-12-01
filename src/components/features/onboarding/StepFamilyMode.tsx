"use client";

import { useState } from 'react';
import { useOnboardingStore } from '@/store/onboarding-store';
import { useFamilyStore } from '@/store/family-store';
import { OnboardingLayout } from './OnboardingLayout';
import { Users, User, ArrowRight, Check, Crown } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export function StepFamilyMode() {
    // FamilLYM Mode Selection Step
    const { profile, updateProfile, nextStep, setStep } = useOnboardingStore();
    const { setFamilyMode } = useFamilyStore();
    const [selectedMode, setSelectedMode] = useState<'solo' | 'family' | null>(null);

    const handleSelectMode = (mode: 'solo' | 'family') => {
        setSelectedMode(mode);
        setFamilyMode(mode === 'family');

        // Si mode solo, on saute l'étape de setup famille (step 2) et on va direct à BasicInfo (step 3)
        if (mode === 'solo') {
            setTimeout(() => setStep(3), 300);
        }
    };

    const modes = [
        {
            id: 'solo',
            icon: User,
            title: 'Mode Solo',
            subtitle: 'Pour moi uniquement',
            description: 'Suivi personnel, plans adaptés à vos objectifs',
            features: ['Plans personnalisés', 'Suivi individuel', 'Coach IA dédié'],
            price: '8€/mois',
            color: 'from-blue-500 to-cyan-500',
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-500',
        },
        {
            id: 'family',
            icon: Users,
            title: 'FamilLYM',
            subtitle: 'Pour toute la famille',
            description: 'Gestion multi-profils, plans adaptés par membre',
            features: ['3-6 membres', 'Plans personnalisés', 'Liste courses commune', 'Dashboard famille'],
            price: 'À partir de 12€/mois',
            color: 'from-purple-500 to-pink-500',
            bgColor: 'bg-purple-50',
            borderColor: 'border-purple-500',
            badge: 'Recommandé',
        },
    ];

    return (
        <OnboardingLayout
            title="Comment souhaitez-vous utiliser Lym ?"
            subtitle="Choisissez le mode qui vous correspond"
        >
            <div className="space-y-4">
                {modes.map((mode, index) => {
                    const Icon = mode.icon;
                    const isSelected = selectedMode === mode.id;

                    return (
                        <motion.button
                            key={mode.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            onClick={() => handleSelectMode(mode.id as 'solo' | 'family')}
                            className={cn(
                                "relative w-full p-6 rounded-3xl border-3 transition-all text-left",
                                isSelected
                                    ? `${mode.borderColor} bg-white shadow-lg scale-[1.02]`
                                    : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md"
                            )}
                        >
                            {/* Badge si recommandé */}
                            {mode.badge && (
                                <div className="absolute -top-3 left-6">
                                    <div className={`bg-gradient-to-r ${mode.color} text-white px-4 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-md`}>
                                        <Crown size={12} />
                                        {mode.badge}
                                    </div>
                                </div>
                            )}

                            <div className="flex items-start gap-4">
                                {/* Icon */}
                                <div className={cn(
                                    "flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center",
                                    isSelected
                                        ? `bg-gradient-to-r ${mode.color} shadow-md`
                                        : mode.bgColor
                                )}>
                                    <Icon
                                        size={28}
                                        className={isSelected ? "text-white" : "text-gray-700"}
                                        strokeWidth={2}
                                    />
                                </div>

                                {/* Content */}
                                <div className="flex-1">
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900">{mode.title}</h3>
                                            <p className="text-sm text-gray-500">{mode.subtitle}</p>
                                        </div>

                                        {/* Check si sélectionné */}
                                        {isSelected && (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className={`w-8 h-8 rounded-full bg-gradient-to-r ${mode.color} flex items-center justify-center`}
                                            >
                                                <Check size={18} className="text-white" strokeWidth={3} />
                                            </motion.div>
                                        )}
                                    </div>

                                    <p className="text-sm text-gray-600 mb-3">{mode.description}</p>

                                    {/* Features */}
                                    <div className="space-y-1 mb-3">
                                        {mode.features.map((feature) => (
                                            <div key={feature} className="flex items-center gap-2 text-sm text-gray-700">
                                                <div className={cn(
                                                    "w-1.5 h-1.5 rounded-full",
                                                    isSelected ? "bg-purple-500" : "bg-gray-400"
                                                )} />
                                                {feature}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Prix */}
                                    <div className={cn(
                                        "inline-block px-3 py-1 rounded-full text-sm font-bold",
                                        isSelected
                                            ? `bg-gradient-to-r ${mode.color} text-white`
                                            : "bg-gray-100 text-gray-700"
                                    )}>
                                        {mode.price}
                                    </div>
                                </div>
                            </div>
                        </motion.button>
                    );
                })}
            </div>

            {/* Info famille si sélectionné */}
            {selectedMode === 'family' && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-6 p-5 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border-2 border-purple-100"
                >
                    <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                        <Users size={18} className="text-purple-600" />
                        Vous allez créer votre famille
                    </h4>
                    <p className="text-sm text-gray-600 mb-3">
                        À l'étape suivante, vous pourrez ajouter les membres de votre famille et définir leurs profils nutritionnels.
                    </p>
                    <div className="flex items-center gap-2 text-sm text-purple-700">
                        <Check size={16} strokeWidth={3} />
                        <span>Chaque membre aura son propre plan adapté</span>
                    </div>
                </motion.div>
            )}

            {/* Bouton suivant si famille sélectionnée */}
            {selectedMode === 'family' && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6"
                >
                    <button
                        onClick={nextStep}
                        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                    >
                        Créer ma famille
                        <ArrowRight size={20} />
                    </button>
                </motion.div>
            )}

            {/* Footer info */}
            <p className="text-xs text-gray-400 text-center mt-6">
                Vous pourrez changer de mode à tout moment depuis les paramètres
            </p>
        </OnboardingLayout>
    );
}


