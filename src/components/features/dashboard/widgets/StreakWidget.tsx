'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Flame, Calendar, Gift, Zap } from 'lucide-react';

interface StreakWidgetProps {
  currentStreak: number;
  bestStreak: number;
  weekDays: { day: string; completed: boolean; isToday: boolean }[];
  nextMilestone: number;
  onViewDetails: () => void;
  className?: string;
}

export function StreakWidget({
  currentStreak,
  bestStreak,
  weekDays,
  nextMilestone,
  onViewDetails,
  className,
}: StreakWidgetProps) {
  const progressToMilestone = (currentStreak / nextMilestone) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 rounded-3xl p-5 shadow-card relative overflow-hidden',
        className
      )}
    >
      {/* Decorative flames */}
      <div className="absolute -top-4 -right-4 opacity-10">
        <Flame className="w-24 h-24 text-orange-500" />
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <motion.div
            className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center shadow-lg"
            animate={{
              scale: [1, 1.05, 1],
              rotate: [-3, 3, -3],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Flame className="w-6 h-6 text-white" />
          </motion.div>
          <div>
            <motion.span
              className="text-3xl font-bold text-orange-600"
              key={currentStreak}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              {currentStreak}
            </motion.span>
            <span className="text-lg text-orange-400 ml-1">jours</span>
            <p className="text-xs text-stone-500">Record: {bestStreak} jours</p>
          </div>
        </div>

        {/* Milestone Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/80 rounded-full">
          <Gift className="w-4 h-4 text-amber-500" />
          <span className="text-xs font-medium text-stone-600">
            {nextMilestone - currentStreak} jours → récompense
          </span>
        </div>
      </div>

      {/* Week Overview */}
      <div className="relative z-10 flex justify-between mb-4">
        {weekDays.map((day, index) => (
          <motion.div
            key={`day-${index}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex flex-col items-center gap-1"
          >
            <span
              className={cn(
                'text-xs font-medium',
                day.isToday ? 'text-orange-600' : 'text-stone-400'
              )}
            >
              {day.day}
            </span>
            <motion.div
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center',
                day.completed
                  ? 'bg-gradient-to-br from-orange-400 to-amber-500 shadow-md'
                  : day.isToday
                  ? 'bg-white border-2 border-dashed border-orange-300'
                  : 'bg-white/60'
              )}
              whileHover={{ scale: 1.1 }}
            >
              {day.completed ? (
                <Flame className="w-4 h-4 text-white" />
              ) : day.isToday ? (
                <Zap className="w-4 h-4 text-orange-400" />
              ) : (
                <div className="w-2 h-2 rounded-full bg-stone-200" />
              )}
            </motion.div>
          </motion.div>
        ))}
      </div>

      {/* Milestone Progress */}
      <div className="relative z-10">
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-stone-500">Progression vers la récompense</span>
          <span className="font-medium text-orange-600">{Math.round(progressToMilestone)}%</span>
        </div>
        <div className="h-2.5 bg-white/60 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-orange-400 to-amber-400"
            initial={{ width: 0 }}
            animate={{ width: `${progressToMilestone}%` }}
            transition={{ duration: 0.8 }}
          />
        </div>
      </div>

      {/* Motivation Message */}
      <motion.div
        className="relative z-10 mt-4 p-3 bg-white/70 rounded-2xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <p className="text-sm text-stone-600 text-center">
          {currentStreak === 0
            ? "C'est le moment de commencer ta série ! 💪"
            : currentStreak < 7
            ? 'Continue comme ça, tu es sur la bonne voie ! 🌟'
            : currentStreak < 30
            ? 'Impressionnant ! Tu construis une vraie habitude ! 🔥'
            : 'Tu es incroyable ! Quelle discipline ! 🏆'}
        </p>
      </motion.div>
    </motion.div>
  );
}

export default StreakWidget;
