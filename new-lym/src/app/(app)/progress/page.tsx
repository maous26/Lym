'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Calendar, Award, Flame, Target } from 'lucide-react';
import { Header } from '@/core/components/layout';
import { Card, Badge, Progress } from '@/core/components/ui';
import { cn } from '@/core/lib/cn';

type TimeRange = '7d' | '30d' | '90d';

// Mock data - in real app, this would come from the database
const mockWeekData = {
  averageCalories: 1850,
  targetCalories: 2000,
  averageProtein: 125,
  targetProtein: 150,
  daysTracked: 5,
  streak: 12,
  weightChange: -0.8,
};

const mockDailyCalories = [
  { day: 'Lun', value: 1950, target: 2000 },
  { day: 'Mar', value: 1780, target: 2000 },
  { day: 'Mer', value: 2100, target: 2000 },
  { day: 'Jeu', value: 1850, target: 2000 },
  { day: 'Ven', value: 1920, target: 2000 },
  { day: 'Sam', value: 0, target: 2000 },
  { day: 'Dim', value: 0, target: 2000 },
];

export default function ProgressPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');

  const caloriePercentage = Math.round(
    (mockWeekData.averageCalories / mockWeekData.targetCalories) * 100
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Progrès" />

      <div className="px-4 py-4 max-w-lg mx-auto space-y-6">
        {/* Time Range Selector */}
        <div className="flex gap-2">
          {(['7d', '30d', '90d'] as TimeRange[]).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={cn(
                'flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all',
                timeRange === range
                  ? 'bg-emerald-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              )}
            >
              {range === '7d' ? '7 jours' : range === '30d' ? '30 jours' : '90 jours'}
            </button>
          ))}
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 gap-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card variant="elevated" padding="md">
              <div className="flex items-center gap-2 mb-2">
                <Flame className="w-5 h-5 text-orange-500" />
                <span className="text-sm text-gray-500">Moy. calories</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {mockWeekData.averageCalories}
              </p>
              <div className="flex items-center gap-1 mt-1">
                {caloriePercentage < 100 ? (
                  <TrendingDown className="w-4 h-4 text-amber-500" />
                ) : (
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                )}
                <span className="text-xs text-gray-500">
                  {caloriePercentage}% de l'objectif
                </span>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card variant="elevated" padding="md">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5 text-emerald-500" />
                <span className="text-sm text-gray-500">Moy. protéines</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {mockWeekData.averageProtein}g
              </p>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-xs text-gray-500">
                  sur {mockWeekData.targetProtein}g cible
                </span>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card variant="elevated" padding="md">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-5 h-5 text-violet-500" />
                <span className="text-sm text-gray-500">Série</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {mockWeekData.streak} jours
              </p>
              <Badge variant="success" size="sm" className="mt-1">
                Record !
              </Badge>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card variant="elevated" padding="md">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-blue-500" />
                <span className="text-sm text-gray-500">Jours suivis</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {mockWeekData.daysTracked}/7
              </p>
              <Progress
                value={mockWeekData.daysTracked}
                max={7}
                size="sm"
                className="mt-2"
              />
            </Card>
          </motion.div>
        </div>

        {/* Weekly Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card variant="elevated" padding="md">
            <h3 className="font-semibold text-gray-900 mb-4">
              Calories cette semaine
            </h3>
            <div className="flex items-end justify-between h-32 gap-1">
              {mockDailyCalories.map((day, index) => {
                const percentage = day.value ? (day.value / day.target) * 100 : 0;
                const isOverTarget = percentage > 100;
                const displayPercentage = Math.min(percentage, 100);

                return (
                  <div key={day.day} className="flex-1 flex flex-col items-center">
                    <div className="relative w-full h-24 flex items-end">
                      {/* Target line */}
                      <div
                        className="absolute w-full h-px bg-gray-200"
                        style={{ bottom: '100%' }}
                      />
                      {/* Bar */}
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${displayPercentage}%` }}
                        transition={{ delay: index * 0.05, duration: 0.5 }}
                        className={cn(
                          'w-full rounded-t-md',
                          day.value === 0
                            ? 'bg-gray-100'
                            : isOverTarget
                            ? 'bg-amber-400'
                            : 'bg-emerald-400'
                        )}
                      />
                    </div>
                    <span className="text-xs text-gray-500 mt-2">{day.day}</span>
                    {day.value > 0 && (
                      <span className="text-xs font-medium text-gray-700">
                        {day.value}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-emerald-400" />
                <span>Sous l'objectif</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-amber-400" />
                <span>Au-dessus</span>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Weight Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card variant="elevated" padding="md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Évolution du poids</h3>
              <Badge
                variant={mockWeekData.weightChange < 0 ? 'success' : 'warning'}
              >
                {mockWeekData.weightChange > 0 ? '+' : ''}
                {mockWeekData.weightChange} kg
              </Badge>
            </div>
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
              <div
                className={cn(
                  'w-12 h-12 rounded-full flex items-center justify-center',
                  mockWeekData.weightChange < 0
                    ? 'bg-emerald-100'
                    : mockWeekData.weightChange > 0
                    ? 'bg-amber-100'
                    : 'bg-gray-100'
                )}
              >
                {mockWeekData.weightChange < 0 ? (
                  <TrendingDown className="w-6 h-6 text-emerald-600" />
                ) : mockWeekData.weightChange > 0 ? (
                  <TrendingUp className="w-6 h-6 text-amber-600" />
                ) : (
                  <Minus className="w-6 h-6 text-gray-600" />
                )}
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {mockWeekData.weightChange < 0
                    ? 'Vous êtes sur la bonne voie !'
                    : mockWeekData.weightChange > 0
                    ? 'Légère prise de poids'
                    : 'Poids stable'}
                </p>
                <p className="text-sm text-gray-500">
                  {Math.abs(mockWeekData.weightChange)} kg{' '}
                  {mockWeekData.weightChange < 0 ? 'perdus' : 'pris'} cette semaine
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
