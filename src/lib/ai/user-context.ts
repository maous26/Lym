// Interface pour le programme de jeûne
interface FastingSchedule {
    type: 'none' | '16_8' | '18_6' | '20_4' | '5_2' | 'eat_stop_eat';
    eatingWindowStart?: string;
    eatingWindowEnd?: string;
}

// Interface pour le profil utilisateur complet (depuis onboarding)
interface OnboardingProfile {
    name: string;
    age: number | null;
    gender: 'male' | 'female' | 'other' | null;
    height: number | null;
    weight: number | null;
    targetWeight: number | null;
    activityLevel: string | null;
    primaryGoal: string | null;
    dietaryPreferences: string;
    allergies: string[];
    isParent: boolean;
    cookingSkillLevel?: string;
    cookingTimeWeekday?: number;
    cookingTimeWeekend?: number;
    weightLossGoalKg?: number;
    suggestedDurationWeeks?: number;
    fastingSchedule?: FastingSchedule;
    weeklyBudget?: number;
    pricePreference?: 'economy' | 'balanced' | 'premium';
    sportType?: string;
    sportFrequency?: string;
    sportIntensity?: 'low' | 'medium' | 'high';
    favoriteFoods?: string[];
    favoriteCuisines?: string[];
}

/**
 * Calcule l'IMC à partir du poids et de la taille
 */
function calculateBMI(weight: number | null, height: number | null): { value: number | null; category: string } {
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
 * Calcule le BMR (métabolisme de base) avec la formule de Mifflin-St Jeor
 */
function calculateBMR(profile: OnboardingProfile): number | null {
    if (!profile.weight || !profile.height || !profile.age || !profile.gender) return null;

    // Formule Mifflin-St Jeor
    if (profile.gender === 'male') {
        return Math.round(10 * profile.weight + 6.25 * profile.height - 5 * profile.age + 5);
    } else {
        return Math.round(10 * profile.weight + 6.25 * profile.height - 5 * profile.age - 161);
    }
}

/**
 * Calcule le TDEE (dépense énergétique totale)
 */
function calculateTDEE(profile: OnboardingProfile): number | null {
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
 * Helper pour les informations de jeûne intermittent
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
 * Génère le contexte utilisateur complet pour les agents IA
 */
export function generateUserProfileContext(profile: OnboardingProfile): string {
    const bmi = calculateBMI(profile.weight, profile.height);
    const bmr = calculateBMR(profile);
    const tdee = calculateTDEE(profile);

    // Calcul des objectifs caloriques selon le but
    let calorieTarget = tdee;
    if (tdee && profile.primaryGoal === 'weight_loss') {
        calorieTarget = tdee - 500; // Déficit de 500 kcal pour perte de poids
    } else if (tdee && profile.primaryGoal === 'muscle_gain') {
        calorieTarget = tdee + 300; // Surplus de 300 kcal pour prise de muscle
    }

    // Infos sur le jeûne intermittent
    const fastingInfo = getFastingInfo(profile.fastingSchedule);

    // Génération du contexte
    return `
PROFIL UTILISATEUR COMPLET:
─────────────────────────────
👤 INFORMATIONS PERSONNELLES:
- Nom: ${profile.name || 'Non renseigné'}
- Âge: ${profile.age || 'Non renseigné'} ans
- Genre: ${profile.gender === 'male' ? 'Homme' : profile.gender === 'female' ? 'Femme' : 'Autre'}
- Taille: ${profile.height || 'Non renseignée'} cm
- Poids actuel: ${profile.weight || 'Non renseigné'} kg
- Poids cible: ${profile.targetWeight || 'Non défini'} kg
${profile.weightLossGoalKg ? `- Objectif de perte: ${profile.weightLossGoalKg} kg` : ''}
${profile.suggestedDurationWeeks ? `- Durée suggérée: ${profile.suggestedDurationWeeks} semaines` : ''}

📊 INDICATEURS DE SANTÉ:
- IMC: ${bmi.value || 'Non calculé'} (${bmi.category})
- Métabolisme de base (BMR): ${bmr || 'Non calculé'} kcal/jour
- Dépense énergétique (TDEE): ${tdee || 'Non calculé'} kcal/jour
- Objectif calorique: ${calorieTarget || 'Non défini'} kcal/jour

🎯 OBJECTIFS ET PRÉFÉRENCES:
- Objectif principal: ${translateGoal(profile.primaryGoal)}
- Niveau d'activité: ${translateActivityLevel(profile.activityLevel)}
${profile.sportType ? `- Sport: ${profile.sportType} (${profile.sportFrequency || 'Fréquence non précisée'}, Intensité: ${profile.sportIntensity || 'Non précisée'})` : ''}
- Régime alimentaire: ${profile.dietaryPreferences || 'Omnivore'}
- Allergies/Restrictions: ${profile.allergies?.length > 0 ? profile.allergies.join(', ') : 'Aucune'}
- Aliments préférés: ${profile.favoriteFoods?.length ? profile.favoriteFoods.join(', ') : 'Non renseigné'}
- Cuisines/Plats préférés: ${profile.favoriteCuisines?.length ? profile.favoriteCuisines.join(', ') : 'Non renseigné'}

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

function translateGoal(goal: string | null): string {
    const goals: Record<string, string> = {
        'weight_loss': 'Perte de poids',
        'muscle_gain': 'Prise de muscle',
        'maintenance': 'Maintien',
        'health': 'Améliorer ma santé',
        'energy': 'Plus d\'énergie'
    };
    return goals[goal || ''] || 'Non défini';
}

function translateActivityLevel(level: string | null): string {
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

function translatePricePreference(pref: string | undefined): string {
    const prefs: Record<string, string> = {
        'economy': 'Économique (premier prix)',
        'balanced': 'Équilibré (rapport qualité/prix)',
        'premium': 'Premium (bio, qualité)'
    };
    return prefs[pref || ''] || 'Équilibré';
}

function generateAdaptations(profile: OnboardingProfile, fastingInfo: { label: string; description: string }): string {
    const adaptations: string[] = [];

    if (profile.primaryGoal === 'weight_loss') {
        adaptations.push('• Privilégier les aliments à faible densité calorique mais rassasiants');
        adaptations.push('• Augmenter les protéines pour préserver la masse musculaire');
        adaptations.push('• Proposer des alternatives saines aux envies sucrées');
    }

    if (profile.primaryGoal === 'muscle_gain') {
        adaptations.push('• Assurer un apport protéique suffisant (1.6-2.2g/kg de poids corporel)');
        adaptations.push('• Répartir les protéines sur tous les repas');
        adaptations.push('• Proposer des collations riches en protéines');
    }

    if (profile.allergies?.length > 0) {
        adaptations.push(`• ATTENTION: Exclure strictement ${profile.allergies.join(', ')} de toutes les suggestions`);
    }

    if (profile.cookingSkillLevel === 'beginner') {
        adaptations.push('• Proposer des recettes simples avec peu d\'étapes');
        adaptations.push('• Privilégier les techniques de base (cuisson vapeur, poêle, four)');
    }

    if ((profile.cookingTimeWeekday || 30) < 20) {
        adaptations.push('• En semaine: suggérer des repas rapides (< 15 min) ou à préparer à l\'avance');
    }

    // Adaptations pour le jeûne intermittent
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

    if (profile.dietaryPreferences && profile.dietaryPreferences !== 'omnivore') {
        adaptations.push(`• Respecter le régime ${profile.dietaryPreferences} dans toutes les suggestions`);
    }

    // Adaptations pour le budget
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

    // Adaptations pour le sport
    if (profile.sportIntensity === 'high') {
        adaptations.push('• SPORT INTENSE: Assurer un apport suffisant en glucides autour des entraînements');
        adaptations.push('• Hydratation accrue recommandée');
        adaptations.push('• Proposer des collations de récupération');
    } else if (profile.sportIntensity === 'medium') {
        adaptations.push('• SPORT MODÉRÉ: Équilibrer les macronutriments pour soutenir l\'activité');
    }

    // Adaptations pour les préférences alimentaires
    if (profile.favoriteFoods?.length) {
        adaptations.push(`• Intégrer régulièrement les aliments préférés: ${profile.favoriteFoods.join(', ')}`);
    }

    if (profile.favoriteCuisines?.length) {
        adaptations.push(`• S'inspirer des cuisines préférées: ${profile.favoriteCuisines.join(', ')}`);
    }

    return adaptations.length > 0 ? adaptations.join('\n') : '• Pas d\'adaptation particulière requise';
}


