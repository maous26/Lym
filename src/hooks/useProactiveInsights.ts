'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useMealStore, useTodayMeals } from '@/store/meal-store';
import { useSoloProfile, useUserStore, useIsHydrated } from '@/store/user-store';
import { useCoachStore } from '@/store/coach-store';
import { generateProactiveInsights, type ProactiveInsight, type UserContext, type WeeklyNutritionData } from '@/app/actions/ai';
import type { NutritionInfo } from '@/types/meal';

interface UseProactiveInsightsReturn {
  insights: ProactiveInsight[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  lastRefreshed: Date | null;
}

/**
 * Hook pour charger et gérer les insights proactifs du coach IA
 * Se base sur les données nutritionnelles de l'utilisateur et son profil
 */
export function useProactiveInsights(): UseProactiveInsightsReturn {
  const [insights, setInsights] = useState<ProactiveInsight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  const isHydrated = useIsHydrated();
  const soloProfile = useSoloProfile();
  const todayMeals = useTodayMeals();
  const meals = useMealStore((state) => state.meals);
  const soloNutritionalNeeds = useUserStore((state) => state.soloNutritionalNeeds);

  // Coach store for managing insights
  const { addInsight, insights: storeInsights } = useCoachStore();

  // Calculate today's nutrition
  const todayNutrition = useMemo(() => {
    const consumed: NutritionInfo = todayMeals?.totalNutrition || {
      calories: 0,
      proteins: 0,
      carbs: 0,
      fats: 0,
    };

    const targets: NutritionInfo = {
      calories: soloProfile?.dailyCaloriesTarget || soloNutritionalNeeds?.calories || 2000,
      proteins: soloProfile?.proteinTarget || soloNutritionalNeeds?.proteins || 150,
      carbs: soloProfile?.carbsTarget || soloNutritionalNeeds?.carbs || 250,
      fats: soloProfile?.fatTarget || soloNutritionalNeeds?.fats || 65,
    };

    return { consumed, targets };
  }, [todayMeals, soloProfile, soloNutritionalNeeds]);

  // Calculate weekly data for the last 7 days
  const weeklyData = useMemo((): WeeklyNutritionData[] => {
    const data: WeeklyNutritionData[] = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];

      const dayMeals = meals[dateKey];
      const nutrition = dayMeals?.totalNutrition;

      // Count meals logged for this day
      const mealsLogged = [
        dayMeals?.breakfast,
        dayMeals?.lunch,
        dayMeals?.snack,
        dayMeals?.dinner,
      ].filter(Boolean).length;

      data.push({
        date: dateKey,
        calories: nutrition?.calories || 0,
        proteins: nutrition?.proteins || 0,
        carbs: nutrition?.carbs || 0,
        fats: nutrition?.fats || 0,
        mealsLogged,
      });
    }

    return data;
  }, [meals]);

  // Build user context for AI
  const userContext = useMemo((): UserContext | null => {
    if (!soloProfile) return null;

    return {
      profile: {
        id: soloProfile.id,
        firstName: soloProfile.firstName,
        goal: soloProfile.goal,
        dietType: soloProfile.dietType,
        allergies: soloProfile.allergies || [],
        intolerances: soloProfile.intolerances || [],
        activityLevel: soloProfile.activityLevel,
        dailyCaloriesTarget: soloProfile.dailyCaloriesTarget,
        proteinTarget: soloProfile.proteinTarget,
        carbsTarget: soloProfile.carbsTarget,
        fatTarget: soloProfile.fatTarget,
      },
      todayNutrition,
      weeklyData,
      streakDays: 0, // TODO: Calculate from actual data
    };
  }, [soloProfile, todayNutrition, weeklyData]);

  // Fetch insights from the AI
  const refresh = useCallback(async () => {
    if (!isHydrated || !userContext) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await generateProactiveInsights(userContext);

      if (result.success && result.insights) {
        setInsights(result.insights);
        setLastRefreshed(new Date());

        // Add insights to the coach store for notifications
        for (const insight of result.insights) {
          // Check if this insight already exists (by comparing title and type)
          const exists = storeInsights.some(
            (existing) =>
              existing.title === insight.title &&
              existing.type === insight.type
          );

          if (!exists) {
            addInsight({
              type: mapInsightTypeToStoreType(insight.type),
              priority: mapPriorityToStorePriority(insight.priority),
              title: insight.title,
              message: insight.message,
              action: insight.action,
              actionLink: insight.actionLink,
            });
          }
        }
      } else {
        setError(result.error || 'Erreur lors de la génération des insights');
      }
    } catch (err) {
      console.error('Error fetching proactive insights:', err);
      setError('Impossible de charger les conseils du coach');
    } finally {
      setIsLoading(false);
    }
  }, [isHydrated, userContext, addInsight, storeInsights]);

  // Initial load
  useEffect(() => {
    if (isHydrated && userContext && !lastRefreshed) {
      // Only auto-refresh if we haven't loaded yet
      refresh();
    }
  }, [isHydrated, userContext, lastRefreshed, refresh]);

  return {
    insights,
    isLoading,
    error,
    refresh,
    lastRefreshed,
  };
}

// Helper functions to map insight types
function mapInsightTypeToStoreType(type: ProactiveInsight['type']): 'success' | 'warning' | 'info' | 'tip' | 'achievement' {
  switch (type) {
    case 'achievement':
      return 'achievement';
    case 'alert':
      return 'warning';
    case 'motivation':
      return 'success';
    case 'tip':
      return 'tip';
    case 'reminder':
    case 'trend':
    default:
      return 'info';
  }
}

function mapPriorityToStorePriority(priority: ProactiveInsight['priority']): 'high' | 'medium' | 'low' {
  return priority;
}

export default useProactiveInsights;
