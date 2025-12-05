'use client';

import { motion } from 'framer-motion';
import { Sofa, Walk, Bike, Dumbbell, Flame } from 'lucide-react';
import { Button, Card } from '@/core/components/ui';
import { useOnboardingStore, type ActivityLevel } from '../store';
import { cn } from '@/core/lib/cn';

const activityOptions: {
  value: ActivityLevel;
  label: string;
  description: string;
  icon: typeof Sofa;
  multiplier: string;
}[] = [
  {
    value: 'SEDENTARY',
    label: 'Sédentaire',
    description: 'Travail de bureau, peu ou pas d\'exercice',
    icon: Sofa,
    multiplier: 'x1.2',
  },
  {
    value: 'LIGHT',
    label: 'Légèrement actif',
    description: 'Exercice léger 1-3 jours/semaine',
    icon: Walk,
    multiplier: 'x1.375',
  },
  {
    value: 'MODERATE',
    label: 'Modérément actif',
    description: 'Exercice modéré 3-5 jours/semaine',
    icon: Bike,
    multiplier: 'x1.55',
  },
  {
    value: 'ACTIVE',
    label: 'Très actif',
    description: 'Exercice intense 6-7 jours/semaine',
    icon: Dumbbell,
    multiplier: 'x1.725',
  },
  {
    value: 'VERY_ACTIVE',
    label: 'Extrêmement actif',
    description: 'Exercice très intense + travail physique',
    icon: Flame,
    multiplier: 'x1.9',
  },
];

export function StepActivity() {
  const { profile, updateProfile, nextStep, prevStep } = useOnboardingStore();

  const handleSelect = (level: ActivityLevel) => {
    updateProfile({ activityLevel: level });
  };

  const canContinue = !!profile.activityLevel;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6 px-4"
    >
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Votre niveau d&apos;activité
        </h2>
        <p className="text-gray-600">
          Cela nous aide à calculer vos besoins caloriques quotidiens
        </p>
      </div>

      {/* Activity Options */}
      <div className="space-y-3">
        {activityOptions.map((option, index) => {
          const Icon = option.icon;
          const isSelected = profile.activityLevel === option.value;

          return (
            <motion.div
              key={option.value}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card
                variant={isSelected ? 'elevated' : 'outlined'}
                padding="sm"
                className={cn(
                  'cursor-pointer transition-all',
                  isSelected
                    ? 'ring-2 ring-emerald-500 border-transparent'
                    : 'hover:border-gray-300'
                )}
                onClick={() => handleSelect(option.value)}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center',
                      isSelected
                        ? 'bg-emerald-100 text-emerald-600'
                        : 'bg-gray-100 text-gray-500'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900 text-sm">
                        {option.label}
                      </h3>
                      <span className="text-xs text-gray-400">
                        {option.multiplier}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 truncate">
                      {option.description}
                    </p>
                  </div>
                  <div
                    className={cn(
                      'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0',
                      isSelected
                        ? 'bg-emerald-500 border-emerald-500'
                        : 'border-gray-300'
                    )}
                  >
                    {isSelected && (
                      <svg
                        className="w-3 h-3 text-white"
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
