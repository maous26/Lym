'use server';

import { models, isAIAvailable } from '@/lib/ai/config';
import { MEAL_PLANNER_SYSTEM_PROMPT, MEAL_TYPE_GUIDELINES, SIMPLE_RECIPE_GUIDELINES } from '@/lib/ai/prompts';
import { getRandomTheme, getSeasonalTheme } from '@/lib/ai/themes';
import { generateUserProfileContext } from '@/lib/ai/user-context';
import type { UserProfile, FastingSchedule } from '@/types/user';

// Helper function to extract text from Vertex AI response
function extractTextFromResponse(response: any): string {
    if (typeof response.text === 'function') {
        return response.text();
    }
    if (response.candidates?.[0]?.content?.parts?.[0]?.text) {
        return response.candidates[0].content.parts[0].text;
    }
    throw new Error('Unable to extract text from response');
}

// Clean JSON from markdown code blocks
function cleanJsonResponse(text: string): string {
    return text.replace(/```json\n?|\n?```/g, "").trim();
}

export interface WeeklyPlanPreferences {
    dailyCalories: number;
    proteins: number;
    carbs: number;
    fats: number;
    dietType?: string;
    allergies?: string[];
    goals?: string;
    includeCheatMeal?: boolean;
    cookingSkillLevel?: 'beginner' | 'intermediate' | 'advanced';
    cookingTimeWeekday?: number;
    cookingTimeWeekend?: number;
    fastingSchedule?: FastingSchedule;
    weeklyBudget?: number;
    pricePreference?: 'economy' | 'balanced' | 'premium';
}

export interface MealPlanDay {
    day: string;
    meals: MealPlanMeal[];
    totalCalories: number;
}

export interface MealPlanMeal {
    type: 'breakfast' | 'lunch' | 'snack' | 'dinner';
    name: string;
    description?: string;
    calories: number;
    proteins: number;
    carbs: number;
    fats: number;
    prepTime: number;
    imageUrl?: string | null;
    recipeId?: string;
    isCheatMeal?: boolean;
    isFasting?: boolean;
}

export interface WeeklyPlan {
    days: MealPlanDay[];
}

/**
 * Generate a complete 7-day meal plan
 */
export async function generateWeeklyPlanWithDetails(
    preferences: WeeklyPlanPreferences,
    userProfile?: UserProfile
): Promise<{ success: boolean; plan?: WeeklyPlan; error?: string }> {
    try {
        if (!isAIAvailable()) {
            return {
                success: false,
                error: "L'IA n'est pas configurée. Veuillez configurer GOOGLE_CLOUD_PROJECT."
            };
        }

        console.log('📅 Generating weekly meal plan with full details...');

        const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
        const weekPlan: MealPlanDay[] = [];
        const usedRecipeTitles: string[] = [];

        const profileContext = userProfile ? generateUserProfileContext(userProfile) : '';

        // Determine Cheat Meal slot if requested
        let cheatMealDayIndex = -1;
        let cheatMealType: 'lunch' | 'dinner' = 'dinner';

        if (preferences.includeCheatMeal) {
            // Cheat meal usually on weekends (Fri, Sat, Sun)
            const weekendIndices = [4, 5, 6];
            cheatMealDayIndex = weekendIndices[Math.floor(Math.random() * weekendIndices.length)];
            cheatMealType = Math.random() > 0.5 ? 'dinner' : 'lunch';
            console.log(`🍔 Cheat Meal scheduled for: ${days[cheatMealDayIndex]} (${cheatMealType})`);
        }

        for (let i = 0; i < days.length; i++) {
            const day = days[i];
            console.log(`📆 Processing ${day}...`);
            const dayMeals: MealPlanMeal[] = [];

            // Assign a daily theme for variety
            const dailyTheme = Math.random() > 0.5 ? getRandomTheme() : getSeasonalTheme();
            console.log(`🎨 Theme for ${day}: ${dailyTheme}`);

            // Generate meals for each type
            const mealTypes = [
                { type: 'breakfast' as const, name: 'Petit-déjeuner', calorieTarget: preferences.dailyCalories * 0.25 },
                { type: 'lunch' as const, name: 'Déjeuner', calorieTarget: preferences.dailyCalories * 0.35 },
                { type: 'snack' as const, name: 'Collation', calorieTarget: preferences.dailyCalories * 0.10 },
                { type: 'dinner' as const, name: 'Dîner', calorieTarget: preferences.dailyCalories * 0.30 },
            ];

            for (const mealType of mealTypes) {
                const isCheatMeal = i === cheatMealDayIndex && mealType.type === cheatMealType;

                // Check fasting window for breakfast
                let skipMeal = false;
                if (preferences.fastingSchedule && preferences.fastingSchedule.type !== 'none') {
                    const windowStart = parseInt(preferences.fastingSchedule.eatingWindowStart || '12');
                    if (mealType.type === 'breakfast' && windowStart >= 12) {
                        skipMeal = true;
                    }
                }

                if (skipMeal) {
                    dayMeals.push({
                        type: mealType.type,
                        name: 'Jeûne - Eau/Thé/Café',
                        description: 'Période de jeûne - hydratation uniquement',
                        calories: 0,
                        proteins: 0,
                        carbs: 0,
                        fats: 0,
                        prepTime: 0,
                        isFasting: true
                    });
                    continue;
                }

                let meal: MealPlanMeal;

                if (isCheatMeal) {
                    // Generate cheat meal
                    console.log(`🍔 Generating CHEAT MEAL for ${day}...`);
                    meal = await generateCheatMeal(mealType.type, preferences, usedRecipeTitles);
                } else {
                    // Generate standard meal
                    meal = await generateStandardMeal(
                        day,
                        mealType,
                        preferences,
                        profileContext,
                        usedRecipeTitles,
                        dailyTheme,
                        i >= 5 // isWeekend
                    );
                }

                usedRecipeTitles.push(meal.name);
                dayMeals.push(meal);
            }

            const totalCalories = dayMeals.reduce((sum, m) => sum + (m?.calories || 0), 0);

            weekPlan.push({
                day,
                meals: dayMeals,
                totalCalories,
            });
        }

        console.log('✅ Plan 7 jours généré avec succès!');
        return { success: true, plan: { days: weekPlan } };
    } catch (error) {
        console.error("Error generating weekly plan:", error);
        return { success: false, error: "Impossible de générer le plan hebdomadaire" };
    }
}

/**
 * Generate a cheat meal
 */
async function generateCheatMeal(
    type: 'breakfast' | 'lunch' | 'snack' | 'dinner',
    preferences: WeeklyPlanPreferences,
    usedTitles: string[]
): Promise<MealPlanMeal> {
    const prompt = `
${MEAL_PLANNER_SYSTEM_PROMPT}

${MEAL_TYPE_GUIDELINES.cheat_meal}

Génère une recette de CHEAT MEAL (Repas Plaisir).
IGNORE les contraintes diététiques habituelles. Fais-toi plaisir !

CONTRAINTES:
- Allergies à éviter: ${preferences.allergies?.join(', ') || 'aucune'}
- À ÉVITER (déjà au menu): ${usedTitles.slice(-5).join(', ')}

Réponds UNIQUEMENT avec un JSON valide:
{
  "title": "Nom du plat (Nom Fun & Marketing)",
  "description": "Description courte (Ton déculpabilisant et gourmand)",
  "calories": 1200,
  "proteins": 35,
  "carbs": 100,
  "fats": 60,
  "prepTime": 30
}
`;

    try {
        const result = await models.flash.generateContent(prompt);
        const text = extractTextFromResponse(result.response);
        const jsonStr = cleanJsonResponse(text);
        const recipe = JSON.parse(jsonStr);

        return {
            type,
            name: recipe.title,
            description: recipe.description,
            calories: recipe.calories,
            proteins: recipe.proteins,
            carbs: recipe.carbs,
            fats: recipe.fats,
            prepTime: recipe.prepTime,
            isCheatMeal: true
        };
    } catch (error) {
        console.error("Error generating cheat meal:", error);
        return {
            type,
            name: "Burger Gourmand Maison",
            description: "Le burger réconfort par excellence",
            calories: 1000,
            proteins: 40,
            carbs: 80,
            fats: 50,
            prepTime: 25,
            isCheatMeal: true
        };
    }
}

/**
 * Generate a standard meal
 */
async function generateStandardMeal(
    day: string,
    mealType: { type: 'breakfast' | 'lunch' | 'snack' | 'dinner'; name: string; calorieTarget: number },
    preferences: WeeklyPlanPreferences,
    profileContext: string,
    usedTitles: string[],
    theme: string,
    isWeekend: boolean
): Promise<MealPlanMeal> {
    const maxCookingTime = isWeekend
        ? (preferences.cookingTimeWeekend || 45)
        : (preferences.cookingTimeWeekday || 20);

    // Fasting context
    let fastingContext = '';
    if (preferences.fastingSchedule && preferences.fastingSchedule.type !== 'none') {
        const fasting = preferences.fastingSchedule;
        if (fasting.type === '16_8' || fasting.type === '18_6' || fasting.type === '20_4') {
            const windowStart = fasting.eatingWindowStart || '12:00';
            const windowEnd = fasting.eatingWindowEnd || '20:00';
            fastingContext = `JEÛNE ${fasting.type.replace('_', ':')}: Fenêtre ${windowStart}-${windowEnd}`;
        }
    }

    const prompt = `
${SIMPLE_RECIPE_GUIDELINES}

${MEAL_TYPE_GUIDELINES[mealType.type] || ''}

${profileContext}

${fastingContext ? `⏰ ${fastingContext}` : ''}

🎨 THÈME DU JOUR: ${theme}

Génère une recette SIMPLE et QUOTIDIENNE de ${mealType.name} pour ${day}.

CONTRAINTES STRICTES:
- Calories cibles: ${Math.round(mealType.calorieTarget)} kcal
- Type de régime: ${preferences.dietType || 'équilibré'}
- Allergies à éviter: ${preferences.allergies?.join(', ') || 'aucune'}
- À ÉVITER (déjà au menu): ${usedTitles.slice(-10).join(', ')}
- Temps de préparation MAX: ${maxCookingTime} minutes
- RECETTE DU QUOTIDIEN: simple, rapide, ingrédients courants

Réponds UNIQUEMENT avec un JSON valide:
{
  "title": "Nom simple du plat",
  "description": "Description en 1 phrase",
  "calories": ${Math.round(mealType.calorieTarget)},
  "proteins": 25,
  "carbs": 35,
  "fats": 12,
  "prepTime": ${Math.min(maxCookingTime, 25)}
}
`;

    try {
        const result = await models.flash.generateContent(prompt);
        const text = extractTextFromResponse(result.response);
        const jsonStr = cleanJsonResponse(text);
        const recipe = JSON.parse(jsonStr);

        return {
            type: mealType.type,
            name: recipe.title,
            description: recipe.description,
            calories: recipe.calories,
            proteins: recipe.proteins,
            carbs: recipe.carbs,
            fats: recipe.fats,
            prepTime: recipe.prepTime,
        };
    } catch (error) {
        console.error("Error generating standard meal:", error);
        // Fallback meal
        const fallbacks: Record<string, MealPlanMeal> = {
            breakfast: {
                type: 'breakfast',
                name: 'Tartines au beurre et confiture',
                description: 'Petit-déjeuner français classique',
                calories: Math.round(mealType.calorieTarget),
                proteins: 8,
                carbs: 50,
                fats: 12,
                prepTime: 5
            },
            lunch: {
                type: 'lunch',
                name: 'Poulet grillé et légumes',
                description: 'Déjeuner équilibré',
                calories: Math.round(mealType.calorieTarget),
                proteins: 35,
                carbs: 40,
                fats: 15,
                prepTime: 25
            },
            snack: {
                type: 'snack',
                name: 'Yaourt et fruits',
                description: 'Collation légère',
                calories: Math.round(mealType.calorieTarget),
                proteins: 8,
                carbs: 20,
                fats: 3,
                prepTime: 2
            },
            dinner: {
                type: 'dinner',
                name: 'Soupe de légumes',
                description: 'Dîner léger et réconfortant',
                calories: Math.round(mealType.calorieTarget),
                proteins: 8,
                carbs: 25,
                fats: 8,
                prepTime: 20
            }
        };
        return fallbacks[mealType.type];
    }
}

/**
 * Regenerate a specific day in the plan
 */
export async function regenerateDayPlan(
    dayIndex: number,
    preferences: WeeklyPlanPreferences,
    existingPlan: WeeklyPlan,
    userProfile?: UserProfile
): Promise<{ success: boolean; dayPlan?: MealPlanDay; error?: string }> {
    try {
        if (!isAIAvailable()) {
            return {
                success: false,
                error: "L'IA n'est pas configurée."
            };
        }

        const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
        const day = days[dayIndex];
        console.log(`🔄 Regenerating ${day}...`);

        const profileContext = userProfile ? generateUserProfileContext(userProfile) : '';

        // Collect titles from other days to avoid duplicates
        const usedRecipeTitles: string[] = [];
        existingPlan.days.forEach((d, idx) => {
            if (idx !== dayIndex) {
                d.meals.forEach((m) => {
                    if (m.name) usedRecipeTitles.push(m.name);
                });
            }
        });

        const dayMeals: MealPlanMeal[] = [];
        const isWeekend = dayIndex >= 5;
        const theme = getRandomTheme();

        const mealTypes = [
            { type: 'breakfast' as const, name: 'Petit-déjeuner', calorieTarget: preferences.dailyCalories * 0.25 },
            { type: 'lunch' as const, name: 'Déjeuner', calorieTarget: preferences.dailyCalories * 0.35 },
            { type: 'snack' as const, name: 'Collation', calorieTarget: preferences.dailyCalories * 0.10 },
            { type: 'dinner' as const, name: 'Dîner', calorieTarget: preferences.dailyCalories * 0.30 },
        ];

        for (const mealType of mealTypes) {
            // Check fasting
            let skipMeal = false;
            if (preferences.fastingSchedule?.type && preferences.fastingSchedule.type !== 'none') {
                const windowStart = parseInt(preferences.fastingSchedule.eatingWindowStart || '12');
                if (mealType.type === 'breakfast' && windowStart >= 12) {
                    skipMeal = true;
                }
            }

            if (skipMeal) {
                dayMeals.push({
                    type: mealType.type,
                    name: 'Jeûne - Eau/Thé/Café',
                    description: 'Période de jeûne - hydratation uniquement',
                    calories: 0,
                    proteins: 0,
                    carbs: 0,
                    fats: 0,
                    prepTime: 0,
                    isFasting: true
                });
                continue;
            }

            const meal = await generateStandardMeal(
                day,
                mealType,
                preferences,
                profileContext,
                usedRecipeTitles,
                theme,
                isWeekend
            );

            usedRecipeTitles.push(meal.name);
            dayMeals.push(meal);
        }

        const totalCalories = dayMeals.reduce((sum, m) => sum + (m?.calories || 0), 0);

        console.log(`✅ Jour ${day} régénéré!`);
        return {
            success: true,
            dayPlan: {
                day,
                meals: dayMeals,
                totalCalories,
            }
        };
    } catch (error) {
        console.error("Error regenerating day:", error);
        return { success: false, error: "Impossible de régénérer le jour" };
    }
}

/**
 * Generate shopping list from weekly plan
 */
export async function generateShoppingList(weeklyPlan: WeeklyPlan, budget?: number) {
    try {
        if (!isAIAvailable()) {
            return {
                success: false,
                error: "L'IA n'est pas configurée."
            };
        }

        console.log('🛒 Generating shopping list...');

        // Collect all meal names
        const allMeals: string[] = [];
        weeklyPlan.days.forEach((day) => {
            day.meals.forEach((meal) => {
                if (meal.name && !meal.isFasting) {
                    allMeals.push(`${meal.name} (${meal.type})`);
                }
            });
        });

        const budgetContext = budget ? `Budget hebdomadaire: ${budget}€` : '';

        const prompt = `
Tu es un expert en courses alimentaires en France. Voici les repas prévus pour la semaine:

${allMeals.join('\n')}

${budgetContext}

TÂCHE:
1. Détermine les ingrédients nécessaires pour ces repas
2. Consolide les ingrédients similaires
3. Organise par catégories (Fruits & Légumes, Viandes & Poissons, Produits laitiers, Épicerie, etc.)
4. Estime les prix en France

Réponds UNIQUEMENT avec un JSON valide:
{
  "categories": [
    {
      "name": "Fruits & Légumes",
      "items": [
        { "name": "Tomates", "quantity": "2kg", "priceEstimate": 4.50 }
      ],
      "subtotal": 15.50
    }
  ],
  "totalEstimate": 85.50,
  "savingsTips": ["Astuce 1", "Astuce 2"]
}
`;

        const result = await models.flash.generateContent(prompt);
        const text = extractTextFromResponse(result.response);
        const jsonStr = cleanJsonResponse(text);
        const shoppingList = JSON.parse(jsonStr);

        console.log('✅ Shopping list generated!');
        console.log(`💰 Total estimate: ${shoppingList.totalEstimate}€`);

        return { success: true, shoppingList };
    } catch (error) {
        console.error("Error generating shopping list:", error);
        return { success: false, error: "Impossible de générer la liste de courses" };
    }
}
