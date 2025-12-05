'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ChevronLeft, ChevronRight, Calendar, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Header } from '@/core/components/layout';
import { Button, Card, Badge } from '@/core/components/ui';
import { CalorieCircle, MacroBar, MealCard } from '@/modules/meals/components';
import { useMealsStore, type MealType } from '@/modules/meals/store';
import { cn } from '@/core/lib/cn';
import { MEAL_TYPE_LABELS } from '@/config/constants';

const mealTypes: MealType[] = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'];

const mealEmojis: Record<MealType, string> = {
  BREAKFAST: '🌅',
  LUNCH: '☀️',
  DINNER: '🌙',
  SNACK: '🍎',
};

export default function MealsPage() {
  const {
    selectedDate,
    setSelectedDate,
    targets,
    getDailyNutrition,
    removeMeal,
  } = useMealsStore();

  const dailyData = getDailyNutrition(selectedDate);

  // Date navigation
  const goToPreviousDay = () => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() - 1);
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  const goToNextDay = () => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + 1);
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (dateStr === today.toISOString().split('T')[0]) {
      return "Aujourd'hui";
    }
    if (dateStr === yesterday.toISOString().split('T')[0]) {
      return 'Hier';
    }
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  };

  // Group meals by type
  const mealsByType = mealTypes.reduce((acc, type) => {
    acc[type] = dailyData.meals.filter((m) => m.mealType === type);
    return acc;
  }, {} as Record<MealType, typeof dailyData.meals>);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Mes repas" />

      <div className="px-4 py-4 max-w-lg mx-auto space-y-6">
        {/* Date Selector */}
        <Card variant="elevated" padding="sm">
          <div className="flex items-center justify-between">
            <button
              onClick={goToPreviousDay}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="text-center">
              <p className="font-semibold text-gray-900">{formatDate(selectedDate)}</p>
              <p className="text-xs text-gray-500">{selectedDate}</p>
            </div>
            <button
              onClick={goToNextDay}
              disabled={isToday}
              className={cn(
                'p-2 rounded-lg transition-colors',
                isToday
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'hover:bg-gray-100 text-gray-600'
              )}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </Card>

        {/* Daily Summary */}
        <motion.div
          key={selectedDate}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card variant="elevated" padding="md">
            <div className="flex items-center justify-between mb-4">
              <CalorieCircle
                consumed={dailyData.totals.calories}
                target={targets.calories}
                size="sm"
              />
              <div className="flex-1 ml-4 space-y-2">
                <MacroBar
                  label="Prot."
                  value={dailyData.totals.protein}
                  max={targets.protein}
                  color="protein"
                />
                <MacroBar
                  label="Gluc."
                  value={dailyData.totals.carbs}
                  max={targets.carbs}
                  color="carbs"
                />
                <MacroBar
                  label="Lip."
                  value={dailyData.totals.fat}
                  max={targets.fat}
                  color="fat"
                />
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Meal Sections */}
        <div className="space-y-4">
          {mealTypes.map((type) => {
            const meals = mealsByType[type];
            const typeCalories = meals.reduce((sum, m) => sum + m.calories, 0);

            return (
              <motion.div
                key={type}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{mealEmojis[type]}</span>
                    <h3 className="font-semibold text-gray-900">
                      {MEAL_TYPE_LABELS[type]}
                    </h3>
                    {meals.length > 0 && (
                      <Badge variant="default" size="sm">
                        {typeCalories} kcal
                      </Badge>
                    )}
                  </div>
                  <Button variant="ghost" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
                    Ajouter
                  </Button>
                </div>

                {meals.length > 0 ? (
                  <div className="space-y-2">
                    {meals.map((meal) => (
                      <MealCard
                        key={meal.id}
                        meal={meal}
                        onDelete={() => removeMeal(selectedDate, meal.id)}
                      />
                    ))}
                  </div>
                ) : (
                  <Card variant="flat" padding="md" className="text-center">
                    <p className="text-sm text-gray-400">Aucun repas enregistré</p>
                  </Card>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* AI Meal Plan CTA */}
        <Link href="/meals/plan">
          <Card
            variant="outlined"
            padding="md"
            hover
            className="border-emerald-200 bg-emerald-50/50"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">
                  Générer un plan de repas
                </h4>
                <p className="text-sm text-gray-500">
                  Laissez l&apos;IA créer votre semaine idéale
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </Card>
        </Link>
      </div>
    </div>
  );
}
