"use client";

import { useEffect } from 'react';
import { useSoloOnboardingStore, SoloOnboardingData, SportIntensity } from '@/store/onboarding-store';
import { useUserStore } from '@/store/user-store';
import { useRouter } from 'next/navigation';
import { ActivityLevel } from '@/types/user';
import { Loader2 } from 'lucide-react';

// ==========================================
// CALCUL DES BESOINS CALORIQUES
// ==========================================

// Coefficients d'activite (Mifflin-St Jeor)
const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
    sedentary: 1.2,      // Peu ou pas d'exercice
    light: 1.375,        // Exercice leger 1-3 jours/semaine
    moderate: 1.55,      // Exercice modere 3-5 jours/semaine
    active: 1.725,       // Exercice intense 6-7 jours/semaine
    athlete: 1.9,        // Entrainement tres intense biquotidien
};

// Calories brulees par heure de sport selon l'intensite (pour 70kg)
const SPORT_CALORIES_PER_HOUR: Record<SportIntensity, number> = {
    light: 300,
    moderate: 450,
    intense: 600,
};

// Calcul de l'age a partir de la date de naissance
function calculateAge(birthDate: string): number {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age;
}

// Formule de Mifflin-St Jeor
function calculateBMR(weight: number, height: number, age: number, gender: 'male' | 'female'): number {
    if (gender === 'male') {
        return 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
        return 10 * weight + 6.25 * height - 5 * age - 161;
    }
}

// Determine le niveau d'activite base sur la pratique sportive
function getActivityLevelFromSport(data: SoloOnboardingData): ActivityLevel {
    if (!data.doesSport || !data.sportFrequency) {
        return 'sedentary';
    }

    const frequency = data.sportFrequency;
    const intensity = data.sportIntensity || 'moderate';

    if (frequency <= 2) {
        return intensity === 'intense' ? 'light' : 'sedentary';
    } else if (frequency <= 4) {
        if (intensity === 'light') return 'light';
        if (intensity === 'moderate') return 'moderate';
        return 'active';
    } else if (frequency <= 6) {
        if (intensity === 'light') return 'moderate';
        if (intensity === 'moderate') return 'active';
        return 'athlete';
    } else {
        if (intensity === 'light') return 'active';
        return 'athlete';
    }
}

// Calcul complet des besoins nutritionnels
function calculateNutrition(data: SoloOnboardingData) {
    const weight = data.weight || 70;
    const height = data.height || 170;
    const age = data.birthDate ? calculateAge(data.birthDate) : 30;
    const genderForCalc: 'male' | 'female' = data.gender === 'female' ? 'female' : 'male';
    const activityLevel = getActivityLevelFromSport(data);
    const goal = data.goal || 'maintenance';

    // 1. Calcul du BMR
    const bmr = calculateBMR(weight, height, age, genderForCalc);

    // 2. Calcul du TDEE
    let tdee = bmr * ACTIVITY_MULTIPLIERS[activityLevel];

    // 3. Ajouter calories sport
    if (data.doesSport && data.sportFrequency && data.sportIntensity) {
        const caloriesPerHour = SPORT_CALORIES_PER_HOUR[data.sportIntensity] * (weight / 70);
        const weeklyExerciseCalories = caloriesPerHour * data.sportFrequency;
        const dailyExerciseCalories = weeklyExerciseCalories / 7;
        tdee += dailyExerciseCalories * 0.5;
    }

    // 4. Ajuster selon l'objectif
    let targetCalories = tdee;
    let proteinMultiplier = 1.6;
    let carbPercent = 45;

    switch (goal) {
        case 'weight_loss':
            targetCalories = tdee * 0.80;
            proteinMultiplier = 2.0;
            carbPercent = 35;
            break;
        case 'muscle_gain':
            targetCalories = tdee * 1.12;
            proteinMultiplier = 2.2;
            carbPercent = 45;
            break;
        case 'maintenance':
            targetCalories = tdee;
            proteinMultiplier = 1.6;
            carbPercent = 45;
            break;
        case 'health':
            targetCalories = tdee * 0.95;
            proteinMultiplier = 1.4;
            carbPercent = 45;
            break;
        case 'energy':
            targetCalories = tdee;
            proteinMultiplier = 1.4;
            carbPercent = 50;
            break;
    }

    // 5. Calcul des macronutriments
    const proteins = Math.round(weight * proteinMultiplier);
    const proteinCalories = proteins * 4;
    const proteinPercent = Math.round((proteinCalories / targetCalories) * 100);
    const adjustedFatPercent = 100 - proteinPercent - carbPercent;

    const carbCalories = (targetCalories * carbPercent) / 100;
    const carbs = Math.round(carbCalories / 4);

    const fatCalories = (targetCalories * adjustedFatPercent) / 100;
    const fats = Math.round(fatCalories / 9);

    targetCalories = Math.round(targetCalories);

    return {
        targetCalories,
        proteins,
        carbs,
        fats,
    };
}

// ==========================================
// COMPOSANT - Sauvegarde et redirection immediate
// ==========================================

export const StepAnalysis = () => {
    const router = useRouter();
    const { setSoloProfile, completeSoloOnboarding } = useUserStore();
    const { data: storeProfile } = useSoloOnboardingStore();

    useEffect(() => {
        // Calculer les besoins nutritionnels
        const results = calculateNutrition(storeProfile);

        // Calculer l'age
        const age = storeProfile.birthDate ? calculateAge(storeProfile.birthDate) : undefined;

        // Sauvegarder le profil complet
        setSoloProfile({
            ...storeProfile,
            age,
            dailyCaloriesTarget: results.targetCalories,
            proteinTarget: results.proteins,
            carbsTarget: results.carbs,
            fatTarget: results.fats,
            cookingTimeWeekday: storeProfile.cookingTimeWeekday,
            cookingTimeWeekend: storeProfile.cookingTimeWeekend,
            weeklyBudget: storeProfile.weeklyBudget,
            pricePreference: storeProfile.pricePreference,
            fastingSchedule: storeProfile.fastingSchedule,
        } as any);

        completeSoloOnboarding();

        // Reset onboarding store
        useSoloOnboardingStore.getState().reset();

        // Redirection immediate vers le dashboard
        router.push('/');
    }, [router, storeProfile, setSoloProfile, completeSoloOnboarding]);

    // Afficher un simple loader pendant la sauvegarde
    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 text-gray-900 animate-spin mb-4" />
            <p className="text-gray-500">Finalisation de votre profil...</p>
        </div>
    );
};
