import { UserProfile } from '@/types/user';

export interface NutritionGoals {
    calories: number;
    proteins: number; // g
    carbs: number; // g
    fats: number; // g
    water: number; // ml
}

// Mifflin-St Jeor Equation for BMR
export const calculateBMR = (profile: UserProfile): number => {
    if (!profile.weight || !profile.height || !profile.age || !profile.gender) return 0;

    const { weight, height, age, gender } = profile;

    if (gender === 'male') {
        return 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
        return 10 * weight + 6.25 * height - 5 * age - 161;
    }
};

// Total Daily Energy Expenditure
export const calculateTDEE = (profile: UserProfile): number => {
    const bmr = calculateBMR(profile);

    const activityMultipliers = {
        sedentary: 1.2,
        light: 1.375,
        moderate: 1.55,
        active: 1.725,
        athlete: 1.9,
    };

    const multiplier = profile.activityLevel
        ? activityMultipliers[profile.activityLevel]
        : 1.2;

    return bmr * multiplier;
};

// Calculate nutrition goals based on user profile
export const calculateNutritionGoals = (profile: UserProfile): NutritionGoals => {
    let tdee = calculateTDEE(profile);

    // Adjust calories based on goal
    switch (profile.primaryGoal) {
        case 'weight_loss':
            tdee *= 0.8; // 20% deficit
            break;
        case 'muscle_gain':
            tdee *= 1.1; // 10% surplus
            break;
        case 'maintenance':
        case 'health':
        case 'energy':
        default:
            // Keep TDEE as is
            break;
    }

    // Macro distribution based on goal
    let proteinRatio = 0.3;
    let fatRatio = 0.25;
    let carbRatio = 0.45;

    if (profile.primaryGoal === 'muscle_gain') {
        proteinRatio = 0.35;
        fatRatio = 0.25;
        carbRatio = 0.4;
    } else if (profile.primaryGoal === 'weight_loss') {
        proteinRatio = 0.35;
        fatRatio = 0.3;
        carbRatio = 0.35;
    }

    // Adjust for diet type
    if (profile.dietaryPreferences === 'keto') {
        proteinRatio = 0.25;
        fatRatio = 0.7;
        carbRatio = 0.05;
    }

    const proteins = Math.round((tdee * proteinRatio) / 4); // 4 cal/g
    const fats = Math.round((tdee * fatRatio) / 9); // 9 cal/g
    const carbs = Math.round((tdee * carbRatio) / 4); // 4 cal/g

    const water = profile.weight ? profile.weight * 35 : 2000; // 35ml per kg

    return {
        calories: Math.round(tdee),
        proteins,
        carbs,
        fats,
        water,
    };
};

// Calculate BMI
export const calculateBMI = (weight: number, height: number): number => {
    const heightInMeters = height / 100;
    return weight / (heightInMeters * heightInMeters);
};

// Get BMI category
export const getBMICategory = (bmi: number): string => {
    if (bmi < 18.5) return 'Insuffisance pondérale';
    if (bmi < 25) return 'Poids normal';
    if (bmi < 30) return 'Surpoids';
    return 'Obésité';
};
