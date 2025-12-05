'use client';

import { Trash2 } from 'lucide-react';
import { Card } from '@/core/components/ui';
import { cn } from '@/core/lib/cn';
import type { MealEntry, MealType } from '../store';

interface MealCardProps {
  meal: MealEntry;
  onDelete?: () => void;
}

const mealTypeLabels: Record<MealType, { label: string; emoji: string; color: string }> = {
  BREAKFAST: { label: 'Petit-déjeuner', emoji: '🌅', color: 'bg-amber-100 text-amber-700' },
  LUNCH: { label: 'Déjeuner', emoji: '☀️', color: 'bg-orange-100 text-orange-700' },
  DINNER: { label: 'Dîner', emoji: '🌙', color: 'bg-indigo-100 text-indigo-700' },
  SNACK: { label: 'Collation', emoji: '🍎', color: 'bg-green-100 text-green-700' },
};

export function MealCard({ meal, onDelete }: MealCardProps) {
  const mealInfo = mealTypeLabels[meal.mealType];

  return (
    <Card variant="outlined" padding="sm" className="group">
      <div className="flex items-center gap-3">
        {/* Image or placeholder */}
        <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
          {meal.imageUrl ? (
            <img
              src={meal.imageUrl}
              alt={meal.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-2xl">{mealInfo.emoji}</span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-gray-900 truncate">{meal.name}</h4>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className={cn('text-xs px-2 py-0.5 rounded-full', mealInfo.color)}>
              {mealInfo.label}
            </span>
            <span className="text-xs text-gray-500">
              {meal.calories} kcal
            </span>
          </div>
        </div>

        {/* Macros */}
        <div className="hidden sm:flex items-center gap-3 text-xs">
          <div className="text-center">
            <p className="font-semibold text-emerald-600">{meal.protein}g</p>
            <p className="text-gray-400">Prot.</p>
          </div>
          <div className="text-center">
            <p className="font-semibold text-blue-600">{meal.carbs}g</p>
            <p className="text-gray-400">Gluc.</p>
          </div>
          <div className="text-center">
            <p className="font-semibold text-amber-600">{meal.fat}g</p>
            <p className="text-gray-400">Lip.</p>
          </div>
        </div>

        {/* Delete button */}
        {onDelete && (
          <button
            onClick={onDelete}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </Card>
  );
}
