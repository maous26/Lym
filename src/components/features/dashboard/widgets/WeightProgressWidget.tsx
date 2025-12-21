'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { TrendingDown, TrendingUp, Minus, Plus, Scale } from 'lucide-react';

interface WeightProgressWidgetProps {
  currentWeight: number;
  targetWeight?: number;
  startWeight: number;
  lastWeightDate?: string;
  trend: 'up' | 'down' | 'stable';
  trendValue: number; // kg change from last week
  onAddWeight: () => void;
  onViewHistory: () => void;
  className?: string;
}

export function WeightProgressWidget({
  currentWeight,
  targetWeight,
  startWeight,
  lastWeightDate,
  trend,
  trendValue,
  onAddWeight,
  onViewHistory,
  className,
}: WeightProgressWidgetProps) {
  // Calculer la progression vers l'objectif
  const hasTarget = targetWeight !== undefined;
  const totalToLose = startWeight - (targetWeight || startWeight);
  const lost = startWeight - currentWeight;
  const progressPercentage = hasTarget && totalToLose > 0
    ? Math.min(Math.max((lost / totalToLose) * 100, 0), 100)
    : 0;

  const trendConfig = {
    down: {
      icon: TrendingDown,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-50',
      label: 'En baisse',
    },
    up: {
      icon: TrendingUp,
      color: 'text-amber-500',
      bgColor: 'bg-amber-50',
      label: 'En hausse',
    },
    stable: {
      icon: Minus,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      label: 'Stable',
    },
  };

  const TrendIcon = trendConfig[trend].icon;

  // Empty State - Encourage first entry
  if (!currentWeight || currentWeight === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn('bg-white rounded-3xl p-5 shadow-card', className)}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
            <Scale className="w-5 h-5 text-purple-500" />
          </div>
          <h3 className="font-semibold text-stone-800">Poids</h3>
        </div>

        <div className="text-center py-4">
          <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-3">
            <Scale className="w-8 h-8 text-purple-400 opacity-60" />
          </div>
          <p className="text-stone-600 font-medium mb-1">Premier pas</p>
          <p className="text-xs text-stone-400 mb-4">
            Enregistre ton poids de départ pour suivre ta progression.
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onAddWeight}
            className="w-full py-2.5 bg-purple-500 text-white rounded-xl font-medium shadow-md shadow-purple-200 hover:bg-purple-600 transition-colors"
          >
            Ajouter mon poids
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('bg-white rounded-3xl p-5 shadow-card', className)}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
            <Scale className="w-5 h-5 text-purple-500" />
          </div>
          <div>
            <h3 className="font-semibold text-stone-800">Poids</h3>
            {lastWeightDate && (
              <p className="text-xs text-stone-400">
                Dernière pesée: {lastWeightDate}
              </p>
            )}
          </div>
        </div>

        {/* Add button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onAddWeight}
          className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600 hover:bg-primary-100 transition-colors"
        >
          <Plus className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Current Weight */}
      <div className="flex items-end gap-3 mb-4">
        <motion.span
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-4xl font-bold text-stone-800"
        >
          {currentWeight.toFixed(1)}
        </motion.span>
        <span className="text-lg text-stone-400 mb-1">kg</span>

        {/* Trend badge */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className={cn(
            'ml-auto flex items-center gap-1 px-2 py-1 rounded-lg',
            trendConfig[trend].bgColor
          )}
        >
          <TrendIcon className={cn('w-4 h-4', trendConfig[trend].color)} />
          <span className={cn('text-sm font-medium', trendConfig[trend].color)}>
            {trendValue > 0 ? '+' : ''}{trendValue.toFixed(1)} kg
          </span>
        </motion.div>
      </div>

      {/* Progress to target */}
      {hasTarget && (
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-stone-500">Progression</span>
            <span className="font-medium text-stone-700">
              {progressPercentage.toFixed(0)}% vers {targetWeight} kg
            </span>
          </div>
          <div className="h-2.5 bg-stone-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.8, delay: 0.3 }}
            />
          </div>
          <div className="flex justify-between text-xs text-stone-400 mt-1">
            <span>{startWeight} kg</span>
            <span>{targetWeight} kg</span>
          </div>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 pt-4 border-t border-stone-100">
        <div className="text-center">
          <p className="text-xs text-stone-400 mb-1">Départ</p>
          <p className="font-semibold text-stone-700">{startWeight} kg</p>
        </div>
        <div className="text-center border-x border-stone-100">
          <p className="text-xs text-stone-400 mb-1">Perdu</p>
          <p
            className={cn(
              'font-semibold',
              lost > 0 ? 'text-emerald-600' : lost < 0 ? 'text-amber-600' : 'text-stone-700'
            )}
          >
            {lost > 0 ? '-' : lost < 0 ? '+' : ''}{Math.abs(lost).toFixed(1)} kg
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-stone-400 mb-1">Objectif</p>
          <p className="font-semibold text-stone-700">
            {hasTarget ? `${targetWeight} kg` : '—'}
          </p>
        </div>
      </div>

      {/* View history link */}
      <button
        onClick={onViewHistory}
        className="w-full mt-4 py-2.5 text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-xl transition-colors"
      >
        Voir l'historique complet
      </button>
    </motion.div>
  );
}

export default WeightProgressWidget;
