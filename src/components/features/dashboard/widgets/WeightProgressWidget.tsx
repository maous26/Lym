'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { TrendingDown, TrendingUp, Minus, Plus, Scale, ChevronRight, Target } from 'lucide-react';

// Weight entry type
interface WeightEntry {
  date: string;
  weight: number;
}

interface WeightProgressWidgetProps {
  currentWeight: number;
  targetWeight?: number;
  startWeight: number;
  lastWeightDate?: string;
  trend: 'up' | 'down' | 'stable';
  trendValue: number;
  weightHistory?: WeightEntry[];
  onAddWeight: () => void;
  onViewHistory: () => void;
  className?: string;
}

type TimeFilter = '7d' | '30d' | '90d';

// Mini chart component
function WeightChart({
  data,
  targetWeight,
  className,
}: {
  data: WeightEntry[];
  targetWeight?: number;
  className?: string;
}) {
  if (data.length === 0) {
    return (
      <div className={cn('h-32 flex items-center justify-center bg-stone-50 rounded-xl', className)}>
        <p className="text-sm text-stone-400">Pas assez de données</p>
      </div>
    );
  }

  const weights = data.map((d) => d.weight);
  const minWeight = Math.min(...weights, targetWeight || Infinity) - 1;
  const maxWeight = Math.max(...weights) + 1;
  const range = maxWeight - minWeight;

  const getY = (weight: number) => {
    return 100 - ((weight - minWeight) / range) * 100;
  };

  // Create SVG path
  const points = data.map((entry, i) => {
    const x = (i / Math.max(data.length - 1, 1)) * 100;
    const y = getY(entry.weight);
    return { x, y, weight: entry.weight, date: entry.date };
  });

  const pathD = points
    .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
    .join(' ');

  // Area fill path
  const areaD = `${pathD} L 100 100 L 0 100 Z`;

  return (
    <div className={cn('relative h-32', className)}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
        {/* Gradient definition */}
        <defs>
          <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgb(168, 85, 247)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="rgb(168, 85, 247)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Target line */}
        {targetWeight && (
          <line
            x1="0"
            y1={getY(targetWeight)}
            x2="100"
            y2={getY(targetWeight)}
            stroke="rgb(34, 197, 94)"
            strokeWidth="0.5"
            strokeDasharray="2,2"
          />
        )}

        {/* Area fill */}
        <path d={areaD} fill="url(#weightGradient)" />

        {/* Line */}
        <path
          d={pathD}
          fill="none"
          stroke="rgb(168, 85, 247)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Points */}
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="1.5"
            fill="white"
            stroke="rgb(168, 85, 247)"
            strokeWidth="1"
          />
        ))}
      </svg>

      {/* Y-axis labels */}
      <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-[10px] text-stone-400 -ml-1">
        <span>{maxWeight.toFixed(0)}</span>
        <span>{minWeight.toFixed(0)}</span>
      </div>

      {/* Target label */}
      {targetWeight && (
        <div
          className="absolute right-0 text-[10px] text-green-500 font-medium flex items-center gap-0.5"
          style={{ top: `${getY(targetWeight)}%`, transform: 'translateY(-50%)' }}
        >
          <Target className="w-2.5 h-2.5" />
          {targetWeight}
        </div>
      )}
    </div>
  );
}

export function WeightProgressWidget({
  currentWeight,
  targetWeight,
  startWeight,
  lastWeightDate,
  trend,
  trendValue,
  weightHistory = [],
  onAddWeight,
  onViewHistory,
  className,
}: WeightProgressWidgetProps) {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('30d');

  // Filter history based on time
  const filteredHistory = useMemo(() => {
    const now = new Date();
    const days = timeFilter === '7d' ? 7 : timeFilter === '30d' ? 30 : 90;
    const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    // If no history, generate sample data for demo
    if (weightHistory.length === 0 && currentWeight > 0) {
      const sampleData: WeightEntry[] = [];
      for (let i = days; i >= 0; i -= Math.ceil(days / 7)) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const variance = (Math.random() - 0.5) * 2;
        const weight = currentWeight + (i / days) * (startWeight - currentWeight) * 0.5 + variance;
        sampleData.push({
          date: date.toISOString().split('T')[0],
          weight: Math.round(weight * 10) / 10,
        });
      }
      // Add current weight as last entry
      sampleData.push({
        date: now.toISOString().split('T')[0],
        weight: currentWeight,
      });
      return sampleData;
    }

    return weightHistory
      .filter((entry) => new Date(entry.date) >= cutoff)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [weightHistory, timeFilter, currentWeight, startWeight]);

  // Progress calculation
  const hasTarget = targetWeight !== undefined && targetWeight > 0;
  const totalToLose = startWeight - (targetWeight || startWeight);
  const lost = startWeight - currentWeight;
  const progressPercentage =
    hasTarget && totalToLose !== 0
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

  const timeFilters: { label: string; value: TimeFilter }[] = [
    { label: '7j', value: '7d' },
    { label: '30j', value: '30d' },
    { label: '3m', value: '90d' },
  ];

  // Empty State
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
          <h3 className="font-semibold text-stone-800">Suivi du poids</h3>
        </div>

        <div className="text-center py-6">
          <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-3">
            <Scale className="w-8 h-8 text-purple-400 opacity-60" />
          </div>
          <p className="text-stone-600 font-medium mb-1">Commence ton suivi</p>
          <p className="text-xs text-stone-400 mb-4 max-w-[200px] mx-auto">
            Enregistre ton poids régulièrement pour suivre ta progression avec des graphiques détaillés.
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onAddWeight}
            className="px-6 py-2.5 bg-purple-500 text-white rounded-xl font-medium shadow-md shadow-purple-200 hover:bg-purple-600 transition-colors"
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
            <h3 className="font-semibold text-stone-800">Suivi du poids</h3>
            {lastWeightDate && (
              <p className="text-xs text-stone-400">Dernière pesée: {lastWeightDate}</p>
            )}
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onAddWeight}
          className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 hover:bg-purple-200 transition-colors"
        >
          <Plus className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Current Weight + Trend */}
      <div className="flex items-baseline gap-2 mb-2">
        <motion.span
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-4xl font-bold text-stone-800"
        >
          {currentWeight.toFixed(1)}
        </motion.span>
        <span className="text-lg text-stone-400">kg</span>

        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className={cn(
            'ml-auto flex items-center gap-1 px-2.5 py-1 rounded-lg',
            trendConfig[trend].bgColor
          )}
        >
          <TrendIcon className={cn('w-4 h-4', trendConfig[trend].color)} />
          <span className={cn('text-sm font-medium', trendConfig[trend].color)}>
            {trendValue > 0 ? '+' : ''}
            {trendValue.toFixed(1)} kg
          </span>
        </motion.div>
      </div>

      {/* Target progress */}
      {hasTarget && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-stone-400">Objectif: {targetWeight} kg</span>
            <span className="font-medium text-purple-600">{progressPercentage.toFixed(0)}%</span>
          </div>
          <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-400 to-purple-600 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.8, delay: 0.3 }}
            />
          </div>
        </div>
      )}

      {/* Time filter tabs */}
      <div className="flex gap-1 p-1 bg-stone-100 rounded-xl mb-3">
        {timeFilters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => setTimeFilter(filter.value)}
            className={cn(
              'flex-1 py-1.5 text-xs font-medium rounded-lg transition-all',
              timeFilter === filter.value
                ? 'bg-white text-purple-600 shadow-sm'
                : 'text-stone-500 hover:text-stone-700'
            )}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Weight Chart */}
      <AnimatePresence mode="wait">
        <motion.div
          key={timeFilter}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          <WeightChart data={filteredHistory} targetWeight={targetWeight} className="mb-4 pl-6" />
        </motion.div>
      </AnimatePresence>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-stone-100">
        <div className="text-center p-2 bg-stone-50 rounded-xl">
          <p className="text-[10px] text-stone-400 uppercase tracking-wide mb-0.5">Départ</p>
          <p className="font-semibold text-stone-700">{startWeight} kg</p>
        </div>
        <div className="text-center p-2 bg-stone-50 rounded-xl">
          <p className="text-[10px] text-stone-400 uppercase tracking-wide mb-0.5">Perdu</p>
          <p
            className={cn(
              'font-semibold',
              lost > 0 ? 'text-emerald-600' : lost < 0 ? 'text-amber-600' : 'text-stone-700'
            )}
          >
            {lost > 0 ? '-' : lost < 0 ? '+' : ''}
            {Math.abs(lost).toFixed(1)} kg
          </p>
        </div>
        <div className="text-center p-2 bg-stone-50 rounded-xl">
          <p className="text-[10px] text-stone-400 uppercase tracking-wide mb-0.5">Objectif</p>
          <p className="font-semibold text-stone-700">{hasTarget ? `${targetWeight} kg` : '—'}</p>
        </div>
      </div>

      {/* View history button */}
      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={onViewHistory}
        className="w-full mt-4 py-2.5 flex items-center justify-center gap-2 text-sm font-medium text-purple-600 hover:bg-purple-50 rounded-xl transition-colors"
      >
        Voir l'historique complet
        <ChevronRight className="w-4 h-4" />
      </motion.button>
    </motion.div>
  );
}

export default WeightProgressWidget;
