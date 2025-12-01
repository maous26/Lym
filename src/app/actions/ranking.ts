'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// ==========================================
// CONSTANTES DE CALCUL DU SCORE
// ==========================================

const POINTS = {
    RECIPE_CREATED: 50,           // +50 pts par recette créée
    RECIPE_WITH_PHOTO: 20,        // +20 pts bonus si photo
    RATING_RECEIVED: 10,          // +10 pts par note reçue
    GOOD_RATING_BONUS: 15,        // +15 pts si note >= 4
    DISH_OF_THE_WEEK: 100,        // +100 pts si plat de la semaine
};

const LEVEL_THRESHOLDS = {
    1: 0,      // Débutant: 0-299 pts
    2: 300,    // Confirmé: 300-999 pts
    3: 1000,   // Expert: 1000+ pts
};

// ==========================================
// TYPES
// ==========================================

export interface UserRankingData {
    id: string;
    userId: string;
    userName: string;
    avatarUrl?: string | null;
    recipesCount: number;
    recipesWithPhotos: number;
    totalRatingsReceived: number;
    averageRating: number;
    dishOfTheWeekCount: number;
    totalPoints: number;
    level: number;
    badges: string[];
    rank?: number;
}

// ==========================================
// FONCTIONS UTILITAIRES
// ==========================================

function calculateLevel(points: number): number {
    if (points >= LEVEL_THRESHOLDS[3]) return 3;
    if (points >= LEVEL_THRESHOLDS[2]) return 2;
    return 1;
}

function getLevelName(level: number): string {
    const names: Record<number, string> = {
        1: 'Apprenti Chef',
        2: 'Chef Confirmé',
        3: 'Chef Expert',
    };
    return names[level] || 'Apprenti Chef';
}

function calculateBadges(stats: {
    recipesCount: number;
    recipesWithPhotos: number;
    averageRating: number;
    dishOfTheWeekCount: number;
}): string[] {
    const badges: string[] = [];

    // Badges basés sur le nombre de recettes
    if (stats.recipesCount >= 1) badges.push('first_recipe');
    if (stats.recipesCount >= 10) badges.push('prolific_chef');
    if (stats.recipesCount >= 50) badges.push('master_chef');

    // Badges photos
    if (stats.recipesWithPhotos >= 5) badges.push('photo_lover');
    if (stats.recipesWithPhotos >= 20) badges.push('instagram_chef');

    // Badges notes
    if (stats.averageRating >= 4.5) badges.push('top_rated');
    if (stats.averageRating >= 4.8) badges.push('five_star_chef');

    // Badges plat de la semaine
    if (stats.dishOfTheWeekCount >= 1) badges.push('weekly_star');
    if (stats.dishOfTheWeekCount >= 5) badges.push('trending_chef');

    return badges;
}

// ==========================================
// ACTIONS PRINCIPALES
// ==========================================

/**
 * Récupérer ou créer le profil de ranking d'un utilisateur
 */
export async function getOrCreateUserRanking(userId: string, userName?: string): Promise<UserRankingData> {
    try {
        let ranking = await prisma.userRanking.findUnique({
            where: { userId },
        });

        if (!ranking) {
            ranking = await prisma.userRanking.create({
                data: {
                    userId,
                    userName: userName || 'Chef Anonyme',
                },
            });
        }

        return {
            ...ranking,
            badges: ranking.badges ? JSON.parse(ranking.badges) : [],
        };
    } catch (error) {
        console.error('Error getting/creating user ranking:', error);
        throw error;
    }
}

/**
 * Mettre à jour les statistiques d'un utilisateur après une action
 */
export async function updateUserRankingStats(userId: string): Promise<UserRankingData> {
    try {
        // Récupérer les stats depuis les recettes
        const recipes = await prisma.recipe.findMany({
            where: { creatorId: userId },
            include: {
                ratings: true,
            },
        });

        const recipesCount = recipes.length;
        const recipesWithPhotos = recipes.filter(r => r.imageUrl).length;
        const dishOfTheWeekCount = recipes.filter(r => r.isDishOfTheWeek).length;

        // Calculer les notes
        const allRatings = recipes.flatMap(r => r.ratings);
        const totalRatingsReceived = allRatings.length;
        const averageRating = totalRatingsReceived > 0
            ? allRatings.reduce((sum, r) => sum + r.score, 0) / totalRatingsReceived
            : 0;

        // Calculer les points
        let totalPoints = 0;
        totalPoints += recipesCount * POINTS.RECIPE_CREATED;
        totalPoints += recipesWithPhotos * POINTS.RECIPE_WITH_PHOTO;
        totalPoints += totalRatingsReceived * POINTS.RATING_RECEIVED;
        totalPoints += allRatings.filter(r => r.score >= 4).length * POINTS.GOOD_RATING_BONUS;
        totalPoints += dishOfTheWeekCount * POINTS.DISH_OF_THE_WEEK;

        // Calculer le niveau et les badges
        const level = calculateLevel(totalPoints);
        const badges = calculateBadges({
            recipesCount,
            recipesWithPhotos,
            averageRating,
            dishOfTheWeekCount,
        });

        // Mettre à jour le ranking
        const ranking = await prisma.userRanking.upsert({
            where: { userId },
            update: {
                recipesCount,
                recipesWithPhotos,
                totalRatingsReceived,
                averageRating,
                dishOfTheWeekCount,
                totalPoints,
                level,
                badges: JSON.stringify(badges),
            },
            create: {
                userId,
                recipesCount,
                recipesWithPhotos,
                totalRatingsReceived,
                averageRating,
                dishOfTheWeekCount,
                totalPoints,
                level,
                badges: JSON.stringify(badges),
            },
        });

        revalidatePath('/community');

        return {
            ...ranking,
            badges,
        };
    } catch (error) {
        console.error('Error updating user ranking stats:', error);
        throw error;
    }
}

/**
 * Récupérer le classement des utilisateurs
 */
export async function getLeaderboard(limit: number = 10): Promise<UserRankingData[]> {
    try {
        const rankings = await prisma.userRanking.findMany({
            orderBy: { totalPoints: 'desc' },
            take: limit,
        });

        return rankings.map((r, index) => ({
            ...r,
            badges: r.badges ? JSON.parse(r.badges) : [],
            rank: index + 1,
        }));
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        return [];
    }
}

/**
 * Récupérer le rang d'un utilisateur spécifique
 */
export async function getUserRank(userId: string): Promise<{ rank: number; total: number } | null> {
    try {
        const userRanking = await prisma.userRanking.findUnique({
            where: { userId },
        });

        if (!userRanking) return null;

        const higherRanked = await prisma.userRanking.count({
            where: {
                totalPoints: { gt: userRanking.totalPoints },
            },
        });

        const total = await prisma.userRanking.count();

        return {
            rank: higherRanked + 1,
            total,
        };
    } catch (error) {
        console.error('Error getting user rank:', error);
        return null;
    }
}

/**
 * Définir une recette comme "Plat de la semaine"
 */
export async function setDishOfTheWeek(recipeId: string): Promise<{ success: boolean }> {
    try {
        // Retirer le statut des anciens plats de la semaine
        await prisma.recipe.updateMany({
            where: { isDishOfTheWeek: true },
            data: { isDishOfTheWeek: false },
        });

        // Définir le nouveau plat de la semaine
        const recipe = await prisma.recipe.update({
            where: { id: recipeId },
            data: {
                isDishOfTheWeek: true,
                dishOfTheWeekAt: new Date(),
            },
        });

        // Mettre à jour les stats du créateur
        if (recipe.creatorId) {
            await updateUserRankingStats(recipe.creatorId);
        }

        revalidatePath('/community');

        return { success: true };
    } catch (error) {
        console.error('Error setting dish of the week:', error);
        return { success: false };
    }
}

/**
 * Récupérer le plat de la semaine actuel
 */
export async function getDishOfTheWeek() {
    try {
        const recipe = await prisma.recipe.findFirst({
            where: { isDishOfTheWeek: true },
            include: {
                ratings: true,
            },
        });

        if (!recipe) return null;

        const avgRating = recipe.ratings.length > 0
            ? recipe.ratings.reduce((sum, r) => sum + r.score, 0) / recipe.ratings.length
            : 0;

        return {
            ...recipe,
            avgRating,
        };
    } catch (error) {
        console.error('Error getting dish of the week:', error);
        return null;
    }
}

/**
 * Obtenir les infos de niveau pour l'affichage
 */
export async function getLevelInfo(level: number): Promise<{ name: string; nextLevel: number | null; pointsNeeded: number }> {
    const name = getLevelName(level);
    const nextLevel = level < 3 ? level + 1 : null;
    const pointsNeeded = nextLevel ? LEVEL_THRESHOLDS[nextLevel as keyof typeof LEVEL_THRESHOLDS] : 0;

    return { name, nextLevel, pointsNeeded };
}

