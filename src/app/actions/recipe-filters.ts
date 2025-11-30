'use server';

import { prisma } from '@/lib/prisma';

export interface RecipeFilters {
    dietType?: 'vegan' | 'vegetarian' | 'keto' | 'paleo' | 'mediterranean' | 'balanced';
    maxCalories?: number;
    minProtein?: number;
    allergies?: string[];
    tags?: string[];
}

export async function searchRecipesWithFilters(filters: RecipeFilters) {
    try {
        const recipes = await prisma.recipe.findMany({
            where: {
                AND: [
                    filters.maxCalories ? { calories: { lte: filters.maxCalories } } : {},
                    filters.minProtein ? { proteins: { gte: filters.minProtein } } : {},
                    // Tags stored as JSON string, need to filter in memory
                ],
            },
            include: {
                ratings: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        // Filter by tags and allergies in memory (since they're JSON)
        let filteredRecipes = recipes;

        if (filters.tags && filters.tags.length > 0) {
            filteredRecipes = filteredRecipes.filter(recipe => {
                if (!recipe.tags) return false;
                const recipeTags = JSON.parse(recipe.tags);
                return filters.tags!.some(tag => recipeTags.includes(tag));
            });
        }

        if (filters.allergies && filters.allergies.length > 0) {
            filteredRecipes = filteredRecipes.filter(recipe => {
                const ingredients = JSON.parse(recipe.ingredients).join(' ').toLowerCase();
                return !filters.allergies!.some(allergy =>
                    ingredients.includes(allergy.toLowerCase())
                );
            });
        }

        return { success: true, recipes: filteredRecipes };
    } catch (error) {
        console.error("Error searching recipes with filters:", error);
        return { success: false, error: "Failed to search recipes" };
    }
}

export async function toggleFavorite(recipeId: string, userId?: string) {
    try {
        // For now, we'll use a simple favorites table
        // In production, you'd have a proper User model
        const favorite = await prisma.$queryRaw`
      INSERT OR IGNORE INTO Favorites (recipeId, userId, createdAt)
      VALUES (${recipeId}, ${userId || 'default'}, datetime('now'))
    `;

        return { success: true };
    } catch (error) {
        console.error("Error toggling favorite:", error);
        return { success: false, error: "Failed to toggle favorite" };
    }
}

export async function getFavorites(userId?: string) {
    try {
        const favorites = await prisma.$queryRaw`
      SELECT r.* FROM Recipe r
      INNER JOIN Favorites f ON r.id = f.recipeId
      WHERE f.userId = ${userId || 'default'}
      ORDER BY f.createdAt DESC
    `;

        return { success: true, favorites };
    } catch (error) {
        console.error("Error getting favorites:", error);
        return { success: false, error: "Failed to get favorites" };
    }
}
