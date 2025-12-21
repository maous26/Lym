'use server';

import prisma from '@/lib/prisma';
import { MealPlan, PlannedMeal } from '@/types/meal';

// ==========================================
// PLAN ACTIONS
// ==========================================

export async function saveMealPlan(userId: string, plan: any) {
    try {
        // 1. Deactivate existing active plans
        await prisma.mealPlan.updateMany({
            where: { userId, status: 'active' },
            data: { status: 'archived' }
        });

        // 2. Create new plan
        // Assumption: plan structure matches what we expect from the generator
        // We need to map the generator output to our Prisma model

        // Calculate start/end dates (e.g., next Monday)
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + 6);

        const newPlan = await prisma.mealPlan.create({
            data: {
                userId,
                startDate,
                endDate,
                status: 'active',
                days: {
                    create: plan.days.map((day: any) => ({
                        date: new Date(), // Logic needed to map day name to date
                        meals: {
                            create: day.meals.map((meal: any) => ({
                                type: meal.type,
                                title: meal.name,
                                description: meal.description,
                                calories: meal.calories,
                                proteins: meal.proteins,
                                carbs: meal.carbs,
                                fats: meal.fats,
                                prepTime: meal.prepTime || 15
                            }))
                        }
                    }))
                }
            },
            include: {
                days: {
                    include: {
                        meals: true
                    }
                }
            }
        });

        return { success: true, planId: newPlan.id };
    } catch (error) {
        console.error('Error saving meal plan:', error);
        return { success: false, error: "Impossible de sauvegarder le planning" };
    }
}

export async function getActiveMealPlan(userId: string) {
    try {
        const plan = await prisma.mealPlan.findFirst({
            where: { userId, status: 'active' },
            include: {
                days: {
                    include: {
                        meals: true
                    },
                    orderBy: {
                        date: 'asc'
                    }
                }
            }
        });

        if (!plan) return { success: false };

        return { success: true, plan };
    } catch (error) {
        console.error('Error fetching active meal plan:', error);
        return { success: false };
    }
}
