import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MealItem, MealType, DailyNutrition } from '@/types/meal';
import { Product } from '@/types/product';
import { MeasurementUnit } from '@/lib/unit-utils';

interface MealState {
    meals: MealItem[];
    selectedDate: string;

    addMeal: (product: Product, quantity: number, unit: MeasurementUnit, mealType: MealType, date: string) => void;
    removeMeal: (mealId: string) => void;
    updateMealQuantity: (mealId: string, quantity: number) => void;
    getMealsByDate: (date: string) => MealItem[];
    getMealsByDateAndType: (date: string, mealType: MealType) => MealItem[];
    getDailyNutrition: (date: string, targets: any) => DailyNutrition;
    setSelectedDate: (date: string) => void;
    clearDay: (date: string) => void;
}

export const useMealStore = create<MealState>()(
    persist(
        (set, get) => ({
            meals: [],
            selectedDate: new Date().toISOString().split('T')[0],

            addMeal: (product, quantity, unit, mealType, date) => {
                // Calculate equivalent grams for nutritional calculations
                let equivalentGrams = quantity;
                if (unit === 'ml') {
                    equivalentGrams = quantity; // 1ml ≈ 1g for most liquids
                } else if (unit === 'unit') {
                    // Estimate based on product type
                    const nameLower = product.name.toLowerCase();
                    if (nameLower.includes('pomme')) equivalentGrams = quantity * 150;
                    else if (nameLower.includes('banane')) equivalentGrams = quantity * 120;
                    else if (nameLower.includes('orange')) equivalentGrams = quantity * 180;
                    else if (nameLower.includes('œuf') || nameLower.includes('oeuf')) equivalentGrams = quantity * 60;
                    else equivalentGrams = quantity * 100; // Default
                }

                const newMeal: MealItem = {
                    id: `${Date.now()}-${Math.random()}`,
                    product,
                    quantity,
                    unit,
                    equivalentGrams,
                    mealType,
                    date,
                    createdAt: new Date(),
                };
                set((state) => ({ meals: [...state.meals, newMeal] }));
            },

            removeMeal: (mealId) => {
                set((state) => ({
                    meals: state.meals.filter((m) => m.id !== mealId),
                }));
            },

            updateMealQuantity: (mealId, quantity) => {
                set((state) => ({
                    meals: state.meals.map((m) =>
                        m.id === mealId ? { ...m, quantity } : m
                    ),
                }));
            },

            getMealsByDate: (date) => {
                return get().meals.filter((m) => m.date === date);
            },

            getMealsByDateAndType: (date, mealType) => {
                return get().meals.filter((m) => m.date === date && m.mealType === mealType);
            },

            getDailyNutrition: (date, targets) => {
                const dayMeals = get().getMealsByDate(date);

                const totals = dayMeals.reduce(
                    (acc, meal) => {
                        const ratio = meal.equivalentGrams / 100; // Nutrients are per 100g
                        return {
                            calories: acc.calories + meal.product.calories * ratio,
                            proteins: acc.proteins + meal.product.proteins * ratio,
                            carbs: acc.carbs + meal.product.carbs * ratio,
                            fats: acc.fats + meal.product.fats * ratio,
                        };
                    },
                    { calories: 0, proteins: 0, carbs: 0, fats: 0 }
                );

                return {
                    date,
                    ...totals,
                    targetCalories: targets.calories || 2000,
                    targetProteins: targets.proteins || 150,
                    targetCarbs: targets.carbs || 250,
                    targetFats: targets.fats || 65,
                };
            },

            setSelectedDate: (date) => set({ selectedDate: date }),

            clearDay: (date) => {
                set((state) => ({
                    meals: state.meals.filter((m) => m.date !== date),
                }));
            },
        }),
        {
            name: 'vitality-meals',
        }
    )
);
