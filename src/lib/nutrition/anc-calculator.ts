/**
 * CALCULATEUR ANC (Apports Nutritionnels Conseillés)
 * Basé sur les recommandations ANSES (Agence Nationale de Sécurité Sanitaire)
 * 
 * Médecin Nutritionniste - Niveau Professionnel
 */

import { getAge, getAgeCategory, type AgeCategory } from '@/types/family';

// ==========================================
// CONSTANTES ANSES (France)
// ==========================================

// Besoins en Calcium (mg/jour) - Critique pour ossification
const CALCIUM_NEEDS: Record<AgeCategory, number> = {
    infant: 500,   // 0-3 ans
    child: 800,    // 3-10 ans
    teen: 1200,    // 11-17 ans (pic masse osseuse)
    adult: 950,    // 18-64 ans
    senior: 1200,  // 65+ (prévention ostéoporose)
};

// Besoins en Fer (mg/jour) - Anémie fréquente
const IRON_NEEDS = {
    child_male: 7,
    child_female: 7,
    teen_male: 11,
    teen_female: 16,  // Menstruations
    adult_male: 11,
    adult_female: 16,
    adult_female_post_menopause: 11,
    senior: 10,
};

// Besoins en Vitamine D (UI/jour) - Soleil insuffisant en France
const VITAMIN_D_NEEDS: Record<AgeCategory, number> = {
    infant: 400,
    child: 400,
    teen: 400,
    adult: 400,
    senior: 800,   // Absorption diminuée
};

// Besoins en protéines (g/kg/jour)
const PROTEIN_NEEDS_PER_KG: Record<AgeCategory, number> = {
    infant: 1.2,
    child: 1.0,
    teen: 0.9,
    adult: 0.8,
    senior: 1.0,   // Prévention sarcopénie (perte musculaire)
};

// ==========================================
// CALCULATEUR PRINCIPAL
// ==========================================

export interface NutritionalProfile {
    // Besoins énergétiques
    bmr: number;               // Métabolisme de base
    tdee: number;              // Dépense énergétique totale
    targetCalories: number;    // Objectif selon goal
    
    // Macronutriments (g/jour)
    proteins: number;
    carbs: number;
    fats: number;
    fiber: number;
    
    // Micronutriments critiques (mg ou UI/jour)
    calcium: number;
    iron: number;
    vitaminD: number;
    vitaminC: number;
    vitaminB12: number;
    zinc: number;
    magnesium: number;
    potassium: number;
    omega3: number;
    
    // Hydratation (L/jour)
    water: number;
}

/**
 * Calculer le profil nutritionnel complet
 */
export function calculateCompleteNutritionalProfile(params: {
    birthDate: Date;
    gender: 'male' | 'female' | 'other';
    weight: number;             // kg
    height: number;             // cm
    activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'athlete';
    goal?: 'weight_loss' | 'muscle_gain' | 'maintenance' | 'growth';
    targetWeight?: number;      // kg (si weight_loss ou muscle_gain)
}): NutritionalProfile {
    const age = getAge(params.birthDate);
    const ageCategory = getAgeCategory(params.birthDate);
    const { gender, weight, height, activityLevel, goal } = params;

    // 1. MÉTABOLISME DE BASE (Mifflin-St Jeor - Gold Standard)
    let bmr: number;
    if (gender === 'male') {
        bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else if (gender === 'female') {
        bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    } else {
        // Moyenne homme-femme
        bmr = 10 * weight + 6.25 * height - 5 * age - 78;
    }

    // 2. DÉPENSE ÉNERGÉTIQUE TOTALE (TDEE)
    const activityFactors = {
        sedentary: 1.2,    // Bureau, peu d'exercice
        light: 1.375,      // Exercice léger 1-3x/sem
        moderate: 1.55,    // Exercice modéré 3-5x/sem
        active: 1.725,     // Exercice intense 6-7x/sem
        athlete: 1.9,      // Athlète, 2x/jour
    };

    let tdee = bmr * activityFactors[activityLevel];

    // 3. AJUSTEMENTS SELON ÂGE

    if (ageCategory === 'child') {
        // Enfants : Courbe de croissance + activité naturelle élevée
        const baseCalories = 1000 + (age * 100); // Règle empirique
        tdee = Math.max(baseCalories, tdee);
    } else if (ageCategory === 'teen') {
        // Adolescents : Pic de croissance (besoin ++++)
        const growthBonus = gender === 'male' ? 300 : 200;
        tdee += growthBonus;
    } else if (ageCategory === 'senior') {
        // Seniors : Métabolisme ralenti (-10%)
        tdee *= 0.9;
    }

    // 4. AJUSTEMENTS SELON OBJECTIF
    let targetCalories = Math.round(tdee);

    if (goal === 'weight_loss') {
        // Déficit raisonnable : -500 kcal/jour = -0,5kg/sem
        targetCalories -= 500;
        // Minimum 1200 kcal/jour (femmes) ou 1500 (hommes)
        const minCalories = gender === 'female' ? 1200 : 1500;
        targetCalories = Math.max(targetCalories, minCalories);
    } else if (goal === 'muscle_gain') {
        // Surplus : +300-500 kcal/jour
        targetCalories += 400;
    } else if (goal === 'growth' && ageCategory === 'child') {
        // Croissance : pas de restriction
        targetCalories = Math.round(tdee);
    }

    // 5. MACRONUTRIMENTS

    // Protéines (g/jour)
    const proteinPerKg = PROTEIN_NEEDS_PER_KG[ageCategory];
    let proteins = Math.round(weight * proteinPerKg);

    // Ajustement si prise de muscle
    if (goal === 'muscle_gain') {
        proteins = Math.round(weight * 1.6); // 1,6 g/kg pour hypertrophie
    }

    // Lipides (25-35% des calories, optimal 30%)
    const fatsCalories = targetCalories * 0.30;
    const fats = Math.round(fatsCalories / 9); // 9 kcal/g

    // Glucides (reste des calories)
    const remainingCalories = targetCalories - (proteins * 4) - (fats * 9);
    const carbs = Math.round(remainingCalories / 4); // 4 kcal/g

    // Fibres (14g pour 1000 kcal - ANSES)
    const fiber = Math.round((targetCalories / 1000) * 14);

    // 6. MICRONUTRIMENTS CRITIQUES

    // Calcium
    const calcium = CALCIUM_NEEDS[ageCategory];

    // Fer
    const iron = calculateIronNeeds(age, gender, ageCategory);

    // Vitamine D
    const vitaminD = VITAMIN_D_NEEDS[ageCategory];

    // Vitamine C (110mg/j adulte)
    const vitaminC = ageCategory === 'child' ? 100 : 110;

    // Vitamine B12 (2,4 µg/j)
    const vitaminB12 = ageCategory === 'senior' ? 3.0 : 2.4; // + élevé seniors

    // Zinc
    const zinc = gender === 'male' ? 11 : 8;

    // Magnésium
    const magnesium = gender === 'male' ? 420 : 360;

    // Potassium
    const potassium = 3500; // 3,5g/jour

    // Oméga-3 (DHA + EPA)
    const omega3 = ageCategory === 'child' || ageCategory === 'teen' ? 250 : 500;

    // 7. HYDRATATION
    // Règle : 30-40 ml/kg (selon activité)
    const waterBase = weight * 0.035; // 35 ml/kg
    const water = activityLevel === 'active' || activityLevel === 'athlete'
        ? waterBase * 1.3
        : waterBase;

    return {
        bmr: Math.round(bmr),
        tdee: Math.round(tdee),
        targetCalories,
        proteins,
        carbs,
        fats,
        fiber,
        calcium,
        iron,
        vitaminD,
        vitaminC,
        vitaminB12,
        zinc,
        magnesium,
        potassium,
        omega3,
        water: Math.round(water * 10) / 10,
    };
}

/**
 * Calculer besoins en Fer (complexe selon genre et âge)
 */
function calculateIronNeeds(age: number, gender: string, ageCategory: AgeCategory): number {
    if (ageCategory === 'child') {
        return age < 7 ? 7 : 8;
    }
    
    if (ageCategory === 'teen') {
        return gender === 'female' ? 16 : 11; // Menstruations
    }
    
    if (ageCategory === 'adult') {
        if (gender === 'female') {
            return age < 50 ? 16 : 11; // Post-ménopause
        }
        return 11;
    }
    
    return 10; // Seniors
}

/**
 * Vérifier si un membre a des carences potentielles
 */
export function detectNutritionalDeficiencies(params: {
    member: any;
    recentMealLogs: any[];
}): string[] {
    const deficiencies: string[] = [];
    const { member, recentMealLogs } = params;

    if (recentMealLogs.length === 0) {
        return ['Pas assez de données pour analyse'];
    }

    // Calculer moyennes
    const avgCalcium = recentMealLogs.reduce((s, l) => s + (l.calcium || 0), 0) / recentMealLogs.length;
    const avgIron = recentMealLogs.reduce((s, l) => s + (l.iron || 0), 0) / recentMealLogs.length;
    const avgVitaminD = recentMealLogs.reduce((s, l) => s + (l.vitaminD || 0), 0) / recentMealLogs.length;

    const ageCategory = getAgeCategory(member.birthDate);
    const needs = CALCIUM_NEEDS[ageCategory];

    // Détection carences
    if (avgCalcium < needs * 0.7) {
        deficiencies.push(`Calcium faible (${Math.round(avgCalcium)}mg vs ${needs}mg recommandés)`);
    }
    
    if (avgIron < 8 * 0.7) {
        deficiencies.push('Fer possiblement faible - Risque anémie');
    }
    
    if (avgVitaminD < 400 * 0.7) {
        deficiencies.push('Vitamine D faible - Exposition soleil insuffisante');
    }

    return deficiencies;
}

/**
 * Générer recommandations alimentaires personnalisées
 */
export function generateFoodRecommendations(profile: NutritionalProfile, ageCategory: AgeCategory): string[] {
    const recommendations: string[] = [];

    if (ageCategory === 'child') {
        recommendations.push('🥛 3 produits laitiers/jour pour le calcium');
        recommendations.push('🍎 Au moins 5 fruits et légumes variés');
        recommendations.push('🐟 Poisson 2x/semaine (Oméga-3 pour le cerveau)');
        recommendations.push('💧 Eau à volonté, éviter sodas');
    } else if (ageCategory === 'teen') {
        recommendations.push('🥩 Viande rouge 2-3x/semaine (fer pour croissance)');
        recommendations.push('🥚 Protéines à chaque repas (muscles + croissance)');
        recommendations.push('🥛 4 produits laitiers/jour (pic masse osseuse)');
        recommendations.push('🥜 Oléagineux pour zinc et magnésium');
    } else if (ageCategory === 'adult') {
        recommendations.push('🥗 5 portions fruits & légumes/jour minimum');
        recommendations.push('🌾 Privilégier céréales complètes (fibres)');
        recommendations.push('🐟 Poissons gras 2x/semaine (Oméga-3)');
        recommendations.push('💧 1,5-2L eau/jour');
    } else if (ageCategory === 'senior') {
        recommendations.push('🥩 Protéines à chaque repas (prévention sarcopénie)');
        recommendations.push('🥛 3-4 produits laitiers/jour (calcium + vitamine D)');
        recommendations.push('💧 1,5-2L eau/jour (sensation soif diminuée)');
        recommendations.push('🥦 Légumes verts (vitamine K pour os)');
        recommendations.push('🍊 Agrumes quotidiens (vitamine C pour absorption fer)');
    }

    return recommendations;
}

/**
 * Calculer l'IMC et interpréter selon l'âge
 */
export function calculateBMI(weight: number, height: number): {
    bmi: number;
    category: string;
    interpretation: string;
} {
    const bmi = weight / Math.pow(height / 100, 2);
    
    let category: string;
    let interpretation: string;

    if (bmi < 18.5) {
        category = 'Maigreur';
        interpretation = 'Poids insuffisant. Consultez un professionnel de santé.';
    } else if (bmi < 25) {
        category = 'Normal';
        interpretation = 'Poids idéal. Continuez votre équilibre alimentaire.';
    } else if (bmi < 30) {
        category = 'Surpoids';
        interpretation = 'Surpoids léger. Rééquilibrage alimentaire recommandé.';
    } else if (bmi < 35) {
        category = 'Obésité modérée';
        interpretation = 'Suivi médical recommandé pour perte de poids progressive.';
    } else {
        category = 'Obésité sévère';
        interpretation = 'Suivi médical indispensable. Accompagnement nutritionniste.';
    }

    return {
        bmi: Math.round(bmi * 10) / 10,
        category,
        interpretation,
    };
}

/**
 * Vérifier les interactions médicaments-nutrition
 */
export function checkMedicationInteractions(medications: string[]): string[] {
    const interactions: string[] = [];

    const commonInteractions: Record<string, string> = {
        'metformine': 'Peut diminuer absorption vitamine B12 - Surveillance nécessaire',
        'statine': 'Éviter pamplemousse - Interaction métabolisme',
        'warfarine': 'Attention vitamine K (choux, épinards) - Surveillance INR',
        'levothyrox': 'Prendre à jeun, 30min avant petit-déjeuner',
        'ibuprofen': 'Augmente risque gastrite - Prendre au repas',
        'corticoïde': 'Augmente besoin en calcium et vitamine D',
    };

    medications.forEach(med => {
        const medLower = med.toLowerCase();
        Object.entries(commonInteractions).forEach(([drug, interaction]) => {
            if (medLower.includes(drug)) {
                interactions.push(`${med}: ${interaction}`);
            }
        });
    });

    return interactions;
}

/**
 * Détecter allergies croisées (important!)
 */
export function detectCrossAllergies(allergies: string[]): string[] {
    const crossAllergies: string[] = [];

    const crossReactions: Record<string, string[]> = {
        'latex': ['avocat', 'banane', 'kiwi', 'châtaigne', 'tomate'],
        'bouleau': ['pomme', 'cerise', 'pêche', 'noisette', 'carotte crue'],
        'arachide': ['soja', 'lupin', 'lentilles (rare)'],
        'lait': ['bœuf (rare)', 'fromages de tous animaux'],
        'œuf': ['poulet (rare)', 'mayonnaise', 'pâtisseries'],
    };

    allergies.forEach(allergy => {
        const allergyLower = allergy.toLowerCase();
        Object.entries(crossReactions).forEach(([main, cross]) => {
            if (allergyLower.includes(main)) {
                cross.forEach(c => {
                    if (!crossAllergies.includes(c)) {
                        crossAllergies.push(c);
                    }
                });
            }
        });
    });

    return crossAllergies;
}



