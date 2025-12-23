'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Plus, Check, Clock, Utensils, Sparkles } from 'lucide-react';
import type { MealType } from '@/types/meal';

interface MealSlot {
  type: MealType;
  label?: string;
  name?: string;
  calories?: number;
  time?: string;
  imageUrl?: string;
  status: 'empty' | 'planned' | 'logged';
  plannedRecipe?: string;
}

interface TodayMealsWidgetProps {
  meals: MealSlot[];
  onAddMeal: (type: MealType) => void;
  onViewMeal: (type: MealType) => void;
  onViewPlan?: () => void;
  className?: string;
}

const mealConfig: Record<MealType, {
  icon: string;
  label: string;
  gradient: string;
  bgLight: string;
  textColor: string;
  borderColor: string;
  placeholderImage: string;
}> = {
  breakfast: {
    icon: '🌅',
    label: 'Petit-déjeuner',
    gradient: 'from-amber-400 to-orange-500',
    bgLight: 'bg-amber-50',
    textColor: 'text-amber-600',
    borderColor: 'border-amber-200',
    placeholderImage: '/petit-dej.png?v=2',
  },
  lunch: {
    icon: '☀️',
    label: 'Déjeuner',
    gradient: 'from-emerald-400 to-teal-500',
    bgLight: 'bg-emerald-50',
    textColor: 'text-emerald-600',
    borderColor: 'border-emerald-200',
    placeholderImage: '/dejeuner.png?v=2',
  },
  snack: {
    icon: '🍎',
    label: 'Collation',
    gradient: 'from-pink-400 to-rose-500',
    bgLight: 'bg-pink-50',
    textColor: 'text-pink-600',
    borderColor: 'border-pink-200',
    placeholderImage: '/collation.png?v=2',
  },
  dinner: {
    icon: '🌙',
    label: 'Dîner',
    gradient: 'from-indigo-400 to-purple-500',
    bgLight: 'bg-indigo-50',
    textColor: 'text-indigo-600',
    borderColor: 'border-indigo-200',
    placeholderImage: '/diner.png?v=2',
  },
};

function MealCard({
  meal,
  onAdd,
  onView,
  index,
}: {
  meal: MealSlot;
  onAdd: () => void;
  onView: () => void;
  index: number;
}) {
  const config = mealConfig[meal.type];
  const isEmpty = meal.status === 'empty';
  const isLogged = meal.status === 'logged';
  const isPlanned = meal.status === 'planned';

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1, type: 'spring', stiffness: 100 }}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={isEmpty ? onAdd : onView}
      className={cn(
        'relative w-full p-4 rounded-2xl cursor-pointer transition-all duration-300',
        'border-2 overflow-hidden',
        isEmpty
          ? `${config.bgLight} ${config.borderColor} border-dashed hover:border-solid`
          : isLogged
            ? 'bg-white border-transparent shadow-lg hover:shadow-xl'
            : `${config.bgLight} ${config.borderColor}`
      )}
    >
      <div className="relative flex items-center gap-4">
        {/* Icon Container */}
        <motion.div
          whileHover={{ rotate: [0, -10, 10, 0] }}
          transition={{ duration: 0.5 }}
          className={cn(
            'w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-md overflow-hidden',
            isEmpty
              ? `border-2 ${config.borderColor}`
              : `bg-gradient-to-br ${config.gradient}`
          )}
        >
          {meal.imageUrl ? (
            <img
              src={meal.imageUrl}
              alt={meal.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              src={config.placeholderImage}
              alt={config.label}
              className="w-full h-full object-cover"
            />
          )}
        </motion.div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={cn(
              'text-base font-bold',
              isEmpty ? config.textColor : 'text-gray-800'
            )}>
              {config.label}
            </span>

            {isLogged && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center justify-center w-5 h-5 rounded-full bg-green-500 shadow-sm"
              >
                <Check className="w-3 h-3 text-white" strokeWidth={3} />
              </motion.span>
            )}

            {isPlanned && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-500 shadow-sm"
              >
                <Clock className="w-3 h-3 text-white" strokeWidth={3} />
              </motion.span>
            )}
          </div>

          {isEmpty ? (
            <p className={cn('text-sm', config.textColor, 'opacity-70')}>
              Aucun repas enregistré
            </p>
          ) : isPlanned && meal.plannedRecipe ? (
            <p className="text-sm text-gray-600 truncate">
              {meal.plannedRecipe}
              <span className="ml-2 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">
                Planifié
              </span>
            </p>
          ) : (
            <div className="flex items-center gap-2">
              <p className="text-sm text-gray-600 truncate">
                {meal.name || 'Repas enregistré'}
              </p>
              {meal.calories && (
                <span className={cn(
                  'px-2 py-0.5 rounded-full text-xs font-semibold',
                  config.bgLight, config.textColor
                )}>
                  {meal.calories} kcal
                </span>
              )}
            </div>
          )}
        </div>

        {/* Time badge or Add button */}
        {isEmpty ? (
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center',
              `bg-gradient-to-br ${config.gradient}`,
              'shadow-md'
            )}
          >
            <Plus className="w-5 h-5 text-white" />
          </motion.div>
        ) : meal.time ? (
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-lg">
            {meal.time}
          </span>
        ) : null}
      </div>
    </motion.div>
  );
}

export function TodayMealsWidget({
  meals,
  onAddMeal,
  onViewMeal,
  onViewPlan,
  className,
}: TodayMealsWidgetProps) {
  const loggedCount = meals.filter((m) => m.status === 'logged').length;
  const totalCount = meals.length;
  const progress = (loggedCount / totalCount) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('bg-white rounded-3xl p-5 shadow-sm border border-gray-100', className)}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg"
          >
            <Utensils className="w-6 h-6 text-white" />
          </motion.div>
          <div>
            <h2 className="text-lg font-bold text-gray-800">Aujourd'hui</h2>
            <p className="text-sm text-gray-500">
              {loggedCount}/{totalCount} repas enregistrés
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Plan IA 7 jours button */}
          {onViewPlan && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onViewPlan}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-semibold shadow-md hover:shadow-lg transition-shadow"
              aria-label="Plan IA 7 jours"
            >
              <Sparkles className="w-4 h-4" />
              <span>Plan IA</span>
            </motion.button>
          )}

          {/* Circular progress */}
          <div className="relative w-14 h-14">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="28"
              cy="28"
              r="24"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
              className="text-gray-100"
            />
            <motion.circle
              cx="28"
              cy="28"
              r="24"
              stroke="url(#progressGradient)"
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
              initial={{ strokeDasharray: '0 150.8' }}
              animate={{ strokeDasharray: `${progress * 1.508} 150.8` }}
              transition={{ duration: 1, delay: 0.5 }}
            />
            <defs>
              <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#059669" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-bold text-gray-700">
              {Math.round(progress)}%
            </span>
          </div>
        </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-5">
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, delay: 0.3 }}
          />
        </div>
      </div>

      {/* Meal Cards */}
      <div className="space-y-3">
        {meals.map((meal, index) => (
          <MealCard
            key={meal.type}
            meal={meal}
            onAdd={() => onAddMeal(meal.type)}
            onView={() => onViewMeal(meal.type)}
            index={index}
          />
        ))}
      </div>
    </motion.div>
  );
}

export default TodayMealsWidget;
