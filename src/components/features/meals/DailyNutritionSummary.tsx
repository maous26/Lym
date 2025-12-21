'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Flame, Beef, Wheat, Droplet } from 'lucide-react';

interface NutritionData {
  consumed: number;
  target: number;
  percentage: number;
}

interface DailyNutritionSummaryProps {
  calories: NutritionData;
  proteins: NutritionData;
  carbs: NutritionData;
  fats: NutritionData;
  className?: string;
  compact?: boolean;
}

// Circular progress component
const CircularProgress = ({
  percentage,
  size = 120,
  strokeWidth = 8,
  children,
}: {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  children?: React.ReactNode;
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (Math.min(percentage, 100) / 100) * circumference;

  // Color based on percentage
  const getColor = () => {
    if (percentage >= 100) return 'stroke-amber-500';
    if (percentage >= 80) return 'stroke-primary-500';
    if (percentage >= 50) return 'stroke-primary-400';
    return 'stroke-primary-300';
  };

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-stone-100"
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          className={getColor()}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{
            strokeDasharray: circumference,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  );
};

// Macro progress bar
const MacroBar = ({
  icon: Icon,
  label,
  consumed,
  target,
  percentage,
  color,
  unit = 'g',
}: {
  icon: React.ElementType;
  label: string;
  consumed: number;
  target: number;
  percentage: number;
  color: string;
  unit?: string;
}) => {
  const cappedPercentage = Math.min(percentage, 100);

  return (
    <div className="flex items-center gap-3">
      <div
        className={cn(
          'w-9 h-9 rounded-xl flex items-center justify-center',
          color
        )}
      >
        <Icon className="w-4 h-4 text-white" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline mb-1">
          <span className="text-sm font-medium text-stone-700">{label}</span>
          <span className="text-xs text-stone-500">
            {Math.round(consumed)}/{target}{unit}
          </span>
        </div>

        <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
          <motion.div
            className={cn('h-full rounded-full', color)}
            initial={{ width: 0 }}
            animate={{ width: `${cappedPercentage}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>
    </div>
  );
};

export function DailyNutritionSummary({
  calories,
  proteins,
  carbs,
  fats,
  className,
  compact = false,
}: DailyNutritionSummaryProps) {
  const remaining = calories.target - calories.consumed;
  const isOverGoal = remaining < 0;

  if (compact) {
    return (
      <div className={cn('bg-white rounded-2xl p-4 shadow-sm', className)}>
        <div className="flex items-center gap-4">
          {/* Compact calories circle */}
          <CircularProgress percentage={calories.percentage} size={64} strokeWidth={6}>
            <Flame className="w-5 h-5 text-amber-500" />
          </CircularProgress>

          {/* Compact macros */}
          <div className="flex-1 grid grid-cols-3 gap-3">
            <div className="text-center">
              <div className="text-lg font-semibold text-stone-800">
                {Math.round(proteins.consumed)}g
              </div>
              <div className="text-xs text-stone-500">Protéines</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-stone-800">
                {Math.round(carbs.consumed)}g
              </div>
              <div className="text-xs text-stone-500">Glucides</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-stone-800">
                {Math.round(fats.consumed)}g
              </div>
              <div className="text-xs text-stone-500">Lipides</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('bg-white rounded-3xl p-5 shadow-card', className)}>
      {/* Header with calories circle */}
      <div className="flex items-center gap-6 mb-6">
        <CircularProgress percentage={calories.percentage}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-1 mb-1">
              <Flame className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-bold text-stone-800">
              {Math.round(calories.consumed)}
            </div>
            <div className="text-xs text-stone-500">
              / {calories.target} kcal
            </div>
          </motion.div>
        </CircularProgress>

        <div className="flex-1">
          <div className="mb-2">
            <span className="text-lg font-semibold text-stone-800">
              {isOverGoal ? 'Dépassement' : 'Restant'}
            </span>
          </div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={cn(
              'text-3xl font-bold',
              isOverGoal ? 'text-amber-500' : 'text-primary-600'
            )}
          >
            {isOverGoal ? '+' : ''}{Math.abs(Math.round(remaining))}
            <span className="text-lg font-normal text-stone-500 ml-1">kcal</span>
          </motion.div>
          <div className="text-sm text-stone-500 mt-1">
            {calories.percentage}% de l'objectif
          </div>
        </div>
      </div>

      {/* Macros grid */}
      <div className="space-y-3">
        <MacroBar
          icon={Beef}
          label="Protéines"
          consumed={proteins.consumed}
          target={proteins.target}
          percentage={proteins.percentage}
          color="bg-rose-500"
        />
        <MacroBar
          icon={Wheat}
          label="Glucides"
          consumed={carbs.consumed}
          target={carbs.target}
          percentage={carbs.percentage}
          color="bg-amber-500"
        />
        <MacroBar
          icon={Droplet}
          label="Lipides"
          consumed={fats.consumed}
          target={fats.target}
          percentage={fats.percentage}
          color="bg-blue-500"
        />
      </div>
    </div>
  );
}

export default DailyNutritionSummary;
