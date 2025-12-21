'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface DayData {
  label: string;
  shortLabel: string;
  date: string;
  calories: number;
  goal: number;
}

interface WeekOverviewWidgetProps {
  days: DayData[];
  averageCalories?: number;
  onDayClick: (date: string) => void;
  className?: string;
}

const dayNames = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

function DayBar({
  day,
  index,
  isToday,
  onClick,
}: {
  day: DayData;
  index: number;
  isToday: boolean;
  onClick: () => void;
}) {
  const percentage = Math.min((day.calories / day.goal) * 100, 120);
  const isOverTarget = percentage > 100;

  // Couleur basée sur le pourcentage
  const getBarColor = () => {
    if (day.calories === 0) return 'bg-stone-200';
    if (percentage < 70) return 'bg-amber-400';
    if (percentage <= 100) return 'bg-emerald-400';
    if (percentage <= 110) return 'bg-amber-400';
    return 'bg-red-400';
  };

  return (
    <motion.button
      initial={{ opacity: 0, scaleY: 0 }}
      animate={{ opacity: 1, scaleY: 1 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      onClick={onClick}
      className={cn(
        'flex flex-col items-center gap-2 flex-1 group',
        'transition-transform hover:scale-105'
      )}
    >
      {/* Bar */}
      <div className="relative w-full h-20 flex items-end justify-center">
        <div className="absolute inset-x-0 bottom-0 h-full bg-stone-100 rounded-lg" />
        <motion.div
          className={cn(
            'absolute inset-x-0 bottom-0 rounded-lg transition-colors',
            getBarColor(),
            isToday && 'ring-2 ring-primary-500 ring-offset-1'
          )}
          initial={{ height: 0 }}
          animate={{ height: `${Math.min(percentage, 100)}%` }}
          transition={{ delay: 0.3 + index * 0.05, duration: 0.5, ease: 'easeOut' }}
        />

        {/* Over target indicator */}
        {isOverTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="absolute -top-1 left-1/2 -translate-x-1/2"
          >
            <span className="text-xs">⚡</span>
          </motion.div>
        )}
      </div>

      {/* Day label */}
      <span
        className={cn(
          'text-xs font-medium',
          isToday ? 'text-primary-600' : 'text-stone-500'
        )}
      >
        {day.shortLabel}
      </span>

      {/* Today indicator */}
      {isToday && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-primary-500"
        />
      )}
    </motion.button>
  );
}

export function WeekOverviewWidget({
  days,
  averageCalories,
  onDayClick,
  className,
}: WeekOverviewWidgetProps) {
  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  // Calculer les stats de la semaine
  const totalCalories = days.reduce((sum, d) => sum + d.calories, 0);
  const totalTarget = days.reduce((sum, d) => sum + d.goal, 0);
  const weekPercentage = Math.round((totalCalories / totalTarget) * 100);
  const daysOnTrack = days.filter(
    (d) => d.calories > 0 && d.calories >= d.goal * 0.8 && d.calories <= d.goal * 1.1
  ).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('bg-white rounded-3xl p-5 shadow-card', className)}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-bold text-stone-800">Cette semaine</h2>
          <p className="text-sm text-stone-500">
            {daysOnTrack}/7 jours dans l'objectif
          </p>
        </div>

        {/* Week score */}
        <div className="text-right">
          <span
            className={cn(
              'text-2xl font-bold',
              weekPercentage >= 90 && weekPercentage <= 110
                ? 'text-emerald-500'
                : weekPercentage < 90
                ? 'text-amber-500'
                : 'text-red-500'
            )}
          >
            {weekPercentage}%
          </span>
          <p className="text-xs text-stone-400">de l'objectif</p>
        </div>
      </div>

      {/* Bars */}
      <div className="flex items-end gap-2 h-28">
        {days.map((day, index) => (
          <DayBar
            key={day.date}
            day={day}
            index={index}
            isToday={day.date === today}
            onClick={() => onDayClick(day.date)}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-stone-100">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-xs text-stone-500">Dans l'objectif</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-amber-400" />
          <span className="text-xs text-stone-500">À améliorer</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-red-400" />
          <span className="text-xs text-stone-500">Dépassé</span>
        </div>
      </div>
    </motion.div>
  );
}

export default WeekOverviewWidget;
