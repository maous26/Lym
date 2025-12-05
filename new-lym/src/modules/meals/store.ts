import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';

export interface MealEntry {
  id: string;
  mealType: MealType;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  imageUrl?: string;
}

export interface DailyNutrition {
  date: string;
  meals: MealEntry[];
  totals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

interface MealsState {
  selectedDate: string;
  dailyData: Record<string, DailyNutrition>;

  // Targets
  targets: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };

  // Actions
  setSelectedDate: (date: string) => void;
  setTargets: (targets: MealsState['targets']) => void;
  addMeal: (meal: Omit<MealEntry, 'id'>) => void;
  removeMeal: (date: string, mealId: string) => void;
  getDailyNutrition: (date: string) => DailyNutrition;
}

const getDateKey = (date: Date | string) => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0];
};

const emptyTotals = { calories: 0, protein: 0, carbs: 0, fat: 0 };

export const useMealsStore = create<MealsState>()(
  persist(
    (set, get) => ({
      selectedDate: getDateKey(new Date()),
      dailyData: {},
      targets: {
        calories: 2000,
        protein: 150,
        carbs: 250,
        fat: 65,
      },

      setSelectedDate: (date) => set({ selectedDate: date }),

      setTargets: (targets) => set({ targets }),

      addMeal: (meal) => {
        const { selectedDate, dailyData } = get();
        const dateKey = selectedDate;

        const newMeal: MealEntry = {
          ...meal,
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        };

        const existing = dailyData[dateKey] || {
          date: dateKey,
          meals: [],
          totals: { ...emptyTotals },
        };

        const updatedMeals = [...existing.meals, newMeal];
        const updatedTotals = updatedMeals.reduce(
          (acc, m) => ({
            calories: acc.calories + m.calories,
            protein: acc.protein + m.protein,
            carbs: acc.carbs + m.carbs,
            fat: acc.fat + m.fat,
          }),
          { ...emptyTotals }
        );

        set({
          dailyData: {
            ...dailyData,
            [dateKey]: {
              date: dateKey,
              meals: updatedMeals,
              totals: updatedTotals,
            },
          },
        });
      },

      removeMeal: (date, mealId) => {
        const { dailyData } = get();
        const existing = dailyData[date];
        if (!existing) return;

        const updatedMeals = existing.meals.filter((m) => m.id !== mealId);
        const updatedTotals = updatedMeals.reduce(
          (acc, m) => ({
            calories: acc.calories + m.calories,
            protein: acc.protein + m.protein,
            carbs: acc.carbs + m.carbs,
            fat: acc.fat + m.fat,
          }),
          { ...emptyTotals }
        );

        set({
          dailyData: {
            ...dailyData,
            [date]: {
              date,
              meals: updatedMeals,
              totals: updatedTotals,
            },
          },
        });
      },

      getDailyNutrition: (date) => {
        const { dailyData } = get();
        return dailyData[date] || { date, meals: [], totals: { ...emptyTotals } };
      },
    }),
    {
      name: 'lym-meals',
      partialize: (state) => ({
        dailyData: state.dailyData,
        targets: state.targets,
      }),
    }
  )
);
