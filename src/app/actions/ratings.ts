'use server';

import { prisma } from '@/lib/prisma';

export async function rateRecipe(recipeId: string, score: number, comment?: string) {
    try {
        const rating = await prisma.rating.create({
            data: {
                recipeId,
                score,
                comment,
            },
        });
        return { success: true, rating };
    } catch (error) {
        console.error('Error rating recipe:', error);
        return { success: false, error: 'Failed to rate recipe' };
    }
}

export async function getRecipeRatings(recipeId: string) {
    try {
        const ratings = await prisma.rating.findMany({
            where: { recipeId },
            orderBy: { createdAt: 'desc' },
        });

        const avgRating = ratings.length > 0
            ? ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length
            : 0;

        return { success: true, ratings, avgRating, count: ratings.length };
    } catch (error) {
        console.error('Error fetching ratings:', error);
        return { success: false, error: 'Failed to fetch ratings' };
    }
}

export async function getPersonalizedRecommendations(userId: string = 'default') {
    try {
        // Récupérer les recettes les mieux notées par l'utilisateur
        const topRatedRecipes = await prisma.rating.findMany({
            where: {
                userId,
                score: { gte: 4 }, // 4 étoiles ou plus
            },
            include: {
                recipe: true,
            },
            orderBy: {
                score: 'desc',
            },
            take: 20,
        });

        // Extraire les tags des recettes appréciées
        const preferredTags = new Map<string, number>();

        topRatedRecipes.forEach(({ recipe, score }) => {
            if (recipe.tags) {
                try {
                    const tags = JSON.parse(recipe.tags) as string[];
                    tags.forEach(tag => {
                        preferredTags.set(tag, (preferredTags.get(tag) || 0) + score);
                    });
                } catch (e) {
                    // Ignore parsing errors
                }
            }
        });

        // Trier les tags par préférence
        const sortedTags = Array.from(preferredTags.entries())
            .sort((a, b) => b[1] - a[1])
            .map(([tag]) => tag);

        return {
            success: true,
            preferredTags: sortedTags,
            topRatedRecipes: topRatedRecipes.map(r => r.recipe),
        };
    } catch (error) {
        console.error('Error getting recommendations:', error);
        return { success: false, error: 'Failed to get recommendations' };
    }
}
