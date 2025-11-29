export type Gender = 'male' | 'female' | 'other';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'athlete';
export type Goal = 'weight_loss' | 'muscle_gain' | 'maintenance' | 'health' | 'energy';
export type DietType = 'omnivore' | 'vegetarian' | 'vegan' | 'pescatarian' | 'keto' | 'paleo';

export interface ChildProfile {
    id: string;
    name: string;
    age: number;
    allergies: string[];
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
    cookingTimePerDay: number; // minutes
}
