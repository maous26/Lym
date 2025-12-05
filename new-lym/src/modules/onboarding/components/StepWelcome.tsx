'use client';

import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/core/components/ui';
import { useOnboardingStore } from '../store';

export function StepWelcome() {
  const { nextStep } = useOnboardingStore();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6"
    >
      {/* Icon */}
      <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mb-8 shadow-lg">
        <Sparkles className="w-10 h-10 text-white" />
      </div>

      {/* Title */}
      <h1 className="text-3xl font-bold text-gray-900 mb-4">
        Bienvenue sur LYM
      </h1>

      {/* Description */}
      <p className="text-gray-600 text-lg mb-8 max-w-sm leading-relaxed">
        Quelques questions pour personnaliser votre expérience et atteindre vos objectifs santé.
      </p>

      {/* Time estimate */}
      <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-sm font-medium mb-8">
        Environ 2 minutes
      </div>

      {/* CTA */}
      <Button
        onClick={nextStep}
        size="lg"
        rightIcon={<ArrowRight className="w-5 h-5" />}
      >
        Commencer
      </Button>
    </motion.div>
  );
}
