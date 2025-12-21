'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useSoloProfile, useActiveMode, useIsHydrated } from '@/store/user-store';
import { useTodayMeals } from '@/store/meal-store';
import { BottomNav } from '@/components/ui/BottomNav';
import {
  WelcomeWidget,
  NutritionRingWidget,
  TodayMealsWidget,
  QuickActionsWidget,
  CoachInsightWidget,
  WeekOverviewWidget,
  WeightProgressWidget,
  RecipeSuggestionWidget,
  HydrationWidget,
  StreakWidget,
} from '@/components/features/dashboard/widgets';

// Types for widget data
interface WeekDay {
  label: string;
  shortLabel: string;
  date: string;
  calories: number;
  goal: number;
}

interface Recipe {
  id: string;
  name: string;
  imageUrl: string;
  prepTime: number;
  servings: number;
  calories: number;
  tags: string[];
  matchScore: number;
  isFavorite?: boolean;
}

export default function HomePage() {
  const router = useRouter();
  const isHydrated = useIsHydrated();
  const soloProfile = useSoloProfile();
  const activeMode = useActiveMode();
  const todayMeals = useTodayMeals();

  // Local state for dynamic data
  const [hydration, setHydration] = useState(1200);
  const hydrationGoal = 2500;

  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  };

  // Objectif calories du profil
  const calorieGoal = soloProfile?.dailyCaloriesTarget || 2000;

  // Generate current week data with real dates
  const getWeekData = (): WeekDay[] => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));

    const dayLabels = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
    const shortLabels = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

    return dayLabels.map((label, index) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + index);
      const isToday = date.toDateString() === today.toDateString();
      const isFuture = date > today;

      // Pour aujourd'hui, utiliser les calories réelles des repas
      // Pour les jours passés et futurs, afficher 0 (pas de données)
      return {
        label,
        shortLabel: shortLabels[index],
        date: date.toISOString().split('T')[0],
        calories: isToday ? (todayMeals?.totalNutrition?.calories || 0) : 0,
        goal: calorieGoal,
      };
    });
  };

  const weekData = getWeekData();

  const suggestedRecipes: Recipe[] = [
    {
      id: '1',
      name: 'Buddha Bowl Quinoa & Légumes Grillés',
      imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
      prepTime: 25,
      servings: 2,
      calories: 420,
      tags: ['Végétarien', 'Healthy'],
      matchScore: 95,
      isFavorite: false,
    },
    {
      id: '2',
      name: 'Saumon Teriyaki aux Brocolis',
      imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400',
      prepTime: 30,
      servings: 2,
      calories: 480,
      tags: ['Protéines', 'Oméga-3'],
      matchScore: 88,
      isFavorite: true,
    },
    {
      id: '3',
      name: 'Poulet Citron Romarin',
      imageUrl: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=400',
      prepTime: 40,
      servings: 4,
      calories: 350,
      tags: ['Protéines', 'Low-carb'],
      matchScore: 82,
      isFavorite: false,
    },
  ];

  const coachInsights = [
    {
      id: '1',
      type: 'tip' as const,
      title: 'Conseil du jour',
      message: 'Tu as bien géré tes protéines hier ! Continue sur cette lancée pour optimiser ta récupération musculaire.',
      actionLabel: 'Voir mes macros',
      priority: 'normal' as const,
    },
  ];

  const weekDaysForStreak = [
    { day: 'L', completed: true, isToday: false },
    { day: 'M', completed: true, isToday: false },
    { day: 'M', completed: true, isToday: false },
    { day: 'J', completed: true, isToday: false },
    { day: 'V', completed: true, isToday: false },
    { day: 'S', completed: false, isToday: true },
    { day: 'D', completed: false, isToday: false },
  ];

  // Handlers
  const handleAddMeal = (type: 'breakfast' | 'lunch' | 'snack' | 'dinner') => {
    router.push(`/meals/add?type=${type}`);
  };

  const handleViewMeal = (type: 'breakfast' | 'lunch' | 'snack' | 'dinner') => {
    router.push(`/meals/${type}`);
  };

  const handleQuickAction = (actionId: string) => {
    switch (actionId) {
      case 'photo':
        router.push('/meals/add?mode=photo');
        break;
      case 'voice':
        router.push('/meals/add?mode=voice');
        break;
      case 'search':
        router.push('/search');
        break;
      case 'barcode':
        router.push('/meals/add?mode=barcode');
        break;
      case 'coach':
        router.push('/coach');
        break;
      case 'plan':
        router.push('/meals/plan');
        break;
    }
  };

  const handleAddWeight = () => {
    router.push('/weight/add');
  };

  const handleViewWeightHistory = () => {
    router.push('/weight');
  };

  const handleRecipeClick = (recipeId: string) => {
    router.push(`/recipes/${recipeId}`);
  };

  const handleToggleFavorite = (recipeId: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(recipeId)) {
        next.delete(recipeId);
      } else {
        next.add(recipeId);
      }
      return next;
    });
  };

  const handleAddHydration = (amount: number) => {
    setHydration((prev) => Math.min(prev + amount, hydrationGoal + 1000));
  };

  const handleRemoveHydration = (amount: number) => {
    setHydration((prev) => Math.max(prev - amount, 0));
  };

  // Loading state
  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-amber-50 flex items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center"
        >
          <span className="text-3xl">🌱</span>
        </motion.div>
      </div>
    );
  }

  // Current nutrition data - utiliser les valeurs du profil utilisateur
  const currentCalories = todayMeals?.totalNutrition?.calories || 0;
  const targetCalories = soloProfile?.dailyCaloriesTarget || 2000;
  const currentProteins = todayMeals?.totalNutrition?.proteins || 0;
  const targetProteins = soloProfile?.proteinTarget || 150;
  const currentCarbs = todayMeals?.totalNutrition?.carbs || 0;
  const targetCarbs = soloProfile?.carbsTarget || 250;
  const currentFats = todayMeals?.totalNutrition?.fats || 0;
  const targetFats = soloProfile?.fatTarget || 65;

  // Meals status
  const mealSlots = [
    {
      type: 'breakfast' as const,
      label: 'Petit-déj',
      status: todayMeals?.breakfast ? 'logged' as const : 'empty' as const,
      calories: todayMeals?.breakfast?.totalNutrition?.calories,
      plannedRecipe: undefined,
    },
    {
      type: 'lunch' as const,
      label: 'Déjeuner',
      status: todayMeals?.lunch ? 'logged' as const : 'planned' as const,
      calories: todayMeals?.lunch?.totalNutrition?.calories,
      plannedRecipe: !todayMeals?.lunch ? 'Buddha Bowl Quinoa' : undefined,
    },
    {
      type: 'snack' as const,
      label: 'Collation',
      status: 'empty' as const,
      calories: undefined,
      plannedRecipe: undefined,
    },
    {
      type: 'dinner' as const,
      label: 'Dîner',
      status: 'planned' as const,
      calories: undefined,
      plannedRecipe: 'Saumon Teriyaki',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-amber-50">
      {/* Header Decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-24 -right-24 w-72 h-72 rounded-full opacity-30"
          style={{
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.3), transparent)',
          }}
          animate={{ scale: [0.9, 1, 0.9] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute top-1/3 -left-32 w-56 h-56 rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(245, 158, 11, 0.25), transparent)',
          }}
          animate={{ scale: [1, 0.9, 1] }}
          transition={{ duration: 10, repeat: Infinity, delay: 1 }}
        />
      </div>

      {/* Main Content */}
      <main className="relative z-10 px-4 pt-safe pb-24">
        {/* Welcome Section */}
        <section className="pt-6">
          <WelcomeWidget
            firstName={soloProfile?.firstName || 'Utilisateur'}
            greeting={getGreeting()}
            streak={5}
            avatarUrl={soloProfile?.avatarUrl}
            motivationalMessage="Continue comme ça, tu es sur la bonne voie !"
          />
        </section>

        {/* Nutrition Ring */}
        <section className="mt-6">
          <NutritionRingWidget
            currentCalories={currentCalories}
            targetCalories={targetCalories}
            proteins={{ current: currentProteins, target: targetProteins }}
            carbs={{ current: currentCarbs, target: targetCarbs }}
            fats={{ current: currentFats, target: targetFats }}
            onViewDetails={() => router.push('/nutrition')}
          />
        </section>

        {/* Today's Meals */}
        <section className="mt-6">
          <TodayMealsWidget
            meals={mealSlots}
            onAddMeal={handleAddMeal}
            onViewMeal={handleViewMeal}
          />
        </section>

        {/* Quick Actions */}
        <section className="mt-6">
          <QuickActionsWidget onAction={handleQuickAction} />
        </section>

        {/* Coach Insight */}
        <section className="mt-6">
          <AnimatePresence>
            {coachInsights.map((insight) => (
              <CoachInsightWidget
                key={insight.id}
                {...insight}
                onAction={() => router.push('/coach')}
                onDismiss={() => {}}
              />
            ))}
          </AnimatePresence>
        </section>

        {/* Streak Widget */}
        <section className="mt-6">
          <StreakWidget
            currentStreak={5}
            bestStreak={12}
            weekDays={weekDaysForStreak}
            nextMilestone={7}
            onViewDetails={() => router.push('/achievements')}
          />
        </section>

        {/* Hydration */}
        <section className="mt-6">
          <HydrationWidget
            current={hydration}
            goal={hydrationGoal}
            onAdd={handleAddHydration}
            onRemove={handleRemoveHydration}
          />
        </section>

        {/* Recipe Suggestions */}
        <section className="mt-6">
          <RecipeSuggestionWidget
            recipes={suggestedRecipes.map((r) => ({
              ...r,
              isFavorite: favorites.has(r.id) || r.isFavorite,
            }))}
            onRecipeClick={handleRecipeClick}
            onToggleFavorite={handleToggleFavorite}
            onSeeAll={() => router.push('/recipes')}
          />
        </section>

        {/* Week Overview */}
        <section className="mt-6">
          <WeekOverviewWidget
            days={weekData}
            averageCalories={todayMeals?.totalNutrition?.calories || 0}
            onDayClick={(date) => router.push(`/nutrition?date=${date}`)}
          />
        </section>

        {/* Weight Progress */}
        <section className="mt-6">
          <WeightProgressWidget
            currentWeight={soloProfile?.weight || 0}
            targetWeight={soloProfile?.targetWeight || 0}
            startWeight={soloProfile?.weight || 0}
            lastWeightDate=""
            trend="stable"
            trendValue={0}
            onAddWeight={handleAddWeight}
            onViewHistory={handleViewWeightHistory}
          />
        </section>
      </main>

      {/* Bottom Navigation */}
      <BottomNav variant={activeMode === 'family' ? 'family' : 'solo'} />
    </div>
  );
}
