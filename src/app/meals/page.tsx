'use client';

import { useState, useMemo, useEffect, Suspense, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';
import { Plus, CalendarDays, BookOpen, ChevronRight, ChevronLeft, Check, Flame, Users, Star, Clock, Loader2, Trash2 } from 'lucide-react';
import { DateSelector } from '@/components/features/meals/DateSelector';
import { DailyNutritionSummary } from '@/components/features/meals/DailyNutritionSummary';
import { MealSection } from '@/components/features/meals/MealSection';
import { useMealStore, useSelectedDateMeals } from '@/store/meal-store';
import { useSoloProfile } from '@/store/user-store';
import { getCommunityRecipes, addRecipeToMealPlan, deleteRecipe } from '@/app/actions/social-recipe';
import { RecipeRatingModal } from '@/components/features/recipes';
import type { MealType, DailyMeals } from '@/types/meal';

// Tab type
type TabType = 'journal' | 'calendar' | 'recipes';

// Recipe type for community recipes
interface CommunityRecipe {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  calories: number;
  prepTime: number;
  servings: number;
  averageRating: number;
  ratingsCount: number;
  videoPlatform: string | null;
  author: { id: string; name: string | null; image: string | null } | null;
  tags: string[];
}

// Meal type emojis
const mealTypeEmojis: Record<string, string> = {
  breakfast: '🥐',
  lunch: '🍽️',
  snack: '🍎',
  dinner: '🌙',
};

function MealsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;

  const [activeTab, setActiveTab] = useState<TabType>(
    tabParam === 'calendar' ? 'calendar' : tabParam === 'recipes' ? 'recipes' : 'journal'
  );
  const [calendarMonth, setCalendarMonth] = useState(new Date());

  // Community recipes state
  const [communityRecipes, setCommunityRecipes] = useState<CommunityRecipe[]>([]);
  const [recipesLoading, setRecipesLoading] = useState(false);
  const [ratingModal, setRatingModal] = useState<{ isOpen: boolean; recipeId: string; title: string }>({
    isOpen: false,
    recipeId: '',
    title: '',
  });
  const [addingRecipeId, setAddingRecipeId] = useState<string | null>(null);
  const [deletingRecipeId, setDeletingRecipeId] = useState<string | null>(null);

  // Update tab when URL param changes
  useEffect(() => {
    if (tabParam === 'calendar') {
      setActiveTab('calendar');
    } else if (tabParam === 'recipes') {
      setActiveTab('recipes');
    }
  }, [tabParam]);

  // Load community recipes when tab changes to recipes
  const loadCommunityRecipes = useCallback(async () => {
    setRecipesLoading(true);
    const result = await getCommunityRecipes({ limit: 20 });
    if (result.success && result.recipes) {
      setCommunityRecipes(result.recipes);
    }
    setRecipesLoading(false);
  }, []);

  useEffect(() => {
    if (activeTab === 'recipes' && communityRecipes.length === 0) {
      loadCommunityRecipes();
    }
  }, [activeTab, communityRecipes.length, loadCommunityRecipes]);

  // Meal store
  const selectedDate = useMealStore((state) => state.selectedDate);
  const setSelectedDate = useMealStore((state) => state.setSelectedDate);
  const goToPreviousDay = useMealStore((state) => state.goToPreviousDay);
  const goToNextDay = useMealStore((state) => state.goToNextDay);
  const goToToday = useMealStore((state) => state.goToToday);
  const deleteMeal = useMealStore((state) => state.deleteMeal);
  const meals = useMealStore((state) => state.meals);
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

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();

    // First day of month
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Day of week for first day (0 = Sunday, adjust for Monday start)
    let startDayOfWeek = firstDay.getDay() - 1;
    if (startDayOfWeek < 0) startDayOfWeek = 6;

    const days: { date: Date; isCurrentMonth: boolean; meals: DailyMeals | null }[] = [];

    // Previous month days
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month, -i);
      const dateStr = date.toISOString().split('T')[0];
      days.push({
        date,
        isCurrentMonth: false,
        meals: meals[dateStr] || null,
      });
    }

    // Current month days
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const date = new Date(year, month, d);
      const dateStr = date.toISOString().split('T')[0];
      days.push({
        date,
        isCurrentMonth: true,
        meals: meals[dateStr] || null,
      });
    }

    // Next month days to complete the grid
    const remainingDays = 42 - days.length; // 6 rows * 7 days
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(year, month + 1, i);
      const dateStr = date.toISOString().split('T')[0];
      days.push({
        date,
        isCurrentMonth: false,
        meals: meals[dateStr] || null,
      });
    }

    return days;
  }, [calendarMonth, meals]);

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
    console.log(`Feedback for ${mealType}: ${positive ? 'positive' : 'negative'}`);
  };

  const handleCalendarDayClick = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    setSelectedDate(dateStr);
    setActiveTab('journal');
  };

  const goToPreviousMonth = () => {
    setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1));
  };

  const goToCurrentMonth = () => {
    setCalendarMonth(new Date());
  };

  // Handle adding recipe to meal plan
  const handleAddRecipeToPlan = async (recipeId: string) => {
    setAddingRecipeId(recipeId);
    const today = new Date().toISOString().split('T')[0];
    const result = await addRecipeToMealPlan(recipeId, today, 'lunch');
    if (result.success) {
      alert('Recette ajoutee a votre plan repas !');
    } else {
      alert(result.error || 'Erreur');
    }
    setAddingRecipeId(null);
  };

  // Handle deleting recipe
  const handleDeleteRecipe = async (recipeId: string, title: string) => {
    if (!confirm(`Supprimer la recette "${title}" ?`)) return;

    setDeletingRecipeId(recipeId);
    const result = await deleteRecipe(recipeId);
    if (result.success) {
      setCommunityRecipes(prev => prev.filter(r => r.id !== recipeId));
    } else {
      alert(result.error || 'Erreur lors de la suppression');
    }
    setDeletingRecipeId(null);
  };

  // Format month name
  const monthName = calendarMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

  // Check if a date is today
  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Check if a date is selected
  const isSelected = (date: Date) => {
    return date.toISOString().split('T')[0] === selectedDate;
  };

  // Count meals for a day
  const getMealCount = (dayMeals: DailyMeals | null) => {
    if (!dayMeals) return 0;
    let count = 0;
    if (dayMeals.breakfast) count++;
    if (dayMeals.lunch) count++;
    if (dayMeals.snack) count++;
    if (dayMeals.dinner) count++;
    return count;
  };

  // Get calories for a day
  const getDayCalories = (dayMeals: DailyMeals | null) => {
    return dayMeals?.totalNutrition?.calories || 0;
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-24">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
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
            <button
              onClick={() => setActiveTab('recipes')}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors',
                activeTab === 'recipes'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-stone-500 hover:text-stone-700'
              )}
            >
              <Users className="w-4 h-4" />
              Vos recettes
            </button>
          </div>
        </div>

        {/* Date Selector - only for journal view */}
        {activeTab === 'journal' && (
          <DateSelector
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            onPrevious={goToPreviousDay}
            onNext={goToNextDay}
            onToday={goToToday}
          />
        )}
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
                    Pensez a boire au moins 1.5L d'eau par jour pour rester hydrate !
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-stone-400" />
              </div>
            </motion.div>
          </motion.div>
        ) : activeTab === 'calendar' ? (
          <motion.div
            key="calendar"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="px-4 py-4 space-y-4"
          >
            {/* Month Navigation */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={goToPreviousMonth}
                  className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-stone-600"
                >
                  <ChevronLeft className="w-5 h-5" />
                </motion.button>

                <button
                  onClick={goToCurrentMonth}
                  className="text-lg font-semibold text-stone-800 capitalize hover:text-primary-600 transition-colors"
                >
                  {monthName}
                </button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={goToNextMonth}
                  className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-stone-600"
                >
                  <ChevronRight className="w-5 h-5" />
                </motion.button>
              </div>

              {/* Day headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, idx) => (
                  <div key={idx} className="text-center text-xs font-medium text-stone-400 py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, idx) => {
                  const mealCount = getMealCount(day.meals);
                  const dayCalories = getDayCalories(day.meals);
                  const calorieTarget = soloProfile?.dailyCaloriesTarget || 2000;
                  const caloriePercentage = Math.min((dayCalories / calorieTarget) * 100, 100);

                  return (
                    <motion.button
                      key={idx}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleCalendarDayClick(day.date)}
                      className={cn(
                        'relative aspect-square rounded-xl flex flex-col items-center justify-center p-1 transition-all',
                        day.isCurrentMonth ? 'bg-white' : 'bg-stone-50',
                        isToday(day.date) && 'ring-2 ring-primary-500',
                        isSelected(day.date) && 'bg-primary-100',
                        !day.isCurrentMonth && 'opacity-40'
                      )}
                    >
                      {/* Date number */}
                      <span className={cn(
                        'text-sm font-medium',
                        isToday(day.date) ? 'text-primary-600' : 'text-stone-700',
                        isSelected(day.date) && 'text-primary-700'
                      )}>
                        {day.date.getDate()}
                      </span>

                      {/* Meal indicators */}
                      {mealCount > 0 && (
                        <div className="flex gap-0.5 mt-0.5">
                          {day.meals?.breakfast && <span className="text-[8px]">🥐</span>}
                          {day.meals?.lunch && <span className="text-[8px]">🍽️</span>}
                          {day.meals?.snack && <span className="text-[8px]">🍎</span>}
                          {day.meals?.dinner && <span className="text-[8px]">🌙</span>}
                        </div>
                      )}

                      {/* Calorie progress bar */}
                      {dayCalories > 0 && (
                        <div className="absolute bottom-1 left-1 right-1 h-1 bg-stone-200 rounded-full overflow-hidden">
                          <div
                            className={cn(
                              'h-full rounded-full',
                              caloriePercentage >= 90 ? 'bg-green-500' :
                                caloriePercentage >= 50 ? 'bg-amber-500' : 'bg-red-400'
                            )}
                            style={{ width: `${caloriePercentage}%` }}
                          />
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Legend */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <h4 className="font-semibold text-stone-700 mb-3">Legende</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-base">🥐</span>
                  <span className="text-sm text-stone-600">Petit-dejeuner</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-base">🍽️</span>
                  <span className="text-sm text-stone-600">Dejeuner</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-base">🍎</span>
                  <span className="text-sm text-stone-600">Collation</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-base">🌙</span>
                  <span className="text-sm text-stone-600">Diner</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-stone-100">
                <h5 className="text-sm font-medium text-stone-600 mb-2">Objectif calorique</h5>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-xs text-stone-500">≥90%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <span className="text-xs text-stone-500">50-90%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <span className="text-xs text-stone-500">&lt;50%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Selected day summary */}
            {dailyMeals && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl p-4 shadow-sm"
              >
                <h4 className="font-semibold text-stone-700 mb-3">
                  {new Date(selectedDate).toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long'
                  })}
                </h4>

                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Flame className="w-5 h-5 text-orange-500" />
                    <span className="text-lg font-bold text-stone-800">
                      {dailyMeals.totalNutrition?.calories || 0} kcal
                    </span>
                  </div>
                  <span className="text-sm text-stone-500">
                    / {soloProfile?.dailyCaloriesTarget || 2000} kcal
                  </span>
                </div>

                <div className="space-y-2">
                  {(['breakfast', 'lunch', 'snack', 'dinner'] as const).map((type) => {
                    const meal = dailyMeals[type];
                    if (!meal) return null;

                    return (
                      <div
                        key={type}
                        className="flex items-center justify-between bg-stone-50 rounded-xl p-3"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{mealTypeEmojis[type]}</span>
                          <div>
                            <p className="text-sm font-medium text-stone-700">
                              {meal.items?.[0]?.food?.name || 'Repas'}
                            </p>
                            <p className="text-xs text-stone-400">
                              {meal.totalNutrition?.calories || 0} kcal
                            </p>
                          </div>
                        </div>
                        <Check className="w-4 h-4 text-green-500" />
                      </div>
                    );
                  })}
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab('journal')}
                  className="w-full mt-3 py-2 rounded-xl bg-primary-50 text-primary-600 font-medium text-sm"
                >
                  Voir les details
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        ) : activeTab === 'recipes' ? (
          <motion.div
            key="recipes"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="px-4 py-4 space-y-4"
          >
            {/* Header */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-stone-900">Vos recettes</h3>
                  <p className="text-xs text-stone-500">Partagees par la communaute</p>
                </div>
              </div>
            </div>

            {/* Loading state */}
            {recipesLoading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
              </div>
            )}

            {/* Empty state */}
            {!recipesLoading && communityRecipes.length === 0 && (
              <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
                <Users className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                <p className="text-stone-600 font-medium">Aucune recette pour le moment</p>
                <p className="text-stone-400 text-sm mt-1">
                  Proposez vos recettes depuis la page d'accueil !
                </p>
              </div>
            )}

            {/* Recipe cards grid */}
            {!recipesLoading && communityRecipes.length > 0 && (
              <div className="grid grid-cols-1 gap-4">
                {communityRecipes.map((recipe) => (
                  <motion.div
                    key={recipe.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl overflow-hidden shadow-sm cursor-pointer active:scale-[0.98] transition-transform"
                    onClick={() => router.push(`/recipes/${recipe.id}`)}
                  >
                    <div className="flex">
                      {/* Image */}
                      <div
                        className="w-28 h-28 flex-shrink-0 bg-cover bg-center bg-gradient-to-br from-orange-100 to-rose-100"
                        style={{
                          backgroundImage: recipe.imageUrl
                            ? `url(${recipe.imageUrl})`
                            : undefined,
                        }}
                      />

                      {/* Content */}
                      <div className="flex-1 p-3 flex flex-col justify-between">
                        <div>
                          <h4 className="font-bold text-stone-900 text-sm line-clamp-2">
                            {recipe.title}
                          </h4>

                          {/* Author */}
                          {recipe.author && (
                            <p className="text-xs text-stone-400 mt-1">
                              par {recipe.author.name || 'Anonyme'}
                            </p>
                          )}

                          {/* Stats */}
                          <div className="flex items-center gap-3 mt-2 text-xs text-stone-500">
                            <span className="flex items-center gap-1">
                              <Flame className="w-3 h-3 text-orange-500" />
                              {Math.round(recipe.calories)} kcal
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {recipe.prepTime} min
                            </span>
                            {recipe.ratingsCount > 0 && (
                              <span className="flex items-center gap-1">
                                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                {recipe.averageRating.toFixed(1)}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 mt-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => setRatingModal({ isOpen: true, recipeId: recipe.id, title: recipe.title })}
                            className="flex-1 py-1.5 text-xs font-medium text-stone-600 bg-stone-100 rounded-lg hover:bg-stone-200 transition-colors flex items-center justify-center gap-1"
                          >
                            <Star className="w-3 h-3" />
                            Noter
                          </button>
                          <button
                            onClick={() => handleAddRecipeToPlan(recipe.id)}
                            disabled={addingRecipeId === recipe.id}
                            className="flex-1 py-1.5 text-xs font-medium text-white bg-primary-500 rounded-lg hover:bg-primary-600 transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
                          >
                            {addingRecipeId === recipe.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Plus className="w-3 h-3" />
                            )}
                            Ajouter
                          </button>
                          {/* Delete button - only for author */}
                          {currentUserId && recipe.author?.id === currentUserId && (
                            <button
                              onClick={() => handleDeleteRecipe(recipe.id, recipe.title)}
                              disabled={deletingRecipeId === recipe.id}
                              className="py-1.5 px-2 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center disabled:opacity-50"
                            >
                              {deletingRecipeId === recipe.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Trash2 className="w-3 h-3" />
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Rating Modal */}
      <RecipeRatingModal
        isOpen={ratingModal.isOpen}
        onClose={() => setRatingModal({ isOpen: false, recipeId: '', title: '' })}
        recipeId={ratingModal.recipeId}
        recipeTitle={ratingModal.title}
        onSuccess={() => {
          setRatingModal({ isOpen: false, recipeId: '', title: '' });
          loadCommunityRecipes();
        }}
      />

    </div>
  );
}

export default function MealsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-stone-50 flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" />
        </div>
      }
    >
      <MealsPageContent />
    </Suspense>
  );
}
