'use server';

import prisma from '@/lib/prisma';
import { MealType } from '@/types/meal';

// ==========================================
// TYPES
// ==========================================

export interface MealItemInput {
    name: string;
    quantity: number;
    unit: string;
    calories: number;
    proteins: number;
    carbs: number;
    fats: number;
    foodId?: string;
}

export interface MealInput {
    userId?: string;
    type: MealType;
    date: string; // YYYY-MM-DD
    time?: string;

    // Total Nutrition
    calories: number;
    proteins: number;
    carbs: number;
    fats: number;
    fiber?: number;
    sugar?: number;
    sodium?: number;

    source?: string;
    photoUrl?: string;
    notes?: string;
    isPlanned?: boolean;

    items: MealItemInput[];
}

// ==========================================
// MEAL ACTIONS
// ==========================================

export async function addMeal(input: MealInput) {
    try {
        const userId = input.userId;
        if (!userId) throw new Error("User ID is required");

        // Create the meal and its items in a single transaction
        const meal = await prisma.meal.create({
            data: {
                userId,
                type: input.type,
                date: input.date,
                time: input.time,
                calories: input.calories,
                proteins: input.proteins,
                carbs: input.carbs,
                fats: input.fats,
                fiber: input.fiber,
                sugar: input.sugar,
                sodium: input.sodium,
                source: input.source || 'manual',
                photoUrl: input.photoUrl,
                notes: input.notes,
                isPlanned: input.isPlanned || false,
                items: {
                    create: input.items.map(item => ({
                        name: item.name,
                        quantity: item.quantity,
                        unit: item.unit,
                        calories: item.calories,
                        proteins: item.proteins,
                        carbs: item.carbs,
                        fats: item.fats,
                        foodId: item.foodId
                    }))
                }
            },
            include: {
                items: true
            }
        });

        return { success: true, meal };
    } catch (error) {
        console.error('Error adding meal:', error);
        return { success: false, error: "Échec de l'enregistrement du repas" };
    }
}

export async function getMealsByDate(date: string, userId: string = 'default') {
    try {
        const meals = await prisma.meal.findMany({
            where: {
                userId,
                date
            },
            include: {
                items: true
            },
            orderBy: {
                time: 'asc'
            }
        });

        return { success: true, meals };
    } catch (error) {
        console.error('Error fetching meals:', error);
        return { success: false, meals: [] };
    }
}

export async function deleteMeal(mealId: string, userId: string = 'default') {
    try {
        await prisma.meal.delete({
            where: {
                id: mealId,
                userId // Security check
            }
        });

        return { success: true };
    } catch (error) {
        console.error('Error deleting meal:', error);
        return { success: false, error: "Impossible de supprimer le repas" };
    }
}
