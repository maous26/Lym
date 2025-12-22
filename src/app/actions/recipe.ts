'use server';

import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { awardXp, incrementStat, updateStreak, XP_REWARDS } from './gamification';

// ============================================
// RECIPE TYPES
// ============================================
export interface RecipeData {
    title: string;
    description?: string;
    imageUrl?: string;
    prepTime: number;
    cookTime?: number;
    servings?: number;
    difficulty?: 'easy' | 'medium' | 'hard';
    calories: number;
    proteins: number;
    carbs: number;
    fats: number;
    fiber?: number;
    ingredients: Array<{ name: string; quantity: string; unit: string }>;
    instructions: string[];
    tags?: string[];
    promptContext?: string;
}

// ============================================
// SAVE AI-GENERATED RECIPE
// ============================================
export async function saveRecipe(recipe: RecipeData) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return { success: false, error: 'Non authentifié' };
    }

    try {
        const saved = await prisma.recipe.create({
            data: {
                title: recipe.title,
                description: recipe.description,
                imageUrl: recipe.imageUrl,
                prepTime: recipe.prepTime,
                cookTime: recipe.cookTime,
                servings: recipe.servings || 2,
                difficulty: recipe.difficulty || 'medium',
                calories: recipe.calories,
                proteins: recipe.proteins,
                carbs: recipe.carbs,
                fats: recipe.fats,
                fiber: recipe.fiber,
                ingredients: JSON.stringify(recipe.ingredients),
                instructions: JSON.stringify(recipe.instructions),
                tags: recipe.tags ? JSON.stringify(recipe.tags) : null,
                promptContext: recipe.promptContext,
                generatedBy: 'gemini',
            },
        });

        return { success: true, recipeId: saved.id };
    } catch (error) {
        console.error('Error saving recipe:', error);
        return { success: false, error: 'Erreur lors de la sauvegarde' };
    }
}

// ============================================
// RATE A RECIPE
// ============================================
export async function rateRecipe(
    recipeId: string,
    rating: number,
    comment?: string,
    cooked: boolean = false
): Promise<{
    success: boolean;
    error?: string;
    xpEarned?: number;
    newBadges?: string[];
    leveledUp?: boolean;
    newLevel?: number;
}> {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return { success: false, error: 'Non authentifié' };
    }

    if (rating < 1 || rating > 5) {
        return { success: false, error: 'La note doit être entre 1 et 5' };
    }

    try {
        const userId = session.user.id;

        // Check if recipe exists
        const recipe = await prisma.recipe.findUnique({
            where: { id: recipeId },
        });

        if (!recipe) {
            return { success: false, error: 'Recette non trouvée' };
        }

        // Upsert rating (one per user per recipe)
        const existingRating = await prisma.recipeRating.findUnique({
            where: {
                recipeId_userId: { recipeId, userId },
            },
        });

        const isFirstRating = !existingRating;

        await prisma.recipeRating.upsert({
            where: {
                recipeId_userId: { recipeId, userId },
            },
            update: {
                rating,
                comment,
                cooked,
                updatedAt: new Date(),
            },
            create: {
                recipeId,
                userId,
                rating,
                comment,
                cooked,
            },
        });

        // Update recipe average rating
        const ratings = await prisma.recipeRating.findMany({
            where: { recipeId },
            select: { rating: true },
        });

        const avgRating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;

        await prisma.recipe.update({
            where: { id: recipeId },
            data: {
                averageRating: avgRating,
                ratingsCount: ratings.length,
            },
        });

        // Gamification rewards (only for new ratings)
        let totalXpEarned = 0;
        const allNewBadges: string[] = [];
        let leveledUp = false;
        let newLevel: number | undefined;

        if (isFirstRating) {
            // Update streak
            const streakResult = await updateStreak(userId);
            allNewBadges.push(...streakResult.newBadges);
            totalXpEarned += streakResult.streakBonusXp;

            // Base XP for rating
            const baseXp = comment ? XP_REWARDS.rate_recipe_with_comment : XP_REWARDS.rate_recipe;
            const xpResult = await awardXp(userId, baseXp, comment ? 'rate_recipe_with_comment' : 'rate_recipe', recipeId, 'recipe');
            totalXpEarned += xpResult.xpAwarded;
            allNewBadges.push(...xpResult.newBadges);
            leveledUp = xpResult.leveledUp;
            newLevel = xpResult.newLevel;

            // Increment stats and check milestones
            const statResult = await incrementStat(userId, 'recipesRated');
            allNewBadges.push(...statResult.newBadges);

            // Bonus for marking as cooked
            if (cooked) {
                const cookXpResult = await awardXp(userId, XP_REWARDS.mark_recipe_cooked, 'mark_recipe_cooked', recipeId, 'recipe');
                totalXpEarned += cookXpResult.xpAwarded;
                allNewBadges.push(...cookXpResult.newBadges);

                await incrementStat(userId, 'recipesCooked');
            }
        }

        return {
            success: true,
            xpEarned: totalXpEarned,
            newBadges: allNewBadges,
            leveledUp,
            newLevel,
        };
    } catch (error) {
        console.error('Error rating recipe:', error);
        return { success: false, error: 'Erreur lors de la notation' };
    }
}

// ============================================
// GET RECIPE WITH RATINGS
// ============================================
export async function getRecipeWithRatings(recipeId: string) {
    const session = await getServerSession(authOptions);

    try {
        const recipe = await prisma.recipe.findUnique({
            where: { id: recipeId },
            include: {
                ratings: {
                    take: 10,
                    orderBy: { createdAt: 'desc' },
                    select: {
                        id: true,
                        userId: true,
                        rating: true,
                        comment: true,
                        cooked: true,
                        createdAt: true,
                    },
                },
            },
        });

        if (!recipe) {
            return { success: false, error: 'Recette non trouvée' };
        }

        // Get user's own rating if authenticated
        let userRating = null;
        if (session?.user?.id) {
            userRating = await prisma.recipeRating.findUnique({
                where: {
                    recipeId_userId: {
                        recipeId,
                        userId: session.user.id,
                    },
                },
            });
        }

        return {
            success: true,
            recipe: {
                ...recipe,
                ingredients: JSON.parse(recipe.ingredients),
                instructions: JSON.parse(recipe.instructions),
                tags: recipe.tags ? JSON.parse(recipe.tags) : [],
            },
            userRating: userRating
                ? {
                      rating: userRating.rating,
                      comment: userRating.comment,
                      cooked: userRating.cooked,
                  }
                : null,
        };
    } catch (error) {
        console.error('Error getting recipe:', error);
        return { success: false, error: 'Erreur lors de la récupération' };
    }
}

// ============================================
// GET USER'S RATED RECIPES
// ============================================
export async function getUserRatedRecipes(limit: number = 20) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return { success: false, error: 'Non authentifié' };
    }

    try {
        const ratings = await prisma.recipeRating.findMany({
            where: { userId: session.user.id },
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: {
                recipe: {
                    select: {
                        id: true,
                        title: true,
                        imageUrl: true,
                        calories: true,
                        prepTime: true,
                        averageRating: true,
                    },
                },
            },
        });

        return {
            success: true,
            recipes: ratings.map((r) => ({
                ...r.recipe,
                userRating: r.rating,
                userComment: r.comment,
                cooked: r.cooked,
                ratedAt: r.createdAt,
            })),
        };
    } catch (error) {
        console.error('Error getting rated recipes:', error);
        return { success: false, error: 'Erreur lors de la récupération' };
    }
}

// ============================================
// GET TOP RATED RECIPES
// ============================================
export async function getTopRatedRecipes(limit: number = 10) {
    try {
        const recipes = await prisma.recipe.findMany({
            where: {
                ratingsCount: { gte: 1 }, // At least 1 rating
            },
            take: limit,
            orderBy: [
                { averageRating: 'desc' },
                { ratingsCount: 'desc' },
            ],
            select: {
                id: true,
                title: true,
                description: true,
                imageUrl: true,
                calories: true,
                prepTime: true,
                difficulty: true,
                averageRating: true,
                ratingsCount: true,
                tags: true,
            },
        });

        return {
            success: true,
            recipes: recipes.map((r) => ({
                ...r,
                tags: r.tags ? JSON.parse(r.tags) : [],
            })),
        };
    } catch (error) {
        console.error('Error getting top recipes:', error);
        return { success: false, error: 'Erreur lors de la récupération' };
    }
}

// ============================================
// DELETE RATING
// ============================================
export async function deleteRating(recipeId: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return { success: false, error: 'Non authentifié' };
    }

    try {
        await prisma.recipeRating.delete({
            where: {
                recipeId_userId: {
                    recipeId,
                    userId: session.user.id,
                },
            },
        });

        // Recalculate average
        const ratings = await prisma.recipeRating.findMany({
            where: { recipeId },
            select: { rating: true },
        });

        if (ratings.length > 0) {
            const avgRating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
            await prisma.recipe.update({
                where: { id: recipeId },
                data: {
                    averageRating: avgRating,
                    ratingsCount: ratings.length,
                },
            });
        } else {
            await prisma.recipe.update({
                where: { id: recipeId },
                data: {
                    averageRating: 0,
                    ratingsCount: 0,
                },
            });
        }

        return { success: true };
    } catch (error) {
        console.error('Error deleting rating:', error);
        return { success: false, error: 'Erreur lors de la suppression' };
    }
}
