'use client';

import { motion } from 'framer-motion';
import { ChefHat, Clock, Timer, Utensils } from 'lucide-react';
import { Button, Card } from '@/core/components/ui';
import { useOnboardingStore, type CookingSkill, type CookingTime } from '../store';
import { cn } from '@/core/lib/cn';

const skillOptions: {
  value: CookingSkill;
  label: string;
  description: string;
  icon: typeof ChefHat;
}[] = [
  {
    value: 'BEGINNER',
    label: 'Débutant',
    description: 'Recettes simples et basiques',
    icon: Utensils,
  },
  {
    value: 'INTERMEDIATE',
    label: 'Intermédiaire',
    description: 'Je me débrouille en cuisine',
    icon: ChefHat,
  },
  {
    value: 'ADVANCED',
    label: 'Avancé',
    description: 'J\'aime les défis culinaires',
    icon: ChefHat,
  },
];

const timeOptions: {
  value: CookingTime;
  label: string;
  description: string;
  duration: string;
}[] = [
  {
    value: 'QUICK',
    label: 'Express',
    description: 'Repas rapides',
    duration: '< 20 min',
  },
  {
    value: 'MEDIUM',
    label: 'Modéré',
    description: 'Temps raisonnable',
    duration: '20-45 min',
  },
  {
    value: 'ELABORATE',
    label: 'Élaboré',
    description: 'Je prends mon temps',
    duration: '> 45 min',
  },
];

export function StepCooking() {
  const { profile, updateProfile, nextStep, prevStep } = useOnboardingStore();

  const canContinue = !!profile.cookingSkill && !!profile.cookingTime;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6 px-4"
    >
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          En cuisine
        </h2>
        <p className="text-gray-600">
          Pour des recettes adaptées à votre niveau et votre temps
        </p>
      </div>

      {/* Skill Level */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Votre niveau en cuisine
        </label>
        <div className="space-y-2">
          {skillOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = profile.cookingSkill === option.value;

            return (
              <Card
                key={option.value}
                variant={isSelected ? 'elevated' : 'outlined'}
                padding="sm"
                className={cn(
                  'cursor-pointer transition-all',
                  isSelected
                    ? 'ring-2 ring-emerald-500 border-transparent'
                    : 'hover:border-gray-300'
                )}
                onClick={() => updateProfile({ cookingSkill: option.value })}
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
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-sm">
                      {option.label}
                    </h3>
                    <p className="text-xs text-gray-500">{option.description}</p>
                  </div>
                  <div
                    className={cn(
                      'w-5 h-5 rounded-full border-2 flex items-center justify-center',
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
            );
          })}
        </div>
      </div>

      {/* Time Available */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Temps disponible pour cuisiner
        </label>
        <div className="grid grid-cols-3 gap-2">
          {timeOptions.map((option) => {
            const isSelected = profile.cookingTime === option.value;

            return (
              <Card
                key={option.value}
                variant={isSelected ? 'elevated' : 'outlined'}
                padding="sm"
                className={cn(
                  'cursor-pointer transition-all text-center',
                  isSelected
                    ? 'ring-2 ring-emerald-500 border-transparent'
                    : 'hover:border-gray-300'
                )}
                onClick={() => updateProfile({ cookingTime: option.value })}
              >
                <Clock
                  className={cn(
                    'w-6 h-6 mx-auto mb-1',
                    isSelected ? 'text-emerald-500' : 'text-gray-400'
                  )}
                />
                <p className="text-sm font-medium text-gray-700">
                  {option.label}
                </p>
                <p className="text-xs text-gray-500">{option.duration}</p>
              </Card>
            );
          })}
        </div>
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
