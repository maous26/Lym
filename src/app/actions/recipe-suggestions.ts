'use server';

import prisma from '@/lib/prisma';
import { withCache, CACHE_TTL, CACHE_KEYS } from '@/lib/cache/redis';

// Types
export type TargetProfile = 'weight_loss' | 'muscle_gain' | 'vegetarian' | 'express' | 'family' | 'maintenance';

export interface UserProfileForSuggestions {
  id?: string;
  goal?: string | null;
  dietType?: string | null;
  allergies?: string | string[] | null;         // Accepts both JSON string or array
  intolerances?: string | string[] | null;      // Accepts both JSON string or array
  dislikedFoods?: string | string[] | null;     // Accepts both JSON string or array
  cookingTimeWeekday?: number | null;
  dailyCaloriesTarget?: number | null;
}

export interface SuggestedRecipe {
  id: string;
  name: string;
  imageUrl: string;
  prepTime: number;
  servings: number;
  calories: number;
  tags: string[];
  matchScore: number;
  isFavorite?: boolean;
  source: 'ai_preset' | 'youtube' | 'community';
  authorName?: string;
  averageRating: number;
  ratingsCount: number;
}

/**
 * Determine which target profile matches the user best
 */
function determineTargetProfile(userProfile: UserProfileForSuggestions): TargetProfile {
  // Priority order: diet type > goal > cooking time > default

  // Check diet type first
  if (userProfile.dietType) {
    const diet = userProfile.dietType.toLowerCase();
    if (diet.includes('vegetar') || diet.includes('vegan')) {
      return 'vegetarian';
    }
  }

  // Check goal
  if (userProfile.goal) {
    const goal = userProfile.goal.toLowerCase();
    if (goal.includes('weight_loss') || goal.includes('perte') || goal.includes('perdre')) {
      return 'weight_loss';
    }
    if (goal.includes('muscle') || goal.includes('gain') || goal.includes('prise')) {
      return 'muscle_gain';
    }
  }

  // Check cooking time preference
  if (userProfile.cookingTimeWeekday && userProfile.cookingTimeWeekday <= 20) {
    return 'express';
  }

  // Default to maintenance
  return 'maintenance';
}

/**
 * Parse JSON array from string or return array directly
 */
function parseJsonArray(input: string | string[] | null | undefined): string[] {
  if (!input) return [];
  if (Array.isArray(input)) return input;
  try {
    const parsed = JSON.parse(input);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Calculate how well a recipe matches a user profile
 * Returns score 0-100
 */
function calculateMatchScore(
  recipe: {
    calories: number;
    prepTime: number;
    ingredients: string;
    tags: string | null;
  },
  userProfile: UserProfileForSuggestions
): number {
  let score = 70; // Base score

  // Check calories fit target (if user has target)
  if (userProfile.dailyCaloriesTarget) {
    const targetPerMeal = userProfile.dailyCaloriesTarget / 3; // Rough per-meal target
    const calorieVariance = Math.abs(recipe.calories - targetPerMeal) / targetPerMeal;
    if (calorieVariance <= 0.2) {
      score += 15; // Within 20% of target
    } else if (calorieVariance <= 0.4) {
      score += 5;  // Within 40%
    }
  } else {
    score += 10; // No target = assume it's fine
  }

  // Check prep time fits available time
  if (userProfile.cookingTimeWeekday) {
    if (recipe.prepTime <= userProfile.cookingTimeWeekday) {
      score += 5;
    } else {
      score -= 10; // Too long
    }
  }

  // Check for allergens in ingredients
  const userAllergies = parseJsonArray(userProfile.allergies);
  const userIntolerances = parseJsonArray(userProfile.intolerances);
  const excludeList = [...userAllergies, ...userIntolerances].map(a => a.toLowerCase());

  if (excludeList.length > 0) {
    const ingredientsLower = recipe.ingredients.toLowerCase();
    const hasAllergen = excludeList.some(allergen => ingredientsLower.includes(allergen));
    if (hasAllergen) {
      score -= 30; // Major penalty for allergens
    } else {
      score += 10; // Bonus for safe recipe
    }
  }

  // Check for disliked foods
  const dislikedFoods = parseJsonArray(userProfile.dislikedFoods);
  if (dislikedFoods.length > 0) {
    const ingredientsLower = recipe.ingredients.toLowerCase();
    const hasDisliked = dislikedFoods.some(food => ingredientsLower.includes(food.toLowerCase()));
    if (hasDisliked) {
      score -= 20;
    }
  }

  return Math.min(100, Math.max(0, score));
}

/**
 * Get AI preset recipes for a target profile
 */
async function getAIPresetRecipes(targetProfile: TargetProfile, limit: number) {
  const recipes = await prisma.recipe.findMany({
    where: {
      source: 'ai_preset',
      targetProfile,
      status: 'approved',
    },
    orderBy: [
      { averageRating: 'desc' },
      { createdAt: 'desc' },
    ],
    take: limit,
    select: {
      id: true,
      title: true,
      imageUrl: true,
      prepTime: true,
      servings: true,
      calories: true,
      tags: true,
      ingredients: true,
      source: true,
      averageRating: true,
      ratingsCount: true,
    },
  });

  return recipes;
}

/**
 * Get top community recipes filtered by user preferences
 */
async function getCommunityRecipesForSuggestions(
  userProfile: UserProfileForSuggestions,
  limit: number
) {
  // Build exclusion filters based on user allergies
  const userAllergies = parseJsonArray(userProfile.allergies);
  const userIntolerances = parseJsonArray(userProfile.intolerances);

  const recipes = await prisma.recipe.findMany({
    where: {
      source: { in: ['youtube', 'community'] },
      status: 'approved',
      ratingsCount: { gte: 0 }, // Include all, even unrated
    },
    orderBy: [
      { averageRating: 'desc' },
      { ratingsCount: 'desc' },
      { createdAt: 'desc' },
    ],
    take: limit * 2, // Get more to filter
    select: {
      id: true,
      title: true,
      imageUrl: true,
      prepTime: true,
      servings: true,
      calories: true,
      tags: true,
      ingredients: true,
      source: true,
      averageRating: true,
      ratingsCount: true,
      author: {
        select: {
          name: true,
        },
      },
    },
  });

  // Filter out recipes with allergens
  const excludeList = [...userAllergies, ...userIntolerances].map(a => a.toLowerCase());

  const filtered = recipes.filter(recipe => {
    if (excludeList.length === 0) return true;
    const ingredientsLower = recipe.ingredients.toLowerCase();
    return !excludeList.some(allergen => ingredientsLower.includes(allergen));
  });

  return filtered.slice(0, limit);
}

/**
 * Shuffle array using Fisher-Yates algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Main function: Get suggested recipes for homepage
 * Returns a mix of AI preset recipes and community recipes
 */
export async function getSuggestedRecipes(
  userProfile: UserProfileForSuggestions | null,
  limit: number = 6
): Promise<{ success: boolean; recipes: SuggestedRecipe[]; error?: string }> {
  try {
    const profile = userProfile || {};
    const userId = profile.id || 'anonymous';

    // Try to get from cache first (only for logged in users)
    const cacheKey = CACHE_KEYS.suggestions(userId);

    const fetchRecipes = async (): Promise<SuggestedRecipe[]> => {
      // Determine target profile
      const targetProfile = determineTargetProfile(profile);

      // Get mix of recipes
      const aiLimit = Math.ceil(limit / 2);
      const communityLimit = Math.floor(limit / 2);

      const [aiRecipes, communityRecipes] = await Promise.all([
        getAIPresetRecipes(targetProfile, aiLimit),
        getCommunityRecipesForSuggestions(profile, communityLimit),
      ]);

      // Transform and calculate scores
      const allRecipes: SuggestedRecipe[] = [];

      // Transform AI recipes
      for (const recipe of aiRecipes) {
        const matchScore = calculateMatchScore(recipe, profile);
        allRecipes.push({
          id: recipe.id,
          name: recipe.title,
          imageUrl: recipe.imageUrl || '/placeholder-recipe.jpg',
          prepTime: recipe.prepTime,
          servings: recipe.servings,
          calories: Math.round(recipe.calories),
          tags: parseJsonArray(recipe.tags),
          matchScore,
          source: 'ai_preset',
          averageRating: recipe.averageRating,
          ratingsCount: recipe.ratingsCount,
        });
      }

      // Transform community recipes
      for (const recipe of communityRecipes) {
        const matchScore = calculateMatchScore(recipe, profile);
        allRecipes.push({
          id: recipe.id,
          name: recipe.title,
          imageUrl: recipe.imageUrl || '/placeholder-recipe.jpg',
          prepTime: recipe.prepTime,
          servings: recipe.servings,
          calories: Math.round(recipe.calories),
          tags: parseJsonArray(recipe.tags),
          matchScore,
          source: recipe.source === 'youtube' ? 'youtube' : 'community',
          authorName: recipe.author?.name || undefined,
          averageRating: recipe.averageRating,
          ratingsCount: recipe.ratingsCount,
        });
      }

      // Shuffle to mix AI and community recipes
      const shuffled = shuffleArray(allRecipes);

      // Sort by match score, keeping some randomness
      shuffled.sort((a, b) => b.matchScore - a.matchScore);

      return shuffled.slice(0, limit);
    };

    // Use cache wrapper
    const recipes = await withCache<SuggestedRecipe[]>(
      cacheKey,
      CACHE_TTL.SUGGESTIONS,
      fetchRecipes
    );

    return { success: true, recipes };

  } catch (error) {
    console.error('[getSuggestedRecipes] Error:', error);
    return {
      success: false,
      recipes: [],
      error: error instanceof Error ? error.message : 'Erreur lors du chargement des suggestions',
    };
  }
}

/**
 * Get all community recipes for the "Vos recettes" tab
 * Paginated and filtered
 */
export async function getAllCommunityRecipes(
  userProfile: UserProfileForSuggestions | null,
  page: number = 1,
  limit: number = 20
): Promise<{
  success: boolean;
  recipes: SuggestedRecipe[];
  total: number;
  hasMore: boolean;
  error?: string;
}> {
  try {
    const profile = userProfile || {};
    const skip = (page - 1) * limit;

    // Count total
    const total = await prisma.recipe.count({
      where: {
        source: { in: ['youtube', 'community', 'ai_preset'] },
        status: 'approved',
      },
    });

    // Get paginated recipes
    const recipes = await prisma.recipe.findMany({
      where: {
        source: { in: ['youtube', 'community', 'ai_preset'] },
        status: 'approved',
      },
      orderBy: [
        { averageRating: 'desc' },
        { createdAt: 'desc' },
      ],
      skip,
      take: limit,
      select: {
        id: true,
        title: true,
        imageUrl: true,
        prepTime: true,
        servings: true,
        calories: true,
        tags: true,
        ingredients: true,
        source: true,
        averageRating: true,
        ratingsCount: true,
        author: {
          select: {
            name: true,
          },
        },
      },
    });

    // Transform
    const transformed: SuggestedRecipe[] = recipes.map(recipe => {
      const matchScore = calculateMatchScore(recipe, profile);
      return {
        id: recipe.id,
        name: recipe.title,
        imageUrl: recipe.imageUrl || '/placeholder-recipe.jpg',
        prepTime: recipe.prepTime,
        servings: recipe.servings,
        calories: Math.round(recipe.calories),
        tags: parseJsonArray(recipe.tags),
        matchScore,
        source: recipe.source === 'ai_preset' ? 'ai_preset' : recipe.source === 'youtube' ? 'youtube' : 'community',
        authorName: recipe.author?.name || undefined,
        averageRating: recipe.averageRating,
        ratingsCount: recipe.ratingsCount,
      };
    });

    return {
      success: true,
      recipes: transformed,
      total,
      hasMore: skip + recipes.length < total,
    };

  } catch (error) {
    console.error('[getAllCommunityRecipes] Error:', error);
    return {
      success: false,
      recipes: [],
      total: 0,
      hasMore: false,
      error: error instanceof Error ? error.message : 'Erreur lors du chargement',
    };
  }
}
