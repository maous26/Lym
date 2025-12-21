'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Plus, Check, Clock } from 'lucide-react';
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
  className?: string;
}

const mealConfig: Record<MealType, { icon: string; label: string; gradient: string }> = {
  breakfast: {
    icon: '🌅',
    label: 'Petit-déj',
    gradient: 'from-amber-400 to-orange-400',
  },
  lunch: {
    icon: '☀️',
    label: 'Déjeuner',
    gradient: 'from-emerald-400 to-teal-400',
  },
  snack: {
    icon: '🍎',
    label: 'Collation',
    gradient: 'from-pink-400 to-rose-400',
  },
  dinner: {
    icon: '🌙',
    label: 'Dîner',
    gradient: 'from-indigo-400 to-purple-400',
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

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      onClick={isEmpty ? onAdd : onView}
      className={cn(
        'relative w-full p-4 rounded-2xl text-left transition-all duration-200',
        'hover:scale-[1.02] active:scale-[0.98]',
        isEmpty
          ? 'bg-stone-50 border-2 border-dashed border-stone-200 hover:border-stone-300'
          : 'bg-white shadow-card hover:shadow-card-hover'
      )}
    >
      <div className="flex items-center gap-3">
        {/* Icon ou Image */}
        <div
          className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center shrink-0',
            isEmpty
              ? 'bg-stone-100'
              : `bg-gradient-to-br ${config.gradient}`
          )}
        >
          {meal.imageUrl ? (
            <img
              src={meal.imageUrl}
              alt={meal.name}
              className="w-full h-full object-cover rounded-xl"
            />
          ) : (
            <span className={cn('text-xl', isEmpty && 'opacity-50')}>
              {isEmpty ? <Plus className="w-5 h-5 text-stone-400" /> : config.icon}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={cn(
              'text-sm font-semibold',
              isEmpty ? 'text-stone-400' : 'text-stone-800'
            )}>
              {config.label}
            </span>
            {isLogged && (
              <span className="flex items-center justify-center w-4 h-4 rounded-full bg-green-100">
                <Check className="w-3 h-3 text-green-600" />
              </span>
            )}
            {meal.status === 'planned' && (
              <span className="flex items-center justify-center w-4 h-4 rounded-full bg-amber-100">
                <Clock className="w-3 h-3 text-amber-600" />
              </span>
            )}
          </div>

          {isEmpty ? (
            <p className="text-xs text-stone-400 mt-0.5">
              Ajouter un repas
            </p>
          ) : meal.status === 'planned' && meal.plannedRecipe ? (
            <p className="text-xs text-stone-500 mt-0.5 truncate">
              {meal.plannedRecipe}
              <span className="ml-1 text-amber-500 font-medium">· Planifié</span>
            </p>
          ) : (
            <p className="text-xs text-stone-500 mt-0.5 truncate">
              {meal.name}
              {meal.calories && (
                <span className="ml-1 text-stone-400">
                  · {meal.calories} kcal
                </span>
              )}
            </p>
          )}
        </div>

        {/* Time badge */}
        {meal.time && (
          <span className="text-xs text-stone-400 shrink-0">
            {meal.time}
          </span>
        )}
      </div>
    </motion.button>
  );
}

export function TodayMealsWidget({
  meals,
  onAddMeal,
  onViewMeal,
  className,
}: TodayMealsWidgetProps) {
  // Compter les repas loggés
  const loggedCount = meals.filter((m) => m.status === 'logged').length;
  const totalCount = meals.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('', className)}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-stone-800">Aujourd'hui</h2>
          <p className="text-sm text-stone-500">
            {loggedCount}/{totalCount} repas enregistrés
          </p>
        </div>

        {/* Mini progress */}
        <div className="flex items-center gap-1">
          {meals.map((meal, i) => (
            <div
              key={meal.type}
              className={cn(
                'w-2 h-2 rounded-full transition-colors',
                meal.status === 'logged'
                  ? 'bg-primary-500'
                  : meal.status === 'planned'
                  ? 'bg-amber-400'
                  : 'bg-stone-200'
              )}
            />
          ))}
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
