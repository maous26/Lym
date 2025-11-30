'use server';

import { prisma } from '@/lib/prisma';
import { appCache, CACHE_KEYS, CACHE_TTL } from '@/lib/cache';

// Interface pour le feedback de recette
interface RecipeFeedbackInput {
    recipeId: string;
    rating: number; // 1-5
    taste?: number;
    difficulty?: number;
    wouldMakeAgain?: boolean;
    comment?: string;
    tags?: string[];
    userId?: string;
}

// Interface pour le feedback de plan de repas
interface MealPlanFeedbackInput {
    mealPlanId: string;
    rating: number; // 1-5
    variety?: number;
    practicality?: number;
    satisfying?: boolean;
    comment?: string;
    improvedMeals?: { day: string; meal: string; reason: string }[];
    userId?: string;
}

// Interface pour sauvegarder un plan de repas
interface SaveMealPlanInput {
    userId?: string;
    startDate: Date;
    endDate: Date;
    planData: any;
    userGoal?: string;
    targetCalories?: number;
    dietType?: string;
}

/**
 * Soumettre un feedback pour une recette
 */
export async function submitRecipeFeedback(input: RecipeFeedbackInput) {
    try {
        const rating = await prisma.rating.create({
            data: {
                recipeId: input.recipeId,
                score: input.rating,
                taste: input.taste,
                difficulty: input.difficulty,
                wouldMakeAgain: input.wouldMakeAgain,
                comment: input.comment,
                tags: input.tags ? JSON.stringify(input.tags) : null,
                userId: input.userId || 'default',
            },
        });

        console.log('📊 Recipe feedback saved:', rating.id);

        return { success: true, ratingId: rating.id };
    } catch (error) {
        console.error('Error saving recipe feedback:', error);
        return { success: false, error: 'Impossible de sauvegarder le feedback' };
    }
}

/**
 * Sauvegarder un plan de repas généré
 */
export async function saveMealPlan(input: SaveMealPlanInput) {
    try {
        const mealPlan = await prisma.mealPlan.create({
            data: {
                userId: input.userId || 'default',
                startDate: input.startDate,
                endDate: input.endDate,
                planData: JSON.stringify(input.planData),
                userGoal: input.userGoal,
                targetCalories: input.targetCalories,
                dietType: input.dietType,
            },
        });

        console.log('📅 Meal plan saved:', mealPlan.id);

        return { success: true, mealPlanId: mealPlan.id };
    } catch (error) {
        console.error('Error saving meal plan:', error);
        return { success: false, error: 'Impossible de sauvegarder le plan' };
    }
}

/**
 * Soumettre un feedback pour un plan de repas
 */
export async function submitMealPlanFeedback(input: MealPlanFeedbackInput) {
    try {
        const feedback = await prisma.mealPlanFeedback.create({
            data: {
                mealPlanId: input.mealPlanId,
                userId: input.userId || 'default',
                rating: input.rating,
                variety: input.variety,
                practicality: input.practicality,
                satisfying: input.satisfying,
                comment: input.comment,
                improvedMeals: input.improvedMeals ? JSON.stringify(input.improvedMeals) : null,
            },
        });

        console.log('📊 Meal plan feedback saved:', feedback.id);

        return { success: true, feedbackId: feedback.id };
    } catch (error) {
        console.error('Error saving meal plan feedback:', error);
        return { success: false, error: 'Impossible de sauvegarder le feedback' };
    }
}

/**
 * Enregistrer un repas consommé
 */
export async function logMealHistory(input: {
    userId?: string;
    recipeId?: string;
    mealType: string;
    mealName: string;
    calories: number;
    proteins: number;
    carbs: number;
    fats: number;
    wasPlanned?: boolean;
    liked?: boolean;
}) {
    try {
        const mealHistory = await prisma.mealHistory.create({
            data: {
                userId: input.userId || 'default',
                recipeId: input.recipeId,
                mealType: input.mealType,
                mealName: input.mealName,
                calories: input.calories,
                proteins: input.proteins,
                carbs: input.carbs,
                fats: input.fats,
                wasPlanned: input.wasPlanned || false,
                liked: input.liked,
            },
        });

        return { success: true, historyId: mealHistory.id };
    } catch (error) {
        console.error('Error logging meal history:', error);
        return { success: false, error: 'Impossible d\'enregistrer le repas' };
    }
}

/**
 * Récupérer les statistiques de feedback pour l'IA
 */
export async function getFeedbackStats(userId: string = 'default') {
    try {
        // Récupérer les recettes les mieux notées
        const topRatedRecipes = await prisma.rating.groupBy({
            by: ['recipeId'],
            where: { userId },
            _avg: { score: true, taste: true },
            _count: { id: true },
            orderBy: { _avg: { score: 'desc' } },
            take: 10,
        });

        // Récupérer les tags les plus fréquents (positifs et négatifs)
        const allRatings = await prisma.rating.findMany({
            where: { userId, tags: { not: null } },
            select: { tags: true, score: true },
        });

        const tagCounts: Record<string, { count: number; avgScore: number }> = {};
        allRatings.forEach((rating) => {
            if (rating.tags) {
                const tags = JSON.parse(rating.tags) as string[];
                tags.forEach((tag) => {
                    if (!tagCounts[tag]) {
                        tagCounts[tag] = { count: 0, avgScore: 0 };
                    }
                    tagCounts[tag].count++;
                    tagCounts[tag].avgScore = 
                        (tagCounts[tag].avgScore * (tagCounts[tag].count - 1) + rating.score) / 
                        tagCounts[tag].count;
                });
            }
        });

        // Récupérer les préférences de types de repas
        const mealPreferences = await prisma.mealHistory.groupBy({
            by: ['mealType'],
            where: { userId, liked: true },
            _count: { id: true },
        });

        // Récupérer la moyenne de satisfaction des plans
        const planSatisfaction = await prisma.mealPlanFeedback.aggregate({
            where: { userId },
            _avg: { rating: true, variety: true, practicality: true },
            _count: { id: true },
        });

        return {
            success: true,
            stats: {
                topRatedRecipes,
                tagPreferences: tagCounts,
                mealPreferences,
                planSatisfaction,
            },
        };
    } catch (error) {
        console.error('Error fetching feedback stats:', error);
        return { success: false, error: 'Impossible de récupérer les statistiques' };
    }
}

/**
 * Générer un résumé des préférences utilisateur pour l'IA
 * Utilise un cache de 15 minutes pour réduire les appels DB
 */
export async function getUserPreferencesSummary(userId: string = 'default'): Promise<string> {
    try {
        // Vérifier le cache
        const cacheKey = `${CACHE_KEYS.USER_PREFERENCES}:${userId}`;
        const cached = appCache.get<string>(cacheKey);
        if (cached) {
            console.log('📦 Using cached user preferences');
            return cached;
        }

        const stats = await getFeedbackStats(userId);
        
        if (!stats.success || !stats.stats) {
            return 'Pas encore de données de préférences disponibles.';
        }

        const { tagPreferences, planSatisfaction } = stats.stats;

        // Analyser les tags positifs (score moyen > 3.5)
        const positiveTags = Object.entries(tagPreferences)
            .filter(([_, data]) => data.avgScore > 3.5 && data.count >= 2)
            .map(([tag]) => tag);

        // Analyser les tags négatifs (score moyen < 2.5)
        const negativeTags = Object.entries(tagPreferences)
            .filter(([_, data]) => data.avgScore < 2.5 && data.count >= 2)
            .map(([tag]) => tag);

        let summary = `
ANALYSE DES PRÉFÉRENCES UTILISATEUR (basée sur les feedbacks):
─────────────────────────────
`;

        if (positiveTags.length > 0) {
            summary += `✅ L'utilisateur apprécie: ${positiveTags.join(', ')}\n`;
        }

        if (negativeTags.length > 0) {
            summary += `❌ L'utilisateur n'apprécie pas: ${negativeTags.join(', ')}\n`;
        }

        if (planSatisfaction._count.id > 0) {
            summary += `📊 Satisfaction moyenne des plans: ${planSatisfaction._avg.rating?.toFixed(1) || '-'}/5\n`;
            summary += `📊 Variété perçue: ${planSatisfaction._avg.variety?.toFixed(1) || '-'}/5\n`;
            summary += `📊 Praticité perçue: ${planSatisfaction._avg.practicality?.toFixed(1) || '-'}/5\n`;
        }

        summary += `─────────────────────────────`;

        // Sauvegarder dans le cache pour 15 minutes
        appCache.set(cacheKey, summary, CACHE_TTL.ML_PREFERENCES);
        
        return summary;
    } catch (error) {
        console.error('Error generating preferences summary:', error);
        return 'Erreur lors de l\'analyse des préférences.';
    }
}

/**
 * Feedback rapide sur un repas (like/dislike)
 */
export async function quickMealFeedback(input: {
    recipeId: string;
    liked: boolean;
    userId?: string;
}) {
    try {
        // Créer un rating simple basé sur le like/dislike
        const rating = await prisma.rating.create({
            data: {
                recipeId: input.recipeId,
                score: input.liked ? 4 : 2, // 4 pour like, 2 pour dislike
                userId: input.userId || 'default',
                wouldMakeAgain: input.liked,
            },
        });

        return { success: true, ratingId: rating.id };
    } catch (error) {
        console.error('Error saving quick feedback:', error);
        return { success: false, error: 'Impossible de sauvegarder le feedback' };
    }
}

