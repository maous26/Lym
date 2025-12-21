'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { StepCard } from '../OnboardingLayout';
import { ArrowRight } from 'lucide-react';
import type { ActivityLevel } from '@/types/user';

interface StepActivityProps {
  data: {
    activityLevel?: ActivityLevel;
    sportsFrequency?: number;
  };
  onUpdate: (data: Partial<StepActivityProps['data']>) => void;
  onNext: () => void;
}

const activityOptions: {
  value: ActivityLevel;
  icon: string;
  title: string;
  description: string;
}[] = [
  {
    value: 'sedentary',
    icon: '🪑',
    title: 'Sédentaire',
    description: 'Travail de bureau, peu de mouvements',
  },
  {
    value: 'light',
    icon: '🚶',
    title: 'Légèrement actif',
    description: 'Marche légère, debout parfois',
  },
  {
    value: 'moderate',
    icon: '🚴',
    title: 'Modérément actif',
    description: 'Activité physique régulière',
  },
  {
    value: 'active',
    icon: '🏃',
    title: 'Très actif',
    description: 'Travail physique ou sport quotidien',
  },
  {
    value: 'athlete',
    icon: '🏋️',
    title: 'Athlète',
    description: 'Entraînement intensif, compétition',
  },
];

const sportsOptions = [
  { value: 0, label: 'Jamais', icon: '😴' },
  { value: 1, label: '1x/sem', icon: '💪' },
  { value: 2, label: '2-3x/sem', icon: '🔥' },
  { value: 4, label: '4-5x/sem', icon: '⚡' },
  { value: 6, label: '6+/sem', icon: '🏆' },
];

export function StepActivity({ data, onUpdate, onNext }: StepActivityProps) {
  const canContinue = data.activityLevel !== undefined;

  return (
    <div className="flex-1 flex flex-col">
      {/* Activity Level */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-3"
      >
        <h2 className="text-lg font-semibold text-stone-800 mb-4">
          Ton niveau d'activité quotidienne
        </h2>
        {activityOptions.map((option, index) => (
          <motion.div
            key={option.value}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <StepCard
              icon={option.icon}
              title={option.title}
              description={option.description}
              isSelected={data.activityLevel === option.value}
              onClick={() => onUpdate({ activityLevel: option.value })}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Sports Frequency */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-8"
      >
        <h2 className="text-lg font-semibold text-stone-800 mb-4">
          Fréquence de sport
        </h2>
        <div className="flex flex-wrap gap-2">
          {sportsOptions.map((option) => (
            <motion.button
              key={option.value}
              onClick={() => onUpdate({ sportsFrequency: option.value })}
              className={`px-4 py-3 rounded-2xl font-medium text-sm transition-all duration-200 ${
                data.sportsFrequency === option.value
                  ? 'bg-primary-500 text-white shadow-btn-emerald'
                  : 'bg-white/70 text-stone-600 hover:bg-white'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="mr-1">{option.icon}</span>
              {option.label}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-auto pt-8"
      >
        <Button
          onClick={onNext}
          size="lg"
          fullWidth
          disabled={!canContinue}
          rightIcon={<ArrowRight className="w-5 h-5" />}
        >
          Continuer
        </Button>
      </motion.div>
    </div>
  );
}

export default StepActivity;
