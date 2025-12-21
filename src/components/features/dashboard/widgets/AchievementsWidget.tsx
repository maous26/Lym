'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Trophy, Star, Flame, Target, ChevronRight } from 'lucide-react';

interface Achievement {
  id: string;
  icon: string;
  title: string;
  description: string;
  progress: number; // 0-100
  isNew?: boolean;
  unlockedAt?: string;
}

interface AchievementsWidgetProps {
  achievements: Achievement[];
  totalPoints: number;
  level: number;
  levelProgress: number;
  onViewAll: () => void;
  className?: string;
}

export function AchievementsWidget({
  achievements,
  totalPoints,
  level,
  levelProgress,
  onViewAll,
  className,
}: AchievementsWidgetProps) {
  const recentAchievements = achievements.slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('bg-white rounded-3xl p-5 shadow-card', className)}
    >
      {/* Header with Level */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-100 to-yellow-100 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-amber-600" />
            </div>
            {/* Level Badge */}
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 flex items-center justify-center text-white text-xs font-bold shadow-lg">
              {level}
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-stone-800">Niveau {level}</h3>
            <div className="flex items-center gap-1.5">
              <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
              <span className="text-xs text-stone-500">{totalPoints} points</span>
            </div>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onViewAll}
          className="p-2 rounded-xl bg-stone-50 hover:bg-stone-100 transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-stone-400" />
        </motion.button>
      </div>

      {/* Level Progress */}
      <div className="mb-5">
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-stone-500">Prochain niveau</span>
          <span className="font-medium text-amber-600">{levelProgress}%</span>
        </div>
        <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-amber-400 to-yellow-400"
            initial={{ width: 0 }}
            animate={{ width: `${levelProgress}%` }}
            transition={{ duration: 0.8, delay: 0.2 }}
          />
        </div>
      </div>

      {/* Recent Achievements */}
      <div className="space-y-3">
        {recentAchievements.map((achievement, index) => (
          <motion.div
            key={achievement.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * index }}
            className={cn(
              'flex items-center gap-3 p-3 rounded-2xl',
              achievement.progress === 100
                ? 'bg-gradient-to-r from-amber-50 to-yellow-50'
                : 'bg-stone-50'
            )}
          >
            {/* Icon */}
            <div
              className={cn(
                'w-10 h-10 rounded-xl flex items-center justify-center text-xl',
                achievement.progress === 100
                  ? 'bg-gradient-to-br from-amber-100 to-yellow-100'
                  : 'bg-white'
              )}
            >
              {achievement.icon}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-stone-800 text-sm truncate">
                  {achievement.title}
                </h4>
                {achievement.isNew && (
                  <span className="px-1.5 py-0.5 bg-primary-100 text-primary-600 text-[10px] font-semibold rounded-full">
                    NEW
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-500 truncate">
                {achievement.description}
              </p>
            </div>

            {/* Progress or Checkmark */}
            {achievement.progress === 100 ? (
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-amber-400 to-yellow-400 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            ) : (
              <div className="relative w-10 h-10">
                <svg className="w-10 h-10 transform -rotate-90">
                  <circle
                    cx="20"
                    cy="20"
                    r="16"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="transparent"
                    className="text-stone-200"
                  />
                  <motion.circle
                    cx="20"
                    cy="20"
                    r="16"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="transparent"
                    strokeDasharray={100}
                    initial={{ strokeDashoffset: 100 }}
                    animate={{ strokeDashoffset: 100 - achievement.progress }}
                    className="text-amber-400"
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-stone-600">
                  {achievement.progress}%
                </span>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* View All Button */}
      <motion.button
        onClick={onViewAll}
        className="w-full mt-4 py-2.5 text-sm font-medium text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-xl transition-colors flex items-center justify-center gap-2"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <Trophy className="w-4 h-4" />
        Voir tous les badges
      </motion.button>
    </motion.div>
  );
}

export default AchievementsWidget;
