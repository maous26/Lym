import { Product } from './product';
import { MeasurementUnit } from '@/lib/unit-utils';

export type MealType = 'breakfast' | 'lunch' | 'snack' | 'dinner';

export interface MealItem {
    id: string;
    product: Product;
    quantity: number; // in selected unit
    unit: MeasurementUnit; // g, ml, or unit
    equivalentGrams: number; // for nutritional calculations
    mealType: MealType;
    date: string; // ISO date string (YYYY-MM-DD)
    createdAt: Date;
}

export interface DailyMeals {
    date: string;
    breakfast: MealItem[];
    lunch: MealItem[];
    snack: MealItem[];
    dinner: MealItem[];
}

export interface DailyNutrition {
    date: string;
    calories: number;
    proteins: number;
    carbs: number;
    fats: number;
    targetCalories: number;
    targetProteins: number;
    targetCarbs: number;
    targetFats: number;
}
