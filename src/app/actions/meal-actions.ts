'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

interface MealData {
    mealName: string;
    mealType: string;
    description?: string;
    calories: number;
    proteins: number;
    carbs: number;
    fats: number;
    prepTime?: number;
    recipeId?: string;
}

/**
 * Valider un repas (le marquer comme consommé)
 */
export async function validateMeal(
    meal: MealData,
    originalDate: Date,
    mealPlanId?: string,
    dayIndex?: number,
    userId: string = 'default'
) {
    try {
        const validatedMeal = await prisma.validatedMeal.create({
            data: {
                userId,
                mealName: meal.mealName,
                mealType: meal.mealType,
                description: meal.description,
                calories: meal.calories,
                proteins: meal.proteins,
                carbs: meal.carbs,
                fats: meal.fats,
                prepTime: meal.prepTime,
                recipeId: meal.recipeId,
                status: 'validated',
                originalDate,
                actualDate: new Date(),
                mealPlanId,
                dayIndex,
            },
        });

        console.log('✅ Meal validated:', validatedMeal.id);
        revalidatePath('/meals/plan');
        
        return { success: true, mealId: validatedMeal.id };
    } catch (error) {
        console.error('Error validating meal:', error);
        return { success: false, error: 'Impossible de valider le repas' };
    }
}

/**
 * Sauter un repas (le marquer comme non consommé)
 */
export async function skipMeal(
    meal: MealData,
    originalDate: Date,
    mealPlanId?: string,
    dayIndex?: number,
    userId: string = 'default'
) {
    try {
        const skippedMeal = await prisma.validatedMeal.create({
            data: {
                userId,
                mealName: meal.mealName,
                mealType: meal.mealType,
                description: meal.description,
                calories: meal.calories,
                proteins: meal.proteins,
                carbs: meal.carbs,
                fats: meal.fats,
                prepTime: meal.prepTime,
                recipeId: meal.recipeId,
                status: 'skipped',
                originalDate,
                actualDate: null,
                mealPlanId,
                dayIndex,
            },
        });

        console.log('⏭️ Meal skipped:', skippedMeal.id);
        revalidatePath('/meals/plan');
        
        return { success: true, mealId: skippedMeal.id };
    } catch (error) {
        console.error('Error skipping meal:', error);
        return { success: false, error: 'Impossible de sauter le repas' };
    }
}

/**
 * Déplacer un repas à une autre date
 */
export async function moveMeal(
    meal: MealData,
    originalDate: Date,
    newDate: Date,
    mealPlanId?: string,
    dayIndex?: number,
    userId: string = 'default'
) {
    try {
        const movedMeal = await prisma.validatedMeal.create({
            data: {
                userId,
                mealName: meal.mealName,
                mealType: meal.mealType,
                description: meal.description,
                calories: meal.calories,
                proteins: meal.proteins,
                carbs: meal.carbs,
                fats: meal.fats,
                prepTime: meal.prepTime,
                recipeId: meal.recipeId,
                status: 'moved',
                originalDate,
                actualDate: newDate,
                mealPlanId,
                dayIndex,
            },
        });

        console.log('📅 Meal moved:', movedMeal.id);
        revalidatePath('/meals/plan');
        
        return { success: true, mealId: movedMeal.id };
    } catch (error) {
        console.error('Error moving meal:', error);
        return { success: false, error: 'Impossible de déplacer le repas' };
    }
}

/**
 * Récupérer les repas validés pour une période
 */
export async function getValidatedMeals(
    startDate: Date,
    endDate: Date,
    userId: string = 'default'
) {
    try {
        const meals = await prisma.validatedMeal.findMany({
            where: {
                userId,
                actualDate: {
                    gte: startDate,
                    lte: endDate,
                },
                status: {
                    in: ['validated', 'moved'],
                },
            },
            orderBy: {
                actualDate: 'asc',
            },
        });

        return { success: true, meals };
    } catch (error) {
        console.error('Error fetching validated meals:', error);
        return { success: false, error: 'Impossible de récupérer les repas' };
    }
}

/**
 * Récupérer les repas pour une date spécifique
 */
export async function getMealsForDate(
    date: Date,
    userId: string = 'default'
) {
    try {
        // Début et fin de la journée
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const meals = await prisma.validatedMeal.findMany({
            where: {
                userId,
                actualDate: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
                status: {
                    in: ['validated', 'moved'],
                },
            },
            orderBy: {
                mealType: 'asc',
            },
        });

        // Calculer les totaux
        const totals = meals.reduce((acc, meal) => ({
            calories: acc.calories + meal.calories,
            proteins: acc.proteins + meal.proteins,
            carbs: acc.carbs + meal.carbs,
            fats: acc.fats + meal.fats,
        }), { calories: 0, proteins: 0, carbs: 0, fats: 0 });

        return { success: true, meals, totals };
    } catch (error) {
        console.error('Error fetching meals for date:', error);
        return { success: false, error: 'Impossible de récupérer les repas' };
    }
}

/**
 * Supprimer un repas validé
 */
export async function deleteValidatedMeal(
    mealId: string,
    userId: string = 'default'
) {
    try {
        await prisma.validatedMeal.delete({
            where: {
                id: mealId,
                userId,
            },
        });

        console.log('🗑️ Validated meal deleted:', mealId);
        revalidatePath('/meals/plan');
        
        return { success: true };
    } catch (error) {
        console.error('Error deleting validated meal:', error);
        return { success: false, error: 'Impossible de supprimer le repas' };
    }
}

/**
 * Récupérer les statistiques de repas validés
 */
export async function getMealStats(
    startDate: Date,
    endDate: Date,
    userId: string = 'default'
) {
    try {
        const [validated, skipped, moved] = await Promise.all([
            prisma.validatedMeal.count({
                where: { userId, status: 'validated', originalDate: { gte: startDate, lte: endDate } },
            }),
            prisma.validatedMeal.count({
                where: { userId, status: 'skipped', originalDate: { gte: startDate, lte: endDate } },
            }),
            prisma.validatedMeal.count({
                where: { userId, status: 'moved', originalDate: { gte: startDate, lte: endDate } },
            }),
        ]);

        const avgCalories = await prisma.validatedMeal.aggregate({
            where: {
                userId,
                status: 'validated',
                actualDate: { gte: startDate, lte: endDate },
            },
            _avg: {
                calories: true,
            },
        });

        return {
            success: true,
            stats: {
                validated,
                skipped,
                moved,
                total: validated + skipped + moved,
                adherenceRate: validated + skipped + moved > 0 
                    ? Math.round((validated / (validated + skipped + moved)) * 100) 
                    : 0,
                avgCaloriesPerMeal: Math.round(avgCalories._avg.calories || 0),
            },
        };
    } catch (error) {
        console.error('Error fetching meal stats:', error);
        return { success: false, error: 'Impossible de récupérer les statistiques' };
    }
}

