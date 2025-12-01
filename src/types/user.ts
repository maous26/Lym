export type Gender = 'male' | 'female' | 'other';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'athlete';
export type Goal = 'weight_loss' | 'muscle_gain' | 'maintenance' | 'health' | 'energy';
export type DietType = 'omnivore' | 'vegetarian' | 'vegan' | 'pescatarian' | 'keto' | 'paleo';
export type CookingSkillLevel = 'beginner' | 'intermediate' | 'advanced';

// Types de jeûne intermittent
export type FastingType = 'none' | '16_8' | '18_6' | '20_4' | '5_2' | 'eat_stop_eat';

export interface FastingSchedule {
    type: FastingType;
    eatingWindowStart?: string; // Heure de début de la fenêtre alimentaire (ex: "12:00")
    eatingWindowEnd?: string;   // Heure de fin (ex: "20:00")
}

export interface ChildProfile {
    id: string;
    name: string;
    age: number;
    allergies: string[];
}

// Interface pour le feedback sur les repas/recettes
export interface MealFeedback {
    rating: number; // 1-5 étoiles
    taste?: number; // Goût 1-5
    difficulty?: number; // Difficulté 1-5
    wouldMakeAgain?: boolean;
    comment?: string;
    tags?: string[]; // ["trop_salé", "parfait", "manque_épices", etc.]
}

// Interface pour le feedback sur les plans de repas
export interface MealPlanFeedback {
    rating: number; // 1-5 étoiles
    variety?: number; // Variété 1-5
    practicality?: number; // Praticité 1-5
    satisfying?: boolean; // Rassasiant
    comment?: string;
    improvedMeals?: string[]; // IDs des repas améliorés/remplacés
}

export interface UserProfile {
    name: string;
    age: number | null;
    gender: Gender | null;
    height: number | null; // cm
    weight: number | null; // kg
    targetWeight: number | null; // kg
    activityLevel: ActivityLevel | null;
    primaryGoal: Goal | null;
    dietaryPreferences: DietType;
    allergies: string[];
    isParent: boolean;
    children: ChildProfile[];
    cookingTimePerDay: number; // minutes (deprecated, use cookingTimeWeekday/Weekend)

    // New fields
    weightLossGoalKg?: number; // Kilos to lose (only for weight_loss goal)
    suggestedDurationWeeks?: number; // AI-suggested duration based on goal
    cookingSkillLevel?: CookingSkillLevel; // Cooking expertise level
    cookingTimeWeekday?: number; // Minutes available for cooking on weekdays
    cookingTimeWeekend?: number; // Minutes available for cooking on weekends
    
    // Jeûne intermittent
    fastingSchedule?: FastingSchedule;
    
    // Budget courses
    weeklyBudget?: number; // Budget courses hebdomadaire en €
    pricePreference?: 'economy' | 'balanced' | 'premium'; // Gamme de prix préférée
}
