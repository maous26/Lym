'use server';

import { prisma } from '@/lib/prisma';
import { models } from '@/lib/ai/config';
import type { FamilyMealPlan, FamilyMealPlanData, MemberMealPlan, DayMealPlan, MealDetails } from '@/types/family';
import { getAge, getAgeCategory } from '@/types/family';
import { calculateNutritionalNeeds } from './family';

// ==========================================
// MEAL PLANNING FAMILIAL MULTI-PROFILS
// ==========================================

/**
 * Générer un plan de repas familial personnalisé
 */
export async function generateFamilyMealPlan(params: {
    familyId: string;
    planMode: 'unified' | 'hybrid' | 'individual';
    daysCount?: number;
    mealsPerDay?: number;
    totalBudget?: number;
    preferences?: {
        avoidWaste?: boolean;
        localProducts?: boolean;
        seasonal?: boolean;
        quickPrep?: boolean;
    };
}) {
    try {
        // 1. Récupérer la famille et ses membres
        const family = await prisma.family.findUnique({
            where: { id: params.familyId },
            include: {
                members: {
                    where: { isActive: true },
                },
            },
        });

        if (!family || family.members.length === 0) {
            return { success: false, error: 'Famille non trouvée ou sans membres' };
        }

        const members = family.members;
        const daysCount = params.daysCount || 7;
        const mealsPerDay = params.mealsPerDay || 4;

        // 2. Calculer les besoins nutritionnels de chaque membre
        const memberNeeds = await Promise.all(members.map(async (member: any) => {
            const needs = await calculateNutritionalNeeds({
                birthDate: member.birthDate,
                gender: member.gender,
                weight: member.weight || 70,
                height: member.height || 170,
                activityLevel: member.activityLevel,
            });

            return {
                memberId: member.id,
                firstName: member.firstName,
                age: needs.age,
                ageCategory: needs.ageCategory,
                targetCalories: needs.calories,
                targetProteins: needs.proteins,
                targetCarbs: needs.carbs,
                targetFats: needs.fats,
                allergies: member.allergies ? JSON.parse(member.allergies) : [],
                intolerances: member.intolerances ? JSON.parse(member.intolerances) : [],
                dietType: member.dietType,
                likedFoods: member.likedFoods ? JSON.parse(member.likedFoods) : [],
                dislikedFoods: member.dislikedFoods ? JSON.parse(member.dislikedFoods) : [],
            };
        }));

        // 3. Générer les plans selon le mode
        let planData: FamilyMealPlanData;

        if (params.planMode === 'unified') {
            planData = await generateUnifiedPlan(memberNeeds, daysCount, mealsPerDay, params);
        } else if (params.planMode === 'hybrid') {
            planData = await generateHybridPlan(memberNeeds, daysCount, mealsPerDay, params);
        } else {
            planData = await generateIndividualPlans(memberNeeds, daysCount, mealsPerDay, params);
        }

        // 4. Calculer les statistiques globales
        const totalCaloriesPerDay = memberNeeds.reduce((sum, m) => sum + m.targetCalories, 0);
        const estimatedCost = calculateEstimatedCost(planData, params.totalBudget);
        const varietyScore = calculateVarietyScore(planData);

        // 5. Sauvegarder le plan
        const startDate = new Date();
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + daysCount);

        const mealPlan = await prisma.familyMealPlan.create({
            data: {
                familyId: params.familyId,
                name: `Plan ${family.name} - ${startDate.toLocaleDateString('fr-FR')}`,
                planMode: params.planMode,
                startDate,
                endDate,
                mealsPerDay,
                daysCount,
                planData: JSON.stringify(planData),
                totalBudget: params.totalBudget,
                preferences: params.preferences ? JSON.stringify(params.preferences) : null,
                totalCalories: totalCaloriesPerDay,
                estimatedCost,
                varietyScore,
                nutritionalBalance: 85, // Score calculé par défaut
                status: 'active',
                generatedBy: 'ai',
            },
        });

        return { 
            success: true, 
            mealPlan,
            planData,
            stats: {
                totalCaloriesPerDay,
                estimatedCost,
                varietyScore,
            },
        };
    } catch (error) {
        console.error('Error generating family meal plan:', error);
        return { success: false, error: 'Erreur lors de la génération du plan' };
    }
}

/**
 * Mode UNIFIÉ : Un seul plan avec portions adaptées par membre
 */
async function generateUnifiedPlan(
    memberNeeds: any[],
    daysCount: number,
    mealsPerDay: number,
    params: any
): Promise<FamilyMealPlanData> {
    // Utiliser l'IA pour générer des recettes qui conviennent à tous
    const model = models.pro;

    // Construire le contexte famille pour l'IA
    const familyContext = memberNeeds.map(m => 
        `${m.firstName} (${m.age} ans, ${m.ageCategory}): ${m.targetCalories}kcal/j, régime ${m.dietType}` +
        (m.allergies.length > 0 ? `, allergies: ${m.allergies.join(', ')}` : '')
    ).join('\n');

    const prompt = `Tu es un nutritionniste expert en plans familiaux.

Famille de ${memberNeeds.length} membres :
${familyContext}

Budget : ${params.totalBudget || 'Non spécifié'}€/semaine
Préférences : ${JSON.stringify(params.preferences || {})}

Génère un plan de ${daysCount} jours avec ${mealsPerDay} repas/jour (petit-déjeuner, déjeuner, goûter, dîner).

RÈGLES IMPORTANTES :
1. Recettes adaptables à toute la famille (portions ajustables)
2. Respecter TOUTES les allergies et intolérances
3. Équilibre nutritionnel pour chaque âge
4. Variété et attractivité pour les enfants
5. Praticité pour les parents

Retourne un JSON avec cette structure :
{
  "days": [
    {
      "dayIndex": 0,
      "meals": {
        "breakfast": {
          "name": "Nom du petit-déjeuner",
          "description": "Description courte",
          "basePortion": {
            "calories": 400,
            "proteins": 15,
            "carbs": 50,
            "fats": 12
          },
          "ingredients": [
            {"name": "Ingrédient", "quantity": 100, "unit": "g", "category": "Fruits"}
          ],
          "instructions": ["Étape 1", "Étape 2"],
          "prepTime": 15,
          "portionMultipliers": {
            "child": 0.7,
            "teen": 1.0,
            "adult": 1.2,
            "senior": 0.9
          }
        },
        "lunch": {...},
        "snack": {...},
        "dinner": {...}
      }
    }
  ]
}`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Parser la réponse
    const jsonText = text.replace(/```json\n?|\n?```/g, '').trim();
    const planAI = JSON.parse(jsonText);

    // Transformer en structure FamilyMealPlanData
    const planData: FamilyMealPlanData = {
        members: {},
        sharedMeals: [],
    };

    // Pour chaque membre, adapter les portions
    memberNeeds.forEach((member) => {
        const memberPlan: MemberMealPlan = {
            memberId: member.memberId,
            targetCalories: member.targetCalories,
            days: [],
        };

        planAI.days.forEach((day: any) => {
            const dayPlan: DayMealPlan = {
                dayIndex: day.dayIndex,
                date: new Date(Date.now() + day.dayIndex * 24 * 60 * 60 * 1000),
                meals: {},
                totalCalories: 0,
                totalProteins: 0,
                totalCarbs: 0,
                totalFats: 0,
            };

            // Adapter chaque repas selon l'âge du membre
            Object.entries(day.meals).forEach(([mealType, mealData]: [string, any]) => {
                const multiplier = mealData.portionMultipliers?.[member.ageCategory] || 1.0;
                
                const adaptedMeal: MealDetails = {
                    id: `${member.memberId}-${day.dayIndex}-${mealType}`,
                    name: mealData.name,
                    description: mealData.description,
                    calories: Math.round(mealData.basePortion.calories * multiplier),
                    proteins: Math.round(mealData.basePortion.proteins * multiplier),
                    carbs: Math.round(mealData.basePortion.carbs * multiplier),
                    fats: Math.round(mealData.basePortion.fats * multiplier),
                    portionSize: multiplier,
                    ingredients: mealData.ingredients.map((ing: any) => ({
                        ...ing,
                        quantity: ing.quantity * multiplier,
                    })),
                    instructions: mealData.instructions,
                    prepTime: mealData.prepTime,
                    isShared: true,
                };

                dayPlan.meals[mealType as keyof typeof dayPlan.meals] = adaptedMeal;
                dayPlan.totalCalories += adaptedMeal.calories;
                dayPlan.totalProteins += adaptedMeal.proteins;
                dayPlan.totalCarbs += adaptedMeal.carbs;
                dayPlan.totalFats += adaptedMeal.fats;
            });

            memberPlan.days.push(dayPlan);
        });

        planData.members[member.memberId] = memberPlan;
    });

    return planData;
}

/**
 * Mode HYBRIDE : Mix repas communs + spécifiques
 */
async function generateHybridPlan(
    memberNeeds: any[],
    daysCount: number,
    mealsPerDay: number,
    params: any
): Promise<FamilyMealPlanData> {
    // Logique similaire mais avec identification des repas nécessitant des alternatives
    // Par exemple: déjeuner et dîner communs, petit-déj et goûter individuels
    return generateUnifiedPlan(memberNeeds, daysCount, mealsPerDay, params); // Simplification pour l'instant
}

/**
 * Mode INDIVIDUEL : Plans complètement séparés
 */
async function generateIndividualPlans(
    memberNeeds: any[],
    daysCount: number,
    mealsPerDay: number,
    params: any
): Promise<FamilyMealPlanData> {
    // Générer un plan distinct pour chaque membre
    return generateUnifiedPlan(memberNeeds, daysCount, mealsPerDay, params); // Simplification pour l'instant
}

/**
 * Calculer le coût estimé du plan
 */
function calculateEstimatedCost(planData: FamilyMealPlanData, budget?: number): number {
    // Estimation basique : 5€ par personne par jour
    const membersCount = Object.keys(planData.members).length;
    const daysCount = planData.members[Object.keys(planData.members)[0]]?.days.length || 7;
    return membersCount * daysCount * 5;
}

/**
 * Calculer le score de variété
 */
function calculateVarietyScore(planData: FamilyMealPlanData): number {
    // Score basique basé sur la diversité des repas
    // TODO: Améliorer avec analyse réelle
    return Math.floor(Math.random() * 20) + 75; // 75-95 pour l'instant
}

/**
 * Récupérer le plan actif d'une famille
 */
export async function getActiveFamilyMealPlan(familyId: string) {
    try {
        const plan = await prisma.familyMealPlan.findFirst({
            where: {
                familyId,
                status: 'active',
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        if (!plan) {
            return { success: false, error: 'Aucun plan actif' };
        }

        // Parser les données
        const planData: FamilyMealPlanData = JSON.parse(plan.planData);

        return { 
            success: true, 
            mealPlan: plan,
            planData,
        };
    } catch (error) {
        console.error('Error getting active meal plan:', error);
        return { success: false, error: 'Erreur lors de la récupération' };
    }
}



