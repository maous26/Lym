"use client";

import { useSoloOnboardingStore } from '@/store/solo-onboarding-store';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export const StepWelcome = () => {
    const { nextStep } = useSoloOnboardingStore();

    return (
        <div className="flex flex-col h-full justify-center items-center text-center">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="mb-8 relative"
            >
                <div className="w-32 h-32 bg-gradient-to-tr from-primary-400 to-secondary-400 rounded-full blur-2xl absolute top-0 left-0 opacity-50 animate-pulse" />
                <div className="w-32 h-32 glass rounded-3xl flex items-center justify-center relative z-10 text-4xl">
                    🥗
                </div>
            </motion.div>

            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600 mb-4">
                Bienvenue sur Vitality
            </h1>

            <p className="text-gray-600 mb-12 text-lg leading-relaxed">
                Votre compagnon nutritionnel intelligent pour une vie plus saine et équilibrée.
            </p>

            <button
                onClick={nextStep}
                className="group relative w-full max-w-xs bg-gray-900 text-white py-4 rounded-2xl font-semibold shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-3"
            >
                Commencer l'aventure
                <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
        </div>
    );
};
