'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface MacroData {
  current: number;
  target: number;
}

interface NutritionRingWidgetProps {
  currentCalories: number;
  targetCalories: number;
  proteins: MacroData;
  carbs: MacroData;
  fats: MacroData;
  onViewDetails?: () => void;
  className?: string;
}

// Anneau de progression animé
function ProgressRing({
  value,
  max,
  size = 120,
  strokeWidth = 10,
  color,
  delay = 0,
}: {
  value: number;
  max: number;
  size?: number;
  strokeWidth?: number;
  color: string;
  delay?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const percentage = Math.min((value / max) * 100, 100);
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      {/* Background circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        className="text-stone-100"
      />
      {/* Progress circle */}
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1, delay, ease: 'easeOut' }}
        style={{ strokeDasharray: circumference }}
      />
    </svg>
  );
}

// Petit indicateur de macro
function MacroIndicator({
  label,
  current,
  target,
  unit,
  color,
  bgColor,
  delay,
}: {
  label: string;
  current: number;
  target: number;
  unit: string;
  color: string;
  bgColor: string;
  delay: number;
}) {
  const percentage = Math.min(Math.round((current / target) * 100), 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="flex flex-col items-center"
    >
      <div
        className={cn(
          'w-12 h-12 rounded-xl flex items-center justify-center mb-2',
          bgColor
        )}
      >
        <span className={cn('text-sm font-bold', color)}>{percentage}%</span>
      </div>
      <span className="text-xs font-medium text-stone-600">{label}</span>
      <span className="text-[10px] text-stone-400">
        {current}/{target}{unit}
      </span>
    </motion.div>
  );
}

export function NutritionRingWidget({
  currentCalories,
  targetCalories,
  proteins,
  carbs,
  fats,
  onViewDetails,
  className,
}: NutritionRingWidgetProps) {
  const caloriePercentage = Math.min(
    Math.round((currentCalories / targetCalories) * 100),
    100
  );
  const remaining = Math.max(targetCalories - currentCalories, 0);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        'bg-white rounded-3xl p-6 shadow-card',
        className
      )}
    >
      <div className="flex items-center justify-between gap-6">
        {/* Ring principal - Calories */}
        <div className="relative flex items-center justify-center">
          <ProgressRing
            value={currentCalories}
            max={targetCalories}
            size={130}
            strokeWidth={12}
            color="#10b981"
          />
          {/* Centre du ring */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-2xl font-bold text-stone-800"
            >
              {currentCalories}
            </motion.span>
            <span className="text-xs text-stone-400">kcal</span>
          </div>
        </div>

        {/* Détails */}
        <div className="flex-1">
          {/* Résumé calories */}
          <div className="mb-4">
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold text-stone-800">
                {remaining}
              </span>
              <span className="text-sm text-stone-500">kcal restantes</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary-400 to-primary-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${caloriePercentage}%` }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                />
              </div>
              <span className="text-xs font-medium text-stone-500">
                {caloriePercentage}%
              </span>
            </div>
          </div>

          {/* Macros */}
          <div className="flex justify-between">
            <MacroIndicator
              label="Protéines"
              current={proteins.current}
              target={proteins.target}
              unit="g"
              color="text-blue-600"
              bgColor="bg-blue-50"
              delay={0.4}
            />
            <MacroIndicator
              label="Glucides"
              current={carbs.current}
              target={carbs.target}
              unit="g"
              color="text-amber-600"
              bgColor="bg-amber-50"
              delay={0.5}
            />
            <MacroIndicator
              label="Lipides"
              current={fats.current}
              target={fats.target}
              unit="g"
              color="text-purple-600"
              bgColor="bg-purple-50"
              delay={0.6}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default NutritionRingWidget;
