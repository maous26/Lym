// User context generation for AI personalization
import type { UserProfile, FastingSchedule } from '@/types/user';

/**
 * Calculate BMI from weight and height
 */
function calculateBMI(weight: number | undefined, height: number | undefined): { value: number | null; category: string } {
    if (!weight || !height) return { value: null, category: 'Non calculé' };

    const heightInMeters = height / 100;
    const bmiValue = weight / (heightInMeters * heightInMeters);

    let category = '';
    if (bmiValue < 18.5) category = 'Insuffisance pondérale';
    else if (bmiValue < 25) category = 'Poids normal';
    else if (bmiValue < 30) category = 'Surpoids';
    else if (bmiValue < 35) category = 'Obésité modérée';
    else if (bmiValue < 40) category = 'Obésité sévère';
    else category = 'Obésité morbide';

    return { value: Math.round(bmiValue * 10) / 10, category };
}

/**
 * Calculate BMR (Basal Metabolic Rate) using Mifflin-St Jeor formula
 */
function calculateBMR(profile: UserProfile): number | null {
    if (!profile.weight || !profile.height || !profile.age || !profile.gender) return null;

    // Mifflin-St Jeor formula
    if (profile.gender === 'male') {
        return Math.round(10 * profile.weight + 6.25 * profile.height - 5 * profile.age + 5);
    } else {
        return Math.round(10 * profile.weight + 6.25 * profile.height - 5 * profile.age - 161);
    }
}

/**
 * Calculate TDEE (Total Daily Energy Expenditure)
 */
function calculateTDEE(profile: UserProfile): number | null {
    const bmr = calculateBMR(profile);
    if (!bmr) return null;

    const activityMultipliers: Record<string, number> = {
        'sedentary': 1.2,
        'light': 1.375,
        'moderate': 1.55,
        'active': 1.725,
        'athlete': 1.9
    };

    const multiplier = profile.activityLevel
        ? activityMultipliers[profile.activityLevel] || 1.55
        : 1.55;

    return Math.round(bmr * multiplier);
}

/**
 * Helper for intermittent fasting info
 */
function getFastingInfo(schedule: FastingSchedule | undefined): { label: string; description: string } {
    if (!schedule || schedule.type === 'none') {
        return { label: 'Aucun', description: '' };
    }

    const types: Record<string, { label: string; description: string }> = {
        '16_8': {
            label: '16/8',
            description: `16h de jeûne, fenêtre alimentaire ${schedule.eatingWindowStart || '12:00'} - ${schedule.eatingWindowEnd || '20:00'}`
        },
        '18_6': {
            label: '18/6',
            description: `18h de jeûne, fenêtre alimentaire ${schedule.eatingWindowStart || '12:00'} - ${schedule.eatingWindowEnd || '18:00'}`
        },
        '20_4': {
            label: '20/4 (Warrior)',
            description: `20h de jeûne, fenêtre alimentaire de 4h`
        },
        '5_2': {
            label: '5:2',
            description: '5 jours normaux, 2 jours à 500-600 kcal'
        },
        'eat_stop_eat': {
            label: 'Eat-Stop-Eat',
            description: '1-2 jeûnes de 24h par semaine'
        }
    };

    return types[schedule.type] || { label: schedule.type, description: '' };
}

/**
 * Translation helpers
 */
function translateGoal(goal: string | undefined): string {
    const goals: Record<string, string> = {
        'weight_loss': 'Perte de poids',
        'muscle_gain': 'Prise de muscle',
        'maintenance': 'Maintien',
        'health': 'Améliorer ma santé',
        'energy': 'Plus d\'énergie'
    };
    return goals[goal || ''] || 'Non défini';
}

function translateActivityLevel(level: string | undefined): string {
    const levels: Record<string, string> = {
        'sedentary': 'Sédentaire',
        'light': 'Légèrement actif',
        'moderate': 'Modérément actif',
        'active': 'Actif',
        'athlete': 'Athlète'
    };
    return levels[level || ''] || 'Non défini';
}

function translateCookingSkill(skill: string | undefined): string {
    const skills: Record<string, string> = {
        'beginner': 'Débutant',
        'intermediate': 'Intermédiaire',
        'advanced': 'Avancé'
    };
    return skills[skill || ''] || 'Non défini';
}

function translateDietType(diet: string | undefined): string {
    const diets: Record<string, string> = {
        'omnivore': 'Omnivore',
        'vegetarian': 'Végétarien',
        'vegan': 'Végétalien',
        'pescatarian': 'Pescétarien',
        'keto': 'Cétogène',
        'paleo': 'Paléo',
        'mediterranean': 'Méditerranéen',
        'halal': 'Halal',
        'kosher': 'Casher'
    };
    return diets[diet || ''] || diet || 'Omnivore';
}

function translatePricePreference(pref: string | undefined): string {
    const prefs: Record<string, string> = {
        'economy': 'Économique (premier prix)',
        'balanced': 'Équilibré (rapport qualité/prix)',
        'premium': 'Premium (bio, qualité)'
    };
    return prefs[pref || ''] || 'Équilibré';
}

/**
 * Generate adaptation recommendations based on profile
 */
function generateAdaptations(profile: UserProfile, fastingInfo: { label: string; description: string }): string {
    const adaptations: string[] = [];

    if (profile.goal === 'weight_loss') {
        adaptations.push('• Privilégier les aliments à faible densité calorique mais rassasiants');
        adaptations.push('• Augmenter les protéines pour préserver la masse musculaire');
        adaptations.push('• Proposer des alternatives saines aux envies sucrées');
    }

    if (profile.goal === 'muscle_gain') {
        adaptations.push('• Assurer un apport protéique suffisant (1.6-2.2g/kg de poids corporel)');
        adaptations.push('• Répartir les protéines sur tous les repas');
        adaptations.push('• Proposer des collations riches en protéines');
    }

    if (profile.allergies && profile.allergies.length > 0) {
        adaptations.push(`• ATTENTION: Exclure strictement ${profile.allergies.join(', ')} de toutes les suggestions`);
    }

    if (profile.intolerances && profile.intolerances.length > 0) {
        adaptations.push(`• INTOLÉRANCES: Éviter ou limiter ${profile.intolerances.join(', ')}`);
    }

    if (profile.cookingSkillLevel === 'beginner') {
        adaptations.push('• Proposer des recettes simples avec peu d\'étapes');
        adaptations.push('• Privilégier les techniques de base (cuisson vapeur, poêle, four)');
    }

    if ((profile.cookingTimeWeekday || 30) < 20) {
        adaptations.push('• En semaine: suggérer des repas rapides (< 15 min) ou à préparer à l\'avance');
    }

    // Fasting adaptations
    if (profile.fastingSchedule && profile.fastingSchedule.type !== 'none') {
        adaptations.push(`• JEÛNE ${fastingInfo.label}: Adapter les repas à la fenêtre alimentaire`);

        if (profile.fastingSchedule.type === '16_8' || profile.fastingSchedule.type === '18_6') {
            adaptations.push('• Concentrer les calories sur 2-3 repas principaux');
            adaptations.push('• Premier repas plus copieux pour casser le jeûne en douceur');
        }

        if (profile.fastingSchedule.type === '20_4') {
            adaptations.push('• Fenêtre très courte: 1-2 repas très denses nutritionnellement');
            adaptations.push('• Assurer l\'apport en micronutriments malgré la restriction temporelle');
        }

        if (profile.fastingSchedule.type === '5_2') {
            adaptations.push('• Jours normaux: répartition classique des repas');
            adaptations.push('• Jours de jeûne: proposer des repas à 500-600 kcal totales');
        }
    }

    if (profile.dietType && profile.dietType !== 'omnivore') {
        adaptations.push(`• Respecter le régime ${translateDietType(profile.dietType)} dans toutes les suggestions`);
    }

    // Budget adaptations
    if (profile.weeklyBudget) {
        if (profile.weeklyBudget < 60) {
            adaptations.push('• BUDGET SERRÉ: Privilégier les ingrédients économiques (légumineuses, œufs, légumes de saison)');
            adaptations.push('• Éviter les produits transformés coûteux et les viandes chères');
            adaptations.push('• Proposer des recettes qui peuvent être préparées en grande quantité');
        } else if (profile.weeklyBudget < 120) {
            adaptations.push('• BUDGET MOYEN: Bon équilibre qualité/prix');
            adaptations.push('• Alterner protéines animales et végétales');
        } else if (profile.weeklyBudget >= 200) {
            adaptations.push('• BUDGET CONFORTABLE: Possibilité d\'inclure des produits bio et de qualité');
        }
    }

    if (profile.pricePreference === 'economy') {
        adaptations.push('• Préférence économique: Privilégier les marques distributeur et premiers prix');
    } else if (profile.pricePreference === 'premium') {
        adaptations.push('• Préférence premium: Favoriser les produits bio, label rouge, AOC');
    }

    return adaptations.length > 0 ? adaptations.join('\n') : '• Pas d\'adaptation particulière requise';
}

/**
 * Generate complete user profile context for AI agents
 */
export function generateUserProfileContext(profile: UserProfile): string {
    const bmi = calculateBMI(profile.weight, profile.height);
    const bmr = calculateBMR(profile);
    const tdee = calculateTDEE(profile);

    // Calculate calorie target based on goal
    let calorieTarget = tdee;
    if (tdee && profile.goal === 'weight_loss') {
        calorieTarget = tdee - 500; // 500 kcal deficit for weight loss
    } else if (tdee && profile.goal === 'muscle_gain') {
        calorieTarget = tdee + 300; // 300 kcal surplus for muscle gain
    }

    // Fasting info
    const fastingInfo = getFastingInfo(profile.fastingSchedule);

    // Generate context
    return `
PROFIL UTILISATEUR COMPLET:
─────────────────────────────
👤 INFORMATIONS PERSONNELLES:
- Prénom: ${profile.firstName || 'Non renseigné'}
- Âge: ${profile.age || 'Non renseigné'} ans
- Genre: ${profile.gender === 'male' ? 'Homme' : profile.gender === 'female' ? 'Femme' : 'Autre'}
- Taille: ${profile.height || 'Non renseignée'} cm
- Poids actuel: ${profile.weight || 'Non renseigné'} kg
- Poids cible: ${profile.targetWeight || 'Non défini'} kg

📊 INDICATEURS DE SANTÉ:
- IMC: ${bmi.value || 'Non calculé'} (${bmi.category})
- Métabolisme de base (BMR): ${bmr || 'Non calculé'} kcal/jour
- Dépense énergétique (TDEE): ${tdee || 'Non calculé'} kcal/jour
- Objectif calorique: ${calorieTarget || 'Non défini'} kcal/jour

🎯 OBJECTIFS ET PRÉFÉRENCES:
- Objectif principal: ${translateGoal(profile.goal)}
- Niveau d'activité: ${translateActivityLevel(profile.activityLevel)}
- Régime alimentaire: ${translateDietType(profile.dietType)}
- Allergies: ${profile.allergies?.length ? profile.allergies.join(', ') : 'Aucune'}
- Intolérances: ${profile.intolerances?.length ? profile.intolerances.join(', ') : 'Aucune'}

⏰ JEÛNE INTERMITTENT:
- Type: ${fastingInfo.label}
${fastingInfo.description ? `- Détail: ${fastingInfo.description}` : ''}

👨‍🍳 COMPÉTENCES CULINAIRES:
- Niveau: ${translateCookingSkill(profile.cookingSkillLevel)}
- Temps disponible (semaine): ${profile.cookingTimeWeekday || 30} minutes
- Temps disponible (weekend): ${profile.cookingTimeWeekend || 60} minutes

💰 BUDGET COURSES:
- Budget hebdomadaire: ${profile.weeklyBudget ? `${profile.weeklyBudget}€` : 'Non défini'}
- Gamme de prix: ${translatePricePreference(profile.pricePreference)}

ADAPTATIONS NÉCESSAIRES:
─────────────────────────────
${generateAdaptations(profile, fastingInfo)}
`;
}

/**
 * Generate a short context for quick suggestions
 */
export function generateShortContext(profile: UserProfile): string {
    return `
Utilisateur: ${profile.firstName || 'Anonyme'}, ${profile.age || '?'} ans, ${profile.gender === 'male' ? 'H' : 'F'}
Objectif: ${translateGoal(profile.goal)}
Régime: ${translateDietType(profile.dietType)}
Allergies: ${profile.allergies?.length ? profile.allergies.join(', ') : 'Aucune'}
Niveau cuisine: ${translateCookingSkill(profile.cookingSkillLevel)}
`.trim();
}
