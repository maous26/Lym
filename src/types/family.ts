// Family Types for LYM Nutrition App - Complete Family Mode

import type { NutritionInfo, Micronutrients, MealType, Recipe, ShoppingCategory } from './meal';
import type { Gender, ActivityLevel, DietType, Goal, NutritionalNeeds } from './user';

// Age categories for nutritional calculations
export type AgeCategory = 'infant' | 'child' | 'teen' | 'adult' | 'senior';
export type MemberRole = 'admin' | 'parent' | 'child' | 'teen' | 'senior';
export type SubscriptionTier = 'starter' | 'plus' | 'premium';
export type MealPlanMode = 'unified' | 'hybrid' | 'individual';
export type MealPlanStatus = 'draft' | 'active' | 'completed' | 'archived';
export type InvitationStatus = 'pending' | 'accepted' | 'declined' | 'expired';
export type ChallengeStatus = 'active' | 'completed' | 'failed' | 'cancelled';
export type ChallengeType = 'nutrition' | 'ecology' | 'budget' | 'activity';
export type NotificationType = 'alert' | 'tip' | 'achievement' | 'reminder';
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';
export type NotificationCategory = 'nutrition' | 'health' | 'activity' | 'budget' | 'family';

// Utility functions
export function getAgeCategory(birthDate: string | Date): AgeCategory {
  const age = getAge(birthDate);
  if (age < 3) return 'infant';
  if (age < 12) return 'child';
  if (age < 18) return 'teen';
  if (age < 65) return 'adult';
  return 'senior';
}

export function getAge(birthDate: string | Date): number {
  const birth = typeof birthDate === 'string' ? new Date(birthDate) : birthDate;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

// Family entity
export interface Family {
  id: string;
  name: string;
  adminId: string;
  inviteCode: string;
  subscriptionTier: SubscriptionTier;
  weeklyBudget?: number;
  sharedGoals: string[];
  createdAt: string;
  updatedAt: string;
}

// Member medication
export interface Medication {
  name: string;
  dosage?: string;
  frequency?: string;
  interactions?: string[]; // foods to avoid
}

// Health tracking for members
export interface HealthTracking {
  conditions: string[];
  medications: Medication[];
  supplements: string[];
  lastCheckup?: string;
  notes?: string;
}

// Growth data for children
export interface GrowthMeasurement {
  date: string;
  height: number; // cm
  weight: number; // kg
  headCircumference?: number; // cm (for infants)
  bmi?: number;
  heightPercentile?: number;
  weightPercentile?: number;
  bmiPercentile?: number;
}

export interface GrowthData {
  measurements: GrowthMeasurement[];
  lastMeasurement?: GrowthMeasurement;
  growthCurve: 'normal' | 'above' | 'below';
}

// Complete family member profile
export interface FamilyMember {
  id: string;
  familyId: string;
  userId?: string; // linked user account

  // Identity
  firstName: string;
  lastName?: string;
  avatarUrl?: string;
  role: MemberRole;

  // Demographics
  birthDate: string;
  gender: Gender;
  ageCategory: AgeCategory;

  // Physical
  height?: number; // cm
  weight?: number; // kg
  targetWeight?: number; // kg

  // Activity
  activityLevel: ActivityLevel;
  sportsFrequency?: number;
  sportsTypes?: string[];

  // Nutritional needs (auto-calculated)
  nutritionalNeeds: NutritionalNeeds;

  // Medical
  allergies: string[];
  intolerances: string[];
  medicalConditions?: string[];
  healthTracking?: HealthTracking;

  // Preferences
  dietType: DietType;
  likedFoods: string[];
  dislikedFoods: string[];
  preferredCuisines?: string[];

  // For children
  growthData?: GrowthData;

  // Permissions
  canEditMealPlan: boolean;
  canSeeFamilyData: boolean;
  receiveNotifications: boolean;

  // Status
  isActive: boolean;
  joinedAt: string;
  lastActiveAt?: string;
}

// Meal details in plan
export interface MealIngredient {
  name: string;
  quantity: number;
  unit: string;
  category?: ShoppingCategory;
}

export interface MealDetails {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  recipeId?: string;
  recipe?: Recipe;
  nutrition: NutritionInfo;
  ingredients: MealIngredient[];
  prepTime: number;
  cookTime: number;
  servings: number;
}

// Shared meal with member adjustments
export interface SharedMeal {
  meal: MealDetails;
  memberPortions: {
    memberId: string;
    portionMultiplier: number; // 0.5, 1, 1.5, 2
    adjustedNutrition: NutritionInfo;
    isExcluded?: boolean;
    exclusionReason?: string;
  }[];
}

// Day meal plan
export interface DayMealPlan {
  date: string;
  breakfast?: SharedMeal;
  lunch?: SharedMeal;
  snack?: SharedMeal;
  dinner?: SharedMeal;
  totalNutritionByMember: {
    memberId: string;
    nutrition: NutritionInfo;
    percentageOfNeeds: number;
  }[];
}

// Member individual plan (for hybrid/individual modes)
export interface MemberMealPlan {
  memberId: string;
  memberName: string;
  days: DayMealPlan[];
  weeklyNutritionAverage: NutritionInfo;
  adherenceToNeeds: number; // percentage
}

// Plan preferences
export interface PlanPreferences {
  mode: MealPlanMode;
  maxPrepTimePerMeal: number;
  budgetPerWeek?: number;
  cuisinePreferences?: string[];
  varietyLevel: 'low' | 'medium' | 'high';
  mealPrepDays?: number[]; // 0-6
  leftoversAllowed: boolean;
}

// Family meal plan data
export interface FamilyMealPlanData {
  mode: MealPlanMode;
  unifiedPlan?: DayMealPlan[];
  memberPlans?: MemberMealPlan[];
  sharedMeals?: SharedMeal[];
}

// Complete family meal plan
export interface FamilyMealPlan {
  id: string;
  familyId: string;
  name?: string;
  startDate: string;
  endDate: string;
  status: MealPlanStatus;
  generatedBy: 'ai' | 'manual' | 'template';
  preferences: PlanPreferences;
  data: FamilyMealPlanData;
  estimatedBudget?: number;
  actualBudget?: number;
  varietyScore?: number;
  feedback?: FamilyMealPlanFeedback;
  createdAt: string;
  updatedAt: string;
}

export interface FamilyMealPlanFeedback {
  overallRating: 1 | 2 | 3 | 4 | 5;
  varietySatisfaction: 1 | 2 | 3 | 4 | 5;
  practicalitySatisfaction: 1 | 2 | 3 | 4 | 5;
  budgetSatisfaction: 1 | 2 | 3 | 4 | 5;
  memberFeedback: {
    memberId: string;
    rating: 1 | 2 | 3 | 4 | 5;
    comment?: string;
  }[];
  suggestions?: string;
}

// Shopping list item
export interface ShoppingItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: ShoppingCategory;
  estimatedPrice?: number;
  actualPrice?: number;
  isChecked: boolean;
  checkedAt?: string;
  checkedBy?: string;
  assignedTo?: string;
  notes?: string;
  fromMealPlan?: boolean;
}

// Family shopping list
export interface FamilyShoppingList {
  id: string;
  familyId: string;
  mealPlanId?: string;
  name?: string;
  items: ShoppingItem[];
  estimatedTotal: number;
  actualTotal?: number;
  status: 'active' | 'shopping' | 'completed' | 'archived';
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

// Member meal log
export interface FamilyMemberMealLog {
  id: string;
  familyId: string;
  memberId: string;
  date: string;
  mealType: MealType;
  plannedMealId?: string;
  actualMeal: {
    name: string;
    items: string[];
    photoUrl?: string;
    notes?: string;
  };
  nutrition: NutritionInfo;
  micronutrients?: Micronutrients;
  portionMultiplier: number;
  location: 'home' | 'school' | 'restaurant' | 'other';
  wasPlanned: boolean;
  createdAt: string;
}

// Member weight log (with growth tracking)
export interface FamilyMemberWeightLog {
  id: string;
  familyId: string;
  memberId: string;
  date: string;
  weight: number;
  height?: number;
  bmi?: number;
  bodyFat?: number;
  muscleMass?: number;
  // For children
  heightPercentile?: number;
  weightPercentile?: number;
  bmiPercentile?: number;
  source: 'manual' | 'smart_scale' | 'pediatrician';
  notes?: string;
}

// Challenge goal
export interface ChallengeGoal {
  type: 'count' | 'percentage' | 'streak';
  target: number;
  current: number;
  unit?: string;
}

// Challenge reward
export interface ChallengeReward {
  type: 'badge' | 'points' | 'prize';
  value: string | number;
  description: string;
}

// Family challenge
export interface FamilyChallenge {
  id: string;
  familyId: string;
  type: ChallengeType;
  title: string;
  description: string;
  goal: ChallengeGoal;
  reward?: ChallengeReward;
  participants: string[]; // member IDs
  startDate: string;
  endDate: string;
  status: ChallengeStatus;
  progress: number; // 0-100
  winnerId?: string;
  createdAt: string;
  completedAt?: string;
}

// Family invitation
export interface FamilyInvitation {
  id: string;
  familyId: string;
  invitedEmail: string;
  invitedRole: MemberRole;
  token: string;
  status: InvitationStatus;
  expiresAt: string;
  createdBy: string;
  createdAt: string;
  acceptedAt?: string;
}

// Family notification
export interface FamilyNotification {
  id: string;
  familyId: string;
  memberId?: string; // if targeted to specific member
  type: NotificationType;
  priority: NotificationPriority;
  category: NotificationCategory;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

// Health alert
export interface HealthAlert {
  memberId: string;
  memberName: string;
  category: 'nutrition' | 'weight' | 'growth' | 'activity';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  recommendations: string[];
  data?: Record<string, unknown>;
}

// Trend
export interface Trend {
  direction: 'up' | 'down' | 'stable';
  percentage: number;
  period: 'week' | 'month' | 'quarter';
}

// Member health score
export interface MemberHealthScore {
  memberId: string;
  memberName: string;
  overallScore: number; // 0-100
  nutritionScore: number;
  activityScore: number;
  consistencyScore: number;
  trends: {
    nutrition: Trend;
    weight: Trend;
    activity: Trend;
  };
  recommendations: string[];
}

// Family health dashboard
export interface FamilyHealthDashboard {
  familyId: string;
  generatedAt: string;
  memberScores: MemberHealthScore[];
  alerts: HealthAlert[];
  weeklyHighlights: string[];
  upcomingReminders: string[];
  budgetStatus?: {
    spent: number;
    budget: number;
    percentage: number;
    trend: Trend;
  };
}
