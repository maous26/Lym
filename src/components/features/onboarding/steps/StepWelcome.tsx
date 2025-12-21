'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { ArrowRight } from 'lucide-react';

interface StepWelcomeProps {
  firstName?: string;
  onNext: () => void;
}

export function StepWelcome({ firstName, onNext }: StepWelcomeProps) {
  return (
    <div className="flex-1 flex flex-col">
      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
        {/* Animated Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
          className="w-32 h-32 rounded-[40px] bg-gradient-to-br from-primary-100 to-primary-50 flex items-center justify-center mb-8 shadow-xl"
        >
          <span className="text-7xl">🌱</span>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-3xl font-bold text-stone-800 mb-4"
        >
          {firstName ? `Bienvenue, ${firstName} !` : 'Bienvenue sur LYM !'}
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-lg text-stone-500 max-w-xs leading-relaxed"
        >
          Prenons quelques minutes pour personnaliser ton expérience nutritionnelle.
        </motion.p>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-10 space-y-4 text-left"
        >
          {[
            { icon: '🎯', text: 'Objectifs personnalisés' },
            { icon: '🍽️', text: 'Repas adaptés à tes goûts' },
            { icon: '💚', text: 'Coach IA bienveillant' },
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + index * 0.1 }}
              className="flex items-center gap-3"
            >
              <span className="text-2xl">{item.icon}</span>
              <span className="text-stone-600 font-medium">{item.text}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* CTA Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="mt-8"
      >
        <Button
          onClick={onNext}
          size="lg"
          fullWidth
          rightIcon={<ArrowRight className="w-5 h-5" />}
        >
          C'est parti !
        </Button>

        <p className="text-center text-sm text-stone-400 mt-4">
          ⏱️ Environ 3 minutes
        </p>
      </motion.div>
    </div>
  );
}

export default StepWelcome;
