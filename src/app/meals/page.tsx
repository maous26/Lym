'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Plus, CalendarDays, BookOpen, ChevronRight } from 'lucide-react';
import { DateSelector } from '@/components/features/meals/DateSelector';
import { DailyNutritionSummary } from '@/components/features/meals/DailyNutritionSummary';
import { MealSection } from '@/components/features/meals/MealSection';
import { useMealStore, useSelectedDateMeals } from '@/store/meal-store';
import { useSoloProfile } from '@/store/user-store';
import type { MealType } from '@/types/meal';

// Tab type
type TabType = 'journal' | 'calendar';

export default function MealsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('journal');

  // Meal store
  const selectedDate = useMealStore((state) => state.selectedDate);
  const setSelectedDate = useMealStore((state) => state.setSelectedDate);
  const goToPreviousDay = useMealStore((state) => state.goToPreviousDay);
  const goToNextDay = useMealStore((state) => state.goToNextDay);
  const goToToday = useMealStore((state) => state.goToToday);
  const deleteMeal = useMealStore((state) => state.deleteMeal);
  const dailyMeals = useSelectedDateMeals();

  // User profile
  const soloProfile = useSoloProfile();

  // Calculate daily nutrition
  const dailyNutrition = useMemo(() => {
    const targets = {
      calories: soloProfile?.dailyCaloriesTarget || 2000,
      proteins: soloProfile?.proteinTarget || 150,
      carbs: soloProfile?.carbsTarget || 250,
      fats: soloProfile?.fatTarget || 65,
    };

    const consumed = dailyMeals?.totalNutrition || {
      calories: 0,
      proteins: 0,
      carbs: 0,
      fats: 0,
    };

    return {
      calories: {
        consumed: consumed.calories,
        target: targets.calories,
        percentage: Math.round((consumed.calories / targets.calories) * 100),
      },
      proteins: {
        consumed: consumed.proteins,
        target: targets.proteins,
        percentage: Math.round((consumed.proteins / targets.proteins) * 100),
      },
      carbs: {
        consumed: consumed.carbs,
        target: targets.carbs,
        percentage: Math.round((consumed.carbs / targets.carbs) * 100),
      },
      fats: {
        consumed: consumed.fats,
        target: targets.fats,
        percentage: Math.round((consumed.fats / targets.fats) * 100),
      },
    };
  }, [dailyMeals, soloProfile]);

  // Handlers
  const handleAddMeal = (mealType: MealType) => {
    router.push(`/meals/add?type=${mealType}&date=${selectedDate}`);
  };

  const handleViewMeal = (mealType: MealType) => {
    router.push(`/meals/${mealType}?date=${selectedDate}`);
  };

  const handleDeleteMeal = (mealType: MealType) => {
    if (confirm('Supprimer ce repas ?')) {
      deleteMeal(selectedDate, mealType);
    }
  };

  const handleFeedback = (mealType: MealType, positive: boolean) => {
    // TODO: Implement feedback system
    console.log(`Feedback for ${mealType}: ${positive ? 'positive' : 'negative'}`);
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-24">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        {/* Tabs */}
        {/* Navigation & Tabs */}
        <div className="flex items-center border-b border-stone-100 px-2">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 text-stone-500 hover:text-stone-700 transition-colors"
            aria-label="Retour"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left"><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></svg>
          </button>

          <div className="flex flex-1">
            <button
              onClick={() => setActiveTab('journal')}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors',
                activeTab === 'journal'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-stone-500 hover:text-stone-700'
              )}
            >
              <BookOpen className="w-4 h-4" />
              Journal
            </button>
            <button
              onClick={() => setActiveTab('calendar')}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors',
                activeTab === 'calendar'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-stone-500 hover:text-stone-700'
              )}
            >
              <CalendarDays className="w-4 h-4" />
              Calendrier
            </button>
          </div>
        </div>

        {/* Date Selector */}
        <DateSelector
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          onPrevious={goToPreviousDay}
          onNext={goToNextDay}
          onToday={goToToday}
        />
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'journal' ? (
          <motion.div
            key="journal"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="px-4 py-4 space-y-4"
          >
            {/* Daily Nutrition Summary */}
            <DailyNutritionSummary
              calories={dailyNutrition.calories}
              proteins={dailyNutrition.proteins}
              carbs={dailyNutrition.carbs}
              fats={dailyNutrition.fats}
            />

            {/* Meal Sections */}
            <div className="space-y-3">
              <MealSection
                type="breakfast"
                meal={dailyMeals?.breakfast}
                onAddMeal={() => handleAddMeal('breakfast')}
                onViewMeal={() => handleViewMeal('breakfast')}
                onDeleteMeal={() => handleDeleteMeal('breakfast')}
                onFeedback={(positive) => handleFeedback('breakfast', positive)}
              />

              <MealSection
                type="lunch"
                meal={dailyMeals?.lunch}
                onAddMeal={() => handleAddMeal('lunch')}
                onViewMeal={() => handleViewMeal('lunch')}
                onDeleteMeal={() => handleDeleteMeal('lunch')}
                onFeedback={(positive) => handleFeedback('lunch', positive)}
              />

              <MealSection
                type="snack"
                meal={dailyMeals?.snack}
                onAddMeal={() => handleAddMeal('snack')}
                onViewMeal={() => handleViewMeal('snack')}
                onDeleteMeal={() => handleDeleteMeal('snack')}
                onFeedback={(positive) => handleFeedback('snack', positive)}
              />

              <MealSection
                type="dinner"
                meal={dailyMeals?.dinner}
                onAddMeal={() => handleAddMeal('dinner')}
                onViewMeal={() => handleViewMeal('dinner')}
                onDeleteMeal={() => handleDeleteMeal('dinner')}
                onFeedback={(positive) => handleFeedback('dinner', positive)}
              />
            </div>

            {/* Quick tips */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-r from-primary-50 to-emerald-50 rounded-2xl p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-stone-800 mb-1">
                    Conseil du jour
                  </h4>
                  <p className="text-sm text-stone-600">
                    Pensez à boire au moins 1.5L d'eau par jour pour rester hydraté !
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-stone-400" />
              </div>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="calendar"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="px-4 py-4"
          >
            {/* Calendar view placeholder */}
            <div className="bg-white rounded-2xl p-8 text-center">
              <CalendarDays className="w-12 h-12 text-stone-300 mx-auto mb-4" />
              <h3 className="font-semibold text-stone-700 mb-2">
                Vue calendrier
              </h3>
              <p className="text-sm text-stone-500">
                La vue calendrier sera bientôt disponible pour visualiser vos repas sur plusieurs jours.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Add Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => handleAddMeal('lunch')}
        className="fixed bottom-24 right-4 w-14 h-14 bg-primary-600 text-white rounded-2xl shadow-lg flex items-center justify-center z-20"
        aria-label="Ajouter un repas"
      >
        <Plus className="w-7 h-7" />
      </motion.button>
    </div>
  );
}
