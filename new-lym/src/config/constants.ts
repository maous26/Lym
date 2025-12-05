// Application
export const APP_NAME = 'LYM';
export const APP_DESCRIPTION = 'Votre coach nutrition personnel';
export const APP_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';

// Nutrition defaults
export const DEFAULT_CALORIES = 2000;
export const DEFAULT_PROTEIN_RATIO = 0.25; // 25% des calories
export const DEFAULT_CARBS_RATIO = 0.50;   // 50% des calories
export const DEFAULT_FAT_RATIO = 0.25;     // 25% des calories

// Calories per gram
export const CALORIES_PER_GRAM = {
  protein: 4,
  carbs: 4,
  fat: 9,
};

// Activity level multipliers (PAL - Physical Activity Level)
export const ACTIVITY_MULTIPLIERS = {
  SEDENTARY: 1.2,      // Peu ou pas d'exercice
  LIGHT: 1.375,        // Exercice léger 1-3 jours/semaine
  MODERATE: 1.55,      // Exercice modéré 3-5 jours/semaine
  ACTIVE: 1.725,       // Exercice intense 6-7 jours/semaine
  VERY_ACTIVE: 1.9,    // Exercice très intense + travail physique
};

// Goal adjustments (calories)
export const GOAL_ADJUSTMENTS = {
  LOSE_WEIGHT: -500,   // Déficit de 500 kcal/jour
  MAINTAIN: 0,
  GAIN_MUSCLE: 300,    // Surplus de 300 kcal/jour
};

// Meal types labels
export const MEAL_TYPE_LABELS = {
  BREAKFAST: 'Petit-déjeuner',
  LUNCH: 'Déjeuner',
  DINNER: 'Dîner',
  SNACK: 'Collation',
};

// Days of the week
export const DAYS_OF_WEEK = [
  'Lundi',
  'Mardi',
  'Mercredi',
  'Jeudi',
  'Vendredi',
  'Samedi',
  'Dimanche',
];

// Family
export const MAX_FAMILY_MEMBERS = 6;
export const MIN_FAMILY_MEMBERS = 2;

// Pagination
export const DEFAULT_PAGE_SIZE = 20;

// Cache TTL (in seconds)
export const CACHE_TTL = {
  recipes: 3600,      // 1 hour
  mealPlans: 1800,    // 30 minutes
  userProfile: 300,   // 5 minutes
};
