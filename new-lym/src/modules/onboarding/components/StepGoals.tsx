'use client';

import { motion } from 'framer-motion';
import { TrendingDown, TrendingUp, Scale } from 'lucide-react';
import { Button, Card } from '@/core/components/ui';
import { useOnboardingStore, type NutritionGoal } from '../store';
import { cn } from '@/core/lib/cn';

const goalOptions: {
  value: NutritionGoal;
  label: string;
  description: string;
  icon: typeof TrendingDown;
  color: string;
}[] = [
  {
    value: 'LOSE_WEIGHT',
    label: 'Perdre du poids',
    description: 'Déficit calorique pour une perte de poids progressive',
    icon: TrendingDown,
    color: 'text-orange-500 bg-orange-100',
  },
  {
    value: 'MAINTAIN',
    label: 'Maintenir mon poids',
    description: 'Équilibre pour rester en forme et en bonne santé',
    icon: Scale,
    color: 'text-emerald-500 bg-emerald-100',
  },
  {
    value: 'GAIN_MUSCLE',
    label: 'Prendre du muscle',
    description: 'Surplus calorique avec un apport protéiné adapté',
    icon: TrendingUp,
    color: 'text-blue-500 bg-blue-100',
  },
];

export function StepGoals() {
  const { profile, updateProfile, nextStep, prevStep } = useOnboardingStore();

  const handleSelect = (goal: NutritionGoal) => {
    updateProfile({ goal });
  };

  const canContinue = !!profile.goal;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6 px-4"
    >
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Quel est votre objectif ?
        </h2>
        <p className="text-gray-600">
          Nous adapterons vos recommandations en conséquence
        </p>
      </div>

      {/* Goal Options */}
      <div className="space-y-4">
        {goalOptions.map((option, index) => {
          const Icon = option.icon;
          const isSelected = profile.goal === option.value;

          return (
            <motion.div
              key={option.value}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                variant={isSelected ? 'elevated' : 'outlined'}
                padding="md"
                className={cn(
                  'cursor-pointer transition-all',
                  isSelected
                    ? 'ring-2 ring-emerald-500 border-transparent'
                    : 'hover:border-gray-300'
                )}
                onClick={() => handleSelect(option.value)}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      'w-12 h-12 rounded-xl flex items-center justify-center',
                      option.color
                    )}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {option.label}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {option.description}
                    </p>
                  </div>
                  <div
                    className={cn(
                      'w-6 h-6 rounded-full border-2 flex items-center justify-center',
                      isSelected
                        ? 'bg-emerald-500 border-emerald-500'
                        : 'border-gray-300'
                    )}
                  >
                    {isSelected && (
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Navigation */}
      <div className="flex gap-3 pt-4">
        <Button variant="ghost" onClick={prevStep} className="flex-1">
          Retour
        </Button>
        <Button onClick={nextStep} disabled={!canContinue} className="flex-1">
          Continuer
        </Button>
      </div>
    </motion.div>
  );
}
