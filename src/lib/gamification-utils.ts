// ============================================
// XP REWARDS CONFIGURATION (easily scalable)
// ============================================
export const XP_REWARDS = {
    // Recipe actions
    rate_recipe: 10,
    rate_recipe_with_comment: 20,
    mark_recipe_cooked: 25,
    first_rating: 50,           // Bonus for first ever rating

    // Community recipe actions
    submit_video_recipe: 50,    // Submit a YouTube/Instagram recipe
    recipe_approved: 100,       // Recipe gets approved by moderation
    recipe_gets_5_ratings: 75,  // 5 people rated your recipe
    recipe_gets_10_ratings: 150, // 10 people rated your recipe

    // Meal logging
    log_meal: 15,
    log_all_meals_day: 50,      // Bonus for completing all 4 meals
    first_meal: 30,             // Bonus for first meal logged

    // Weight tracking
    log_weight: 10,
    weekly_weigh_in: 30,        // Bonus for consistent weekly tracking

    // Streaks
    streak_3_days: 25,
    streak_7_days: 75,
    streak_14_days: 150,
    streak_30_days: 500,

    // Milestones
    recipes_rated_5: 50,
    recipes_rated_10: 100,
    recipes_rated_25: 250,
    recipes_submitted_5: 100,   // Submitted 5 community recipes
    recipes_submitted_10: 250,  // Submitted 10 community recipes
    meals_logged_10: 75,
    meals_logged_50: 200,
    meals_logged_100: 500,
} as const;

// ============================================
// LEVEL THRESHOLDS (exponential scaling)
// ============================================
export function getXpForLevel(level: number): number {
    // Level 1: 0 XP, Level 2: 100 XP, Level 3: 250 XP, etc.
    // Formula: 50 * level^1.5
    return Math.floor(50 * Math.pow(level, 1.5));
}

export function getLevelFromXp(totalXp: number): number {
    let level = 1;
    while (getXpForLevel(level + 1) <= totalXp) {
        level++;
    }
    return level;
}

export function getXpProgress(totalXp: number): { level: number; currentXp: number; nextLevelXp: number; progress: number } {
    const level = getLevelFromXp(totalXp);
    const currentLevelXp = getXpForLevel(level);
    const nextLevelXp = getXpForLevel(level + 1);
    const xpInLevel = totalXp - currentLevelXp;
    const xpNeeded = nextLevelXp - currentLevelXp;

    return {
        level,
        currentXp: xpInLevel,
        nextLevelXp: xpNeeded,
        progress: Math.round((xpInLevel / xpNeeded) * 100),
    };
}

// ============================================
// BADGES CONFIGURATION
// ============================================
export const BADGES = {
    // Rating badges
    first_rating: { name: 'Critique Culinaire', icon: '⭐', description: 'Première note donnée' },
    ratings_5: { name: 'Gourmet Amateur', icon: '🍴', description: '5 recettes notées' },
    ratings_10: { name: 'Fin Gourmet', icon: '🥄', description: '10 recettes notées' },
    ratings_25: { name: 'Chef Critique', icon: '👨‍🍳', description: '25 recettes notées' },

    // Cooking badges
    first_cook: { name: 'Premier Plat', icon: '🍳', description: 'Première recette cuisinée' },
    cook_5: { name: 'Cuisinier Régulier', icon: '🥘', description: '5 recettes cuisinées' },
    cook_10: { name: 'Chef Maison', icon: '🍲', description: '10 recettes cuisinées' },

    // Community badges
    first_submission: { name: 'Contributeur', icon: '📤', description: 'Première recette partagée' },
    submissions_5: { name: 'Créateur', icon: '🎬', description: '5 recettes partagées' },
    submissions_10: { name: 'Influenceur', icon: '🌟', description: '10 recettes partagées' },

    // Streak badges
    streak_3: { name: 'Régulier', icon: '🔥', description: '3 jours consécutifs' },
    streak_7: { name: 'Semaine Parfaite', icon: '💪', description: '7 jours consécutifs' },
    streak_14: { name: 'Deux Semaines', icon: '🏆', description: '14 jours consécutifs' },
    streak_30: { name: 'Mois Complet', icon: '👑', description: '30 jours consécutifs' },

    // Level badges
    level_5: { name: 'Niveau 5', icon: '🌟', description: 'Atteindre le niveau 5' },
    level_10: { name: 'Niveau 10', icon: '💫', description: 'Atteindre le niveau 10' },
    level_25: { name: 'Expert', icon: '🎯', description: 'Atteindre le niveau 25' },

    // Special badges
    all_meals_week: { name: 'Semaine Complète', icon: '📅', description: 'Tous les repas logués pendant 7 jours' },
    healthy_week: { name: 'Semaine Healthy', icon: '🥗', description: 'Objectifs atteints 7 jours de suite' },
} as const;

export type BadgeType = keyof typeof BADGES;
