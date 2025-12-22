'use server';

import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import {
    XP_REWARDS,
    BADGES,
    getXpForLevel,
    getLevelFromXp,
    getXpProgress,
    type BadgeType,
} from '@/lib/gamification-utils';

// Note: XP_REWARDS, BADGES, getXpProgress are available from '@/lib/gamification-utils'
// They cannot be re-exported from a 'use server' file

// ============================================
// CORE GAMIFICATION FUNCTIONS
// ============================================

/**
 * Get or create user gamification profile
 */
export async function getOrCreateGamification(userId: string) {
    let gamification = await prisma.userGamification.findUnique({
        where: { userId },
        include: {
            badges: true,
            xpHistory: {
                take: 10,
                orderBy: { createdAt: 'desc' },
            },
        },
    });

    if (!gamification) {
        gamification = await prisma.userGamification.create({
            data: { userId },
            include: {
                badges: true,
                xpHistory: {
                    take: 10,
                    orderBy: { createdAt: 'desc' },
                },
            },
        });
    }

    return gamification;
}

/**
 * Award XP to user and check for level up / badges
 */
export async function awardXp(
    userId: string,
    amount: number,
    reason: keyof typeof XP_REWARDS | string,
    referenceId?: string,
    referenceType?: string
): Promise<{
    success: boolean;
    xpAwarded: number;
    newTotal: number;
    leveledUp: boolean;
    newLevel?: number;
    newBadges: string[];
}> {
    try {
        const gamification = await getOrCreateGamification(userId);
        const oldLevel = gamification.level;
        const newTotalXp = gamification.totalXp + amount;
        const newLevel = getLevelFromXp(newTotalXp);
        const leveledUp = newLevel > oldLevel;

        // Create XP transaction
        await prisma.xpTransaction.create({
            data: {
                userGamificationId: gamification.id,
                amount,
                reason,
                referenceId,
                referenceType,
            },
        });

        // Update gamification stats
        await prisma.userGamification.update({
            where: { id: gamification.id },
            data: {
                totalXp: newTotalXp,
                level: newLevel,
                lastActivityAt: new Date(),
            },
        });

        // Check for new badges
        const newBadges: string[] = [];

        // Level badges
        if (leveledUp) {
            if (newLevel >= 5 && oldLevel < 5) {
                await awardBadge(gamification.id, 'level_5');
                newBadges.push('level_5');
            }
            if (newLevel >= 10 && oldLevel < 10) {
                await awardBadge(gamification.id, 'level_10');
                newBadges.push('level_10');
            }
            if (newLevel >= 25 && oldLevel < 25) {
                await awardBadge(gamification.id, 'level_25');
                newBadges.push('level_25');
            }
        }

        return {
            success: true,
            xpAwarded: amount,
            newTotal: newTotalXp,
            leveledUp,
            newLevel: leveledUp ? newLevel : undefined,
            newBadges,
        };
    } catch (error) {
        console.error('Error awarding XP:', error);
        return {
            success: false,
            xpAwarded: 0,
            newTotal: 0,
            leveledUp: false,
            newBadges: [],
        };
    }
}

/**
 * Award a badge to user
 */
export async function awardBadge(userGamificationId: string, badgeType: BadgeType): Promise<boolean> {
    try {
        const badge = BADGES[badgeType];
        if (!badge) return false;

        // Check if already has badge
        const existing = await prisma.userBadge.findUnique({
            where: {
                userGamificationId_badgeType: {
                    userGamificationId,
                    badgeType,
                },
            },
        });

        if (existing) return false;

        await prisma.userBadge.create({
            data: {
                userGamificationId,
                badgeType,
                badgeName: badge.name,
                badgeIcon: badge.icon,
                description: badge.description,
            },
        });

        return true;
    } catch (error) {
        console.error('Error awarding badge:', error);
        return false;
    }
}

/**
 * Update streak and check for streak badges
 */
export async function updateStreak(userId: string): Promise<{
    currentStreak: number;
    streakBonusXp: number;
    newBadges: string[];
}> {
    const gamification = await getOrCreateGamification(userId);
    const now = new Date();
    const lastActivity = gamification.lastActivityAt;

    let newStreak = 1;
    let streakBonusXp = 0;
    const newBadges: string[] = [];

    if (lastActivity) {
        const hoursSinceLastActivity = (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60);

        if (hoursSinceLastActivity < 24) {
            // Same day, keep streak
            newStreak = gamification.currentStreak;
        } else if (hoursSinceLastActivity < 48) {
            // Next day, increment streak
            newStreak = gamification.currentStreak + 1;

            // Streak bonuses
            if (newStreak === 3) {
                streakBonusXp = XP_REWARDS.streak_3_days;
                await awardBadge(gamification.id, 'streak_3');
                newBadges.push('streak_3');
            } else if (newStreak === 7) {
                streakBonusXp = XP_REWARDS.streak_7_days;
                await awardBadge(gamification.id, 'streak_7');
                newBadges.push('streak_7');
            } else if (newStreak === 14) {
                streakBonusXp = XP_REWARDS.streak_14_days;
                await awardBadge(gamification.id, 'streak_14');
                newBadges.push('streak_14');
            } else if (newStreak === 30) {
                streakBonusXp = XP_REWARDS.streak_30_days;
                await awardBadge(gamification.id, 'streak_30');
                newBadges.push('streak_30');
            }
        }
        // If more than 48 hours, streak resets to 1
    }

    const longestStreak = Math.max(newStreak, gamification.longestStreak);

    await prisma.userGamification.update({
        where: { id: gamification.id },
        data: {
            currentStreak: newStreak,
            longestStreak,
            lastActivityAt: now,
        },
    });

    // Award streak bonus XP if any
    if (streakBonusXp > 0) {
        await awardXp(userId, streakBonusXp, `streak_${newStreak}_days`);
    }

    return { currentStreak: newStreak, streakBonusXp, newBadges };
}

/**
 * Get user's gamification data with progress
 */
export async function getUserGamification() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return { success: false, error: 'Non authentifié' };
    }

    try {
        const gamification = await getOrCreateGamification(session.user.id);
        const progress = getXpProgress(gamification.totalXp);

        return {
            success: true,
            data: {
                ...gamification,
                ...progress,
                badges: gamification.badges.map((b) => ({
                    type: b.badgeType,
                    name: b.badgeName,
                    icon: b.badgeIcon,
                    description: b.description,
                    earnedAt: b.earnedAt,
                })),
                recentXp: gamification.xpHistory.map((x) => ({
                    amount: x.amount,
                    reason: x.reason,
                    createdAt: x.createdAt,
                })),
            },
        };
    } catch (error) {
        console.error('Error getting gamification:', error);
        return { success: false, error: 'Erreur lors de la récupération des données' };
    }
}

/**
 * Increment a stat counter and check for milestone badges
 */
export async function incrementStat(
    userId: string,
    stat: 'recipesRated' | 'recipesCooked' | 'mealsLogged' | 'weightLogsCount'
): Promise<{ newValue: number; newBadges: string[] }> {
    const gamification = await getOrCreateGamification(userId);
    const newValue = gamification[stat] + 1;
    const newBadges: string[] = [];

    await prisma.userGamification.update({
        where: { id: gamification.id },
        data: { [stat]: newValue },
    });

    // Check milestone badges
    if (stat === 'recipesRated') {
        if (newValue === 1) {
            await awardBadge(gamification.id, 'first_rating');
            newBadges.push('first_rating');
            await awardXp(userId, XP_REWARDS.first_rating, 'first_rating');
        }
        if (newValue === 5) {
            await awardBadge(gamification.id, 'ratings_5');
            newBadges.push('ratings_5');
            await awardXp(userId, XP_REWARDS.recipes_rated_5, 'recipes_rated_5');
        }
        if (newValue === 10) {
            await awardBadge(gamification.id, 'ratings_10');
            newBadges.push('ratings_10');
            await awardXp(userId, XP_REWARDS.recipes_rated_10, 'recipes_rated_10');
        }
        if (newValue === 25) {
            await awardBadge(gamification.id, 'ratings_25');
            newBadges.push('ratings_25');
            await awardXp(userId, XP_REWARDS.recipes_rated_25, 'recipes_rated_25');
        }
    }

    if (stat === 'recipesCooked') {
        if (newValue === 1) {
            await awardBadge(gamification.id, 'first_cook');
            newBadges.push('first_cook');
        }
        if (newValue === 5) {
            await awardBadge(gamification.id, 'cook_5');
            newBadges.push('cook_5');
        }
        if (newValue === 10) {
            await awardBadge(gamification.id, 'cook_10');
            newBadges.push('cook_10');
        }
    }

    if (stat === 'mealsLogged') {
        if (newValue === 1) {
            await awardXp(userId, XP_REWARDS.first_meal, 'first_meal');
        }
        if (newValue === 10) {
            await awardXp(userId, XP_REWARDS.meals_logged_10, 'meals_logged_10');
        }
        if (newValue === 50) {
            await awardXp(userId, XP_REWARDS.meals_logged_50, 'meals_logged_50');
        }
        if (newValue === 100) {
            await awardXp(userId, XP_REWARDS.meals_logged_100, 'meals_logged_100');
        }
    }

    return { newValue, newBadges };
}

/**
 * Get leaderboard (optional social feature)
 */
export async function getLeaderboard(limit: number = 10) {
    try {
        const leaders = await prisma.userGamification.findMany({
            take: limit,
            orderBy: { totalXp: 'desc' },
            select: {
                userId: true,
                totalXp: true,
                level: true,
                currentStreak: true,
            },
        });

        // Get user names
        const userIds = leaders.map((l) => l.userId);
        const users = await prisma.user.findMany({
            where: { id: { in: userIds } },
            select: { id: true, name: true, image: true },
        });

        const userMap = new Map(users.map((u) => [u.id, u]));

        return {
            success: true,
            leaders: leaders.map((l, index) => ({
                rank: index + 1,
                userId: l.userId,
                name: userMap.get(l.userId)?.name || 'Anonyme',
                image: userMap.get(l.userId)?.image,
                totalXp: l.totalXp,
                level: l.level,
                streak: l.currentStreak,
            })),
        };
    } catch (error) {
        console.error('Error getting leaderboard:', error);
        return { success: false, leaders: [] };
    }
}
