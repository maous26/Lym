// ==========================================
// TYPES MODE FAMILLE - ARCHITECTURE PROFESSIONNELLE
// ==========================================

// Âges physiologiques (pour calculs nutritionnels)
export type AgeCategory = 'infant' | 'child' | 'teen' | 'adult' | 'senior';
export type MemberRole = 'admin' | 'parent' | 'child' | 'teen' | 'senior';
export type SubscriptionTier = 'starter' | 'plus' | 'premium';

// Plans meal planning
export type MealPlanMode = 'unified' | 'hybrid' | 'individual';
export type MealPlanStatus = 'draft' | 'active' | 'completed' | 'archived';

// Statuts et états
export type InvitationStatus = 'pending' | 'accepted' | 'declined' | 'expired';
export type ChallengeStatus = 'active' | 'completed' | 'failed' | 'cancelled';
export type ChallengeType = 'nutrition' | 'ecology' | 'budget' | 'activity';

// ==========================================
// INTERFACES PRINCIPALES
// ==========================================

export interface Family {
    id: string;
    name: string;
    adminId: string;
    maxMembers: number;
    subscriptionTier: SubscriptionTier;
    weeklyBudget?: number;
    sharedGoals?: string[];
    inviteCode: string;
    invitesUsed: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface FamilyMember {
    id: string;
    familyId: string;
    userId: string;
    
    // Identité
    firstName: string;
    nickname?: string;
    avatarUrl?: string;
    
    // Profil démographique
    birthDate: Date;
    gender: 'male' | 'female' | 'other';
    role: MemberRole;
    
    // Anthropométrie
    height?: number;        // cm
    weight?: number;        // kg
    targetWeight?: number;  // kg
    
    // Activité
    activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'athlete';
    sportsFrequency?: number;
    
    // Objectifs nutritionnels
    primaryGoal?: 'weight_loss' | 'muscle_gain' | 'maintenance' | 'growth';
    targetCalories?: number;
    targetProteins?: number;
    targetCarbs?: number;
    targetFats?: number;
    
    // Santé
    allergies?: string[];
    intolerances?: string[];
    medicalConditions?: string[];
    medications?: Medication[];
    
    // Préférences
    dietType: 'omnivore' | 'vegetarian' | 'vegan' | 'pescatarian' | 'keto' | 'paleo';
    likedFoods?: string[];
    dislikedFoods?: string[];
    
    // Tracking santé
    healthTracking?: HealthTracking;
    growthData?: GrowthData;
    
    // Permissions
    canEditMealPlan: boolean;
    canSeeFamilyData: boolean;
    receiveNotifications: boolean;
    isActive: boolean;
    
    // Timestamps
    joinedAt: Date;
    lastActiveAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface Medication {
    name: string;
    dosage?: string;
    frequency?: string;
    nutritionImpact?: string; // Ex: "Augmente besoin en vitamine D"
}

export interface HealthTracking {
    lastCheckup?: Date;
    bloodPressure?: { systolic: number; diastolic: number };
    glucose?: number;          // mg/dL
    cholesterol?: {
        total?: number;
        hdl?: number;
        ldl?: number;
    };
}

export interface GrowthData {
    measurements: GrowthMeasurement[];
    percentiles?: {
        weight?: number;
        height?: number;
        bmi?: number;
    };
}

export interface GrowthMeasurement {
    date: Date;
    weight: number;
    height: number;
    bmi?: number;
    ageMonths: number;
}

// ==========================================
// MEAL PLANNING FAMILIAL
// ==========================================

export interface FamilyMealPlan {
    id: string;
    familyId: string;
    name: string;
    planMode: MealPlanMode;
    
    // Période
    startDate: Date;
    endDate: Date;
    
    // Configuration
    mealsPerDay: number;
    daysCount: number;
    
    // Données structurées
    planData: FamilyMealPlanData;
    
    // Objectifs
    totalBudget?: number;
    targetVariety?: number;
    preferences?: PlanPreferences;
    
    // Stats
    totalCalories?: number;
    estimatedCost?: number;
    varietyScore?: number;
    nutritionalBalance?: number;
    
    // Statut
    status: MealPlanStatus;
    generatedBy?: 'ai' | 'manual' | 'template';
    
    // Feedback
    rating?: number;
    feedback?: string;
    
    createdAt: Date;
    updatedAt: Date;
}

export interface FamilyMealPlanData {
    members: {
        [memberId: string]: MemberMealPlan;
    };
    sharedMeals?: SharedMeal[];  // Repas en commun
}

export interface MemberMealPlan {
    memberId: string;
    targetCalories: number;
    days: DayMealPlan[];
}

export interface DayMealPlan {
    dayIndex: number;           // 0-6 (Lundi-Dimanche)
    date: Date;
    meals: {
        breakfast?: MealDetails;
        lunch?: MealDetails;
        snack?: MealDetails;
        dinner?: MealDetails;
    };
    totalCalories: number;
    totalProteins: number;
    totalCarbs: number;
    totalFats: number;
}

export interface MealDetails {
    id: string;
    recipeId?: string;
    name: string;
    description?: string;
    
    // Nutrition (ajustée pour la portion du membre)
    calories: number;
    proteins: number;
    carbs: number;
    fats: number;
    fiber?: number;
    
    // Portion
    portionSize: number;        // Ex: 1.0 = portion standard
    portionUnit?: string;       // "g", "ml", "portion"
    
    // Composition
    ingredients: MealIngredient[];
    instructions?: string[];
    
    // Métadonnées
    prepTime?: number;
    cookTime?: number;
    imageUrl?: string;
    tags?: string[];
    
    // Pour famille
    isShared: boolean;          // Repas en commun vs individuel
    sharedWith?: string[];      // memberIds si partiel
}

export interface MealIngredient {
    name: string;
    quantity: number;
    unit: string;
    category?: string;
    isOptional?: boolean;
}

export interface SharedMeal {
    mealId: string;
    mealType: 'breakfast' | 'lunch' | 'snack' | 'dinner';
    dayIndex: number;
    recipe: MealDetails;
    portions: {
        [memberId: string]: {
            portionSize: number;
            calories: number;
        };
    };
}

export interface PlanPreferences {
    avoidWaste?: boolean;
    localProducts?: boolean;
    seasonal?: boolean;
    quickPrep?: boolean;        // Privilégier recettes rapides
    batchCooking?: boolean;     // Cuisine en grande quantité
    freezerFriendly?: boolean;
}

// ==========================================
// LISTE DE COURSES
// ==========================================

export interface FamilyShoppingList {
    id: string;
    familyId: string;
    name: string;
    weekStartDate: Date;
    
    items: ShoppingItem[];
    categories?: string[];
    
    estimatedCost?: number;
    actualCost?: number;
    
    sharedWith?: string[];
    lastModifiedBy?: string;
    
    status: 'active' | 'shopping' | 'completed' | 'archived';
    completedAt?: Date;
    
    createdAt: Date;
    updatedAt: Date;
}

export interface ShoppingItem {
    id: string;
    ingredient: string;
    quantity: number;
    unit: string;
    category: string;           // "Fruits & Légumes", "Viandes", etc.
    
    // Collaboration
    checked: boolean;
    checkedBy?: string;
    checkedAt?: Date;
    assignedTo?: string;        // memberId
    
    // Prix
    estimatedPrice?: number;
    actualPrice?: number;
    
    // Métadonnées
    fromRecipes?: string[];     // recipeIds sources
    priority?: 'essential' | 'normal' | 'optional';
    notes?: string;
}

// ==========================================
// JOURNAL ALIMENTAIRE & SUIVI
// ==========================================

export interface FamilyMemberMealLog {
    id: string;
    memberId: string;
    
    mealDate: Date;
    mealType: 'breakfast' | 'lunch' | 'snack' | 'dinner';
    mealName: string;
    
    // Macros
    calories: number;
    proteins: number;
    carbs: number;
    fats: number;
    fiber?: number;
    sugar?: number;
    salt?: number;              // mg
    
    // Micronutriments (pour alertes médicales)
    calcium?: number;           // mg
    iron?: number;              // mg
    vitaminD?: number;          // UI
    vitaminC?: number;          // mg
    
    // Contexte
    portion: number;
    location?: 'home' | 'school' | 'restaurant' | 'other';
    wasPlanned: boolean;
    
    // Feedback
    liked?: boolean;
    comment?: string;
    photoUrl?: string;
    
    createdAt: Date;
}

export interface FamilyMemberWeightLog {
    id: string;
    memberId: string;
    
    measuredAt: Date;
    weight: number;             // kg
    height?: number;            // cm
    
    // Composition corporelle
    bodyFat?: number;           // %
    muscleMass?: number;        // %
    bmi?: number;
    
    // Croissance (enfants)
    growthPercentile?: number;
    heightPercentile?: number;
    
    source: 'manual' | 'smart_scale' | 'pediatrician';
    notes?: string;
    
    createdAt: Date;
}

// ==========================================
// GAMIFICATION
// ==========================================

export interface FamilyChallenge {
    id: string;
    familyId: string;
    
    title: string;
    description?: string;
    type: ChallengeType;
    icon?: string;
    
    startDate: Date;
    endDate: Date;
    
    goal: ChallengeGoal;
    reward?: ChallengeReward;
    
    participants: string[];     // memberIds ou "all"
    
    progress: number;           // 0-100
    status: ChallengeStatus;
    
    completedAt?: Date;
    winner?: string;
    
    createdAt: Date;
    updatedAt: Date;
}

export interface ChallengeGoal {
    type: string;               // "reduce_waste", "eat_vegetables", "save_money", etc.
    target: number;
    current: number;
    unit: string;
}

export interface ChallengeReward {
    type: 'badge' | 'points' | 'real_prize';
    value?: string | number;
    description?: string;
}

// ==========================================
// INVITATIONS
// ==========================================

export interface FamilyInvitation {
    id: string;
    familyId: string;
    
    email: string;
    firstName?: string;
    role: string;
    
    token: string;
    expiresAt: Date;
    
    status: InvitationStatus;
    acceptedAt?: Date;
    declinedAt?: Date;
    
    sentBy: string;
    message?: string;
    
    createdAt: Date;
    updatedAt: Date;
}

// ==========================================
// NOTIFICATIONS
// ==========================================

export interface FamilyNotification {
    id: string;
    familyId: string;
    memberId?: string;
    
    type: 'alert' | 'tip' | 'achievement' | 'reminder';
    title: string;
    message: string;
    icon?: string;
    
    priority: 'low' | 'normal' | 'high' | 'urgent';
    category: 'nutrition' | 'health' | 'activity' | 'budget';
    
    actionUrl?: string;
    actionLabel?: string;
    
    isRead: boolean;
    readAt?: Date;
    
    createdAt: Date;
}

// ==========================================
// CALCULS NUTRITIONNELS (ANC FRANCE)
// ==========================================

export interface NutritionalNeeds {
    age: number;
    ageCategory: AgeCategory;
    gender: 'male' | 'female' | 'other';
    weight: number;
    height: number;
    activityLevel: string;
    
    // Besoins calculés
    calories: number;
    proteins: number;           // g
    carbs: number;              // g
    fats: number;               // g
    fiber: number;              // g
    
    // Micronutriments clés
    calcium: number;            // mg
    iron: number;               // mg
    vitaminD: number;           // UI
    vitaminC: number;           // mg
    vitaminB12: number;         // µg
    zinc: number;               // mg
    omega3: number;             // mg
}

// Fonction utilitaire pour calculer la catégorie d'âge
export function getAgeCategory(birthDate: Date): AgeCategory {
    const age = getAge(birthDate);
    if (age < 3) return 'infant';
    if (age < 11) return 'child';
    if (age < 18) return 'teen';
    if (age < 65) return 'adult';
    return 'senior';
}

// Calcul âge précis
export function getAge(birthDate: Date): number {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

// ==========================================
// ANALYTICS & INSIGHTS
// ==========================================

export interface FamilyHealthDashboard {
    familyId: string;
    period: { start: Date; end: Date };
    
    // Score global famille (0-100)
    overallHealthScore: number;
    
    // Par membre
    memberScores: {
        [memberId: string]: MemberHealthScore;
    };
    
    // Statistiques globales
    averageCalories: number;
    nutritionalBalance: number;
    varietyScore: number;
    budgetUsed: number;
    budgetTarget: number;
    
    // Alertes
    alerts: HealthAlert[];
    
    // Tendances
    trends: {
        weight?: Trend;
        nutrition?: Trend;
        activity?: Trend;
    };
}

export interface MemberHealthScore {
    memberId: string;
    score: number;              // 0-100
    
    caloriesAdherence: number;  // % respect objectif
    macrosBalance: number;      // Équilibre protéines/glucides/lipides
    micronutrientsStatus: {
        [nutrient: string]: 'low' | 'adequate' | 'high';
    };
    
    weight Trend?: 'increasing' | 'stable' | 'decreasing';
    alerts: string[];
}

export interface HealthAlert {
    type: 'warning' | 'info' | 'urgent';
    category: 'nutrition' | 'growth' | 'weight' | 'activity';
    memberId?: string;
    title: string;
    message: string;
    recommendation?: string;
    createdAt: Date;
}

export interface Trend {
    direction: 'up' | 'down' | 'stable';
    change: number;             // Valeur numérique du changement
    percentage?: number;        // % de changement
    isPositive: boolean;        // Si tendance est bonne ou mauvaise
}


