"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { useOnboardingStore } from '@/store/onboarding-store';
import { ChevronLeft } from 'lucide-react';

interface OnboardingLayoutProps {
    children: React.ReactNode;
    title: string;
    subtitle?: string;
    showBack?: boolean;
}

export const OnboardingLayout = ({ children, title, subtitle, showBack = true }: OnboardingLayoutProps) => {
    const { currentStep, totalSteps, prevStep } = useOnboardingStore();
    const progress = ((currentStep) / totalSteps) * 100;

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex flex-col">
            {/* Progress Bar */}
            <div className="fixed top-0 left-0 w-full h-1 bg-gray-100 z-50">
                <motion.div
                    className="h-full bg-gradient-to-r from-primary-500 to-secondary-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5 }}
                />
            </div>

            <div className="flex-1 flex flex-col max-w-md mx-auto w-full p-6 pt-12">
                {/* Header */}
                <div className="mb-8 relative">
                    {showBack && currentStep > 0 && (
                        <button
                            onClick={prevStep}
                            className="absolute -top-8 left-0 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <ChevronLeft size={24} />
                        </button>
                    )}

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={title}
                    >
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
                        {subtitle && <p className="text-gray-500">{subtitle}</p>}
                    </motion.div>
                </div>

                {/* Content Area */}
                <div className="flex-1 relative">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="h-full flex flex-col"
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};
