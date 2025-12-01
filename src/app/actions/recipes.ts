'use server';

import { prisma } from '@/lib/prisma';
import { recipeCache, generateCacheKey, CACHE_TTL } from '@/lib/cache';

export async function saveRecipe(recipe: {
    title: string;
    description?: string;
    ingredients: any[];
    instructions: any[];
    calories: number;
    proteins: number;
    carbs: number;
    fats: number;
    prepTime?: number;
    imageUrl?: string;
    tags?: string[];
    source?: string; // "AI" or "USER" or "USER_SHARED"
    userId?: string;
    creatorId?: string;
    creatorName?: string;
}) {
    try {
        const saved = await prisma.recipe.create({
            data: {
                title: recipe.title,
                description: recipe.description,
                ingredients: JSON.stringify(recipe.ingredients),
                instructions: JSON.stringify(recipe.instructions),
                calories: recipe.calories,
                proteins: recipe.proteins,
                carbs: recipe.carbs,
                fats: recipe.fats,
                prepTime: recipe.prepTime,
                imageUrl: recipe.imageUrl,
                tags: recipe.tags ? JSON.stringify(recipe.tags) : null,
                source: recipe.source || "AI",
                creatorId: recipe.creatorId,
                creatorName: recipe.creatorName,
            },
        });
        return { success: true, recipe: saved };
    } catch (error) {
        console.error("Error saving recipe:", error);
        return { success: false, error: "Failed to save recipe" };
    }
}

export async function getCommunityRecipes(limit: number = 20) {
    try {
        const recipes = await prisma.recipe.findMany({
            where: {
                OR: [
                    { source: "USER" },
                    { source: "USER_SHARED" }
                ],
                imageUrl: { not: null } // Only show recipes with images
            },
            include: {
                ratings: true,
            },
            take: limit,
            orderBy: {
                createdAt: 'desc',
            },
        });

        // Calculate average ratings and sort by popularity/rating could be done here
        const recipesWithStats = recipes.map(recipe => {
            const avgRating = recipe.ratings.length > 0
                ? recipe.ratings.reduce((sum, r) => sum + r.score, 0) / recipe.ratings.length
                : 0;
            return { ...recipe, avgRating, ratingsCount: recipe.ratings.length };
        });

        return { success: true, recipes: recipesWithStats };
    } catch (error) {
        console.error("Error fetching community recipes:", error);
        return { success: false, error: "Failed to fetch community recipes" };
    }
}

export async function searchRecipes(query: {
    calories?: { min?: number; max?: number };
    proteins?: { min?: number };
    tags?: string[];
    limit?: number;
}): Promise<{ success: true; recipes: any[] } | { success: false; error: string; recipes?: undefined }> {
    try {
        // Generate cache key from query parameters
        const cacheKey = generateCacheKey('recipe_search', query);
        
        // Check cache first
        const cached = recipeCache.get<{ success: true; recipes: any[] }>(cacheKey);
        if (cached) {
            console.log('📦 Recipe search cache HIT');
            return cached;
        }
        
        const recipes = await prisma.recipe.findMany({
            where: {
                AND: [
                    query.calories?.min ? { calories: { gte: query.calories.min } } : {},
                    query.calories?.max ? { calories: { lte: query.calories.max } } : {},
                    query.proteins?.min ? { proteins: { gte: query.proteins.min } } : {},
                ],
            },
            include: {
                ratings: true,
            },
            take: query.limit || 10,
            orderBy: {
                createdAt: 'desc',
            },
        });

        const result = { success: true as const, recipes };
        
        // Cache for 5 minutes
        recipeCache.set(cacheKey, result, CACHE_TTL.RECIPE_SEARCH);
        
        return result;
    } catch (error) {
        console.error("Error searching recipes:", error);
        return { success: false, error: "Failed to search recipes" };
    }
}

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
        console.error("Error rating recipe:", error);
        return { success: false, error: "Failed to rate recipe" };
    }
}

export async function getRecipeWithRatings(recipeId: string) {
    try {
        const recipe = await prisma.recipe.findUnique({
            where: { id: recipeId },
            include: {
                ratings: {
                    orderBy: {
                        createdAt: 'desc',
                    },
                },
            },
        });

        if (!recipe) {
            return { success: false, error: "Recipe not found" };
        }

        const avgRating = recipe.ratings.length > 0
            ? recipe.ratings.reduce((sum, r) => sum + r.score, 0) / recipe.ratings.length
            : 0;

        return { success: true, recipe, avgRating };
    } catch (error) {
        console.error("Error getting recipe:", error);
        return { success: false, error: "Failed to get recipe" };
    }
}

/**
 * Récupère les détails d'une recette (ingrédients et instructions)
 * Utilisé pour le chargement à la demande dans les plans
 */
export async function getRecipeDetails(recipeId: string) {
    try {
        // Check cache first
        const cacheKey = `recipe_details:${recipeId}`;
        const cached = recipeCache.get<{ ingredients: string[]; instructions: string[] }>(cacheKey);
        if (cached) {
            console.log('📦 Recipe details cache HIT');
            return { success: true, ...cached };
        }
        
        const recipe = await prisma.recipe.findUnique({
            where: { id: recipeId },
            select: {
                ingredients: true,
                instructions: true,
            },
        });

        if (!recipe) {
            return { success: false, error: "Recipe not found" };
        }

        const details = {
            ingredients: JSON.parse(recipe.ingredients) as string[],
            instructions: JSON.parse(recipe.instructions) as string[],
        };
        
        // Cache for 30 minutes
        recipeCache.set(cacheKey, details, 60 * 30);

        return { success: true, ...details };
    } catch (error) {
        console.error("Error getting recipe details:", error);
        return { success: false, error: "Failed to get recipe details" };
    }
}

export async function updateRecipeImage(recipeId: string, imageUrl: string) {
    try {
        const updated = await prisma.recipe.update({
            where: { id: recipeId },
            data: { imageUrl },
        });
        return { success: true, recipe: updated };
    } catch (error) {
        console.error("Error updating recipe image:", error);
        return { success: false, error: "Failed to update recipe image" };
    }
}
