'use server';

import { models } from '@/lib/ai/config';
import { MEAL_PLANNER_SYSTEM_PROMPT, MEAL_TYPE_GUIDELINES } from '@/lib/ai/prompts';
import { searchRecipes, saveRecipe } from './recipes';
// generateFoodImage retiré pour les plans 7 jours (économie de coûts)
import { getRandomTheme } from '@/lib/ai/themes';
import { getPersonalizedRecommendations } from './ratings';

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

interface FastingSchedule {
    type: 'none' | '16_8' | '18_6' | '20_4' | '5_2' | 'eat_stop_eat';
    eatingWindowStart?: string;
    eatingWindowEnd?: string;
}

interface WeeklyPlanPreferences {
    dailyCalories: number;
    proteins: number;
    carbs: number;
    fats: number;
    dietType?: string;
    allergies?: string[];
    goals?: string;
    includeCheatMeal?: boolean;
    cookingSkillLevel?: string; // 'beginner', 'intermediate', 'advanced'
    cookingTimeWeekday?: number; // minutes
    cookingTimeWeekend?: number; // minutes
    fastingSchedule?: FastingSchedule; // Jeûne intermittent
}

// Prompt de base pour des recettes SIMPLES du quotidien
const SIMPLE_RECIPE_GUIDELINES = `
RÈGLES ABSOLUES POUR LES RECETTES:
─────────────────────────────────────
🏠 RECETTES DU QUOTIDIEN UNIQUEMENT:
- Recettes simples que tout le monde peut faire
- Ingrédients disponibles dans n'importe quel supermarché
- PAS de recettes de restaurant ou gastronomiques
- PAS d'ingrédients rares ou coûteux
- PAS de techniques compliquées

⏱️ SIMPLICITÉ:
- Maximum 6-8 ingrédients par recette
- Maximum 5-6 étapes de préparation
- Instructions claires et directes
- Temps de préparation réaliste

🥐 PETIT-DÉJEUNER = FRANÇAIS TRADITIONNEL:
- Majoritairement SUCRÉ (tartines, céréales, viennoiseries)
- Touche salée LÉGÈRE autorisée (tranche saumon fumé, jambon, œuf)
- JAMAIS de plats cuisinés salés complets (pas de poulet grillé, légumes cuits, etc.)
- Exemples: tartines confiture, croissant, porridge miel, ou tartine saumon fumé + café

🍳 EXEMPLES DE BONNES RECETTES (déjeuner/dîner):
- Pâtes à la sauce tomate maison
- Omelette aux légumes
- Salade composée avec poulet
- Riz sauté aux légumes
- Soupe de légumes
- Sandwich équilibré
- Wrap au thon
- Purée et steak haché

❌ EXEMPLES À ÉVITER:
- Risotto au safran et Saint-Jacques
- Tartare de bœuf aux truffes
- Millefeuille de légumes
- Terrine maison
- Tout plat nécessitant plus de 30 min de préparation active
`;

export async function generateWeeklyPlanWithDetails(preferences: WeeklyPlanPreferences) {
    try {
        console.log('📅 Generating weekly meal plan with full details...');

        const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
        const weekPlan = [];
        const usedRecipeTitles: string[] = [];

        // 🤖 ML: Get personalized recommendations based on user ratings
        const recommendations = await getPersonalizedRecommendations();
        const preferredTags = recommendations.success ? (recommendations.preferredTags ?? []) : [];
        console.log('🎯 Preferred tags from ML:', preferredTags);

        // Determine Cheat Meal slot if requested
        let cheatMealDayIndex = -1;
        let cheatMealType = '';

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
            const dayMeals = [];

            // Assign a daily theme for variety (influenced by ML preferences)
            let dailyTheme = getRandomTheme();

            // 🤖 ML: Occasionally use preferred tags as theme
            if (preferredTags.length > 0 && Math.random() > 0.5) {
                dailyTheme = preferredTags[Math.floor(Math.random() * Math.min(3, preferredTags.length))];
                console.log(`🎨 Theme for ${day}: ${dailyTheme} (ML-suggested)`);
            } else {
                console.log(`🎨 Theme for ${day}: ${dailyTheme}`);
            }

            // Generate meals for each type
            const mealTypes = [
                { type: 'breakfast', name: 'Petit-déjeuner', calorieTarget: preferences.dailyCalories * 0.25 },
                { type: 'lunch', name: 'Déjeuner', calorieTarget: preferences.dailyCalories * 0.35 },
                { type: 'snack', name: 'Collation', calorieTarget: preferences.dailyCalories * 0.10 },
                { type: 'dinner', name: 'Dîner', calorieTarget: preferences.dailyCalories * 0.30 },
            ];

            for (const mealType of mealTypes) {
                const isCheatMeal = i === cheatMealDayIndex && mealType.type === cheatMealType;
                let meal;

                if (isCheatMeal) {
                    // --- CHEAT MEAL GENERATION ---
                    console.log(`🍔 Generating CHEAT MEAL for ${day}...`);

                    const prompt = `
                        ${MEAL_PLANNER_SYSTEM_PROMPT}
                        
                        ${MEAL_TYPE_GUIDELINES.cheat_meal}

                        Génère une recette de CHEAT MEAL (Repas Plaisir) pour ${day}.
                        IGNORE les contraintes diététiques habituelles. Fais-toi plaisir !
                        
                        CONTRAINTES:
                        - Calories cibles: ${Math.round(mealType.calorieTarget * 2.5)} kcal (Ceci est une estimation large, ne te limite pas)
                        - Type de régime: AUCUN (Plaisir total)
                        - Allergies à éviter: ${preferences.allergies?.join(', ') || 'aucune'}
                        - À ÉVITER ABSOLUMENT (déjà au menu): ${usedRecipeTitles.join(', ')}
                        
                        Réponds UNIQUEMENT avec un JSON valide:
                        {
                          "title": "Nom du plat (Nom Fun & Marketing)",
                          "description": "Description courte (Ton déculpabilisant et gourmand)",
                          "ingredients": ["ingrédient 1", "ingrédient 2"],
                          "instructions": ["étape 1", "étape 2"],
                          "macros": {
                            "calories": ${Math.round(mealType.calorieTarget * 2.5)},
                            "proteins": 30,
                            "carbs": 40,
                            "fats": 15
                          },
                          "temps_preparation": 20
                        }
                    `;

                    const result = await models.flash.generateContent(prompt);
                    const text = extractTextFromResponse(result.response);
                    const jsonStr = text.replace(/```json\n?|\n?```/g, "").trim();
                    const recipe = JSON.parse(jsonStr);

                    usedRecipeTitles.push(recipe.title);

                    // Save to database (tagged as cheat_meal)
                    const savedResult = await saveRecipe({
                        title: recipe.title,
                        description: recipe.description,
                        ingredients: recipe.ingredients,
                        instructions: recipe.instructions,
                        calories: recipe.macros.calories,
                        proteins: recipe.macros.proteins,
                        carbs: recipe.macros.carbs,
                        fats: recipe.macros.fats,
                        prepTime: recipe.temps_preparation,
                        tags: ['cheat_meal'],
                    });

                    const recipeId = savedResult.success ? savedResult.recipe?.id : undefined;

                    // Version légère pour l'affichage
                    meal = {
                        type: mealType.type,
                        name: recipe.title,
                        description: recipe.description,
                        calories: recipe.macros.calories,
                        proteins: recipe.macros.proteins,
                        carbs: recipe.macros.carbs,
                        fats: recipe.macros.fats,
                        prepTime: recipe.temps_preparation,
                        imageUrl: null,
                        fromDatabase: false,
                        recipeId,
                        isCheatMeal: true
                    };

                } else {
                    // --- STANDARD MEAL GENERATION ---

                    // 1. Search DB
                    let existingRecipes: any = await searchRecipes({
                        calories: {
                            min: Math.max(0, mealType.calorieTarget - 100),
                            max: mealType.calorieTarget + 100,
                        },
                        limit: 10,
                    });

                    let foundExisting = false;

                    if (existingRecipes.success && existingRecipes.recipes && existingRecipes.recipes.length > 0) {
                        const availableRecipes = existingRecipes.recipes.filter((r: any) => !usedRecipeTitles.includes(r.title));
                        if (availableRecipes.length > 0) {
                            const randomRecipe = availableRecipes[Math.floor(Math.random() * availableRecipes.length)];
                            console.log(`♻️ Reusing recipe: ${randomRecipe.title}`);
                            usedRecipeTitles.push(randomRecipe.title);

                            // Version légère pour l'affichage (sans ingrédients/instructions)
                            // Les détails complets sont récupérables via recipeId
                            meal = {
                                type: mealType.type,
                                name: randomRecipe.title,
                                description: randomRecipe.description,
                                calories: randomRecipe.calories,
                                proteins: randomRecipe.proteins,
                                carbs: randomRecipe.carbs,
                                fats: randomRecipe.fats,
                                prepTime: randomRecipe.prepTime,
                                imageUrl: randomRecipe.imageUrl,
                                fromDatabase: true,
                                recipeId: randomRecipe.id,
                            };
                            foundExisting = true;
                        }
                    }

                    if (!foundExisting) {
                        // 2. Generate New
                        console.log(`🆕 Generating new ${mealType.name}...`);

                        // Determine cooking time based on day and user preferences
                        const isWeekend = i >= 5; // Saturday (5) and Sunday (6)
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
                                fastingContext = `
⏰ JEÛNE INTERMITTENT ${fasting.type.replace('_', ':')}:
- Fenêtre alimentaire: ${windowStart} - ${windowEnd}
- Si ${mealType.type} est HORS de la fenêtre: propose une version très légère (tisane, eau citronnée) ou saute ce repas
- Les repas dans la fenêtre doivent être plus copieux et nutritifs
`;
                                // Adjust meal types for fasting
                                if (mealType.type === 'breakfast' && parseInt(windowStart) >= 12) {
                                    fastingContext += '- PETIT-DÉJEUNER SAUTÉ: propose uniquement thé/café sans sucre ou eau citronnée (0 kcal)\n';
                                }
                            } else if (fasting.type === '5_2') {
                                // On 5:2, 2 days are restricted to ~500-600 kcal
                                if (i === 1 || i === 4) { // Mardi et Vendredi comme jours de jeûne
                                    fastingContext = `
⏰ JOUR DE JEÛNE (5:2):
- Budget calorique TOTAL du jour: 500-600 kcal
- Ce repas doit être très léger: ${Math.round(mealType.calorieTarget * 0.3)} kcal max
- Privilégier les légumes et protéines maigres
`;
                                }
                            }
                        }

                        const prompt = `
                            ${SIMPLE_RECIPE_GUIDELINES}
                            
                            ${MEAL_TYPE_GUIDELINES[mealType.type as keyof typeof MEAL_TYPE_GUIDELINES] || ''}
                            
                            ${fastingContext}

                            Génère une recette SIMPLE et QUOTIDIENNE de ${mealType.name} pour ${day}.
                            
                            CONTRAINTES STRICTES:
                            - Calories cibles: ${Math.round(mealType.calorieTarget)} kcal
                            - Type de régime: ${preferences.dietType || 'équilibré'}
                            - Allergies à éviter: ${preferences.allergies?.join(', ') || 'aucune'}
                            - À ÉVITER (déjà au menu): ${usedRecipeTitles.slice(-10).join(', ')}
                            - Temps de préparation MAX: ${maxCookingTime} minutes
                            - RECETTE DU QUOTIDIEN: simple, rapide, ingrédients courants
                            
                            Réponds UNIQUEMENT avec un JSON valide:
                            {
                              "title": "Nom simple du plat",
                              "description": "Description en 1 phrase",
                              "ingredients": ["max 6-8 ingrédients courants"],
                              "instructions": ["max 5 étapes simples"],
                              "macros": {
                                "calories": ${Math.round(mealType.calorieTarget)},
                                "proteins": 25,
                                "carbs": 35,
                                "fats": 12
                              },
                              "temps_preparation": ${Math.min(maxCookingTime, 25)}
                            }
                        `;

                        const result = await models.flash.generateContent(prompt);
                        const text = extractTextFromResponse(result.response);
                        const jsonStr = text.replace(/```json\n?|\n?```/g, "").trim();
                        const recipe = JSON.parse(jsonStr);

                        usedRecipeTitles.push(recipe.title);

                        const savedResult = await saveRecipe({
                            title: recipe.title,
                            description: recipe.description,
                            ingredients: recipe.ingredients,
                            instructions: recipe.instructions,
                            calories: recipe.macros.calories,
                            proteins: recipe.macros.proteins,
                            carbs: recipe.macros.carbs,
                            fats: recipe.macros.fats,
                            prepTime: recipe.temps_preparation,
                            tags: [],
                        });

                        const recipeId = savedResult.success ? savedResult.recipe?.id : undefined;

                        // Version légère pour l'affichage (sans ingrédients/instructions)
                        // Les détails complets sont sauvegardés en DB et récupérables via recipeId
                        meal = {
                            type: mealType.type,
                            name: recipe.title,
                            description: recipe.description,
                            calories: recipe.macros.calories,
                            proteins: recipe.macros.proteins,
                            carbs: recipe.macros.carbs,
                            fats: recipe.macros.fats,
                            prepTime: recipe.temps_preparation,
                            imageUrl: null,
                            fromDatabase: false,
                            recipeId,
                        };
                    }
                }

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
        return { success: false, error: "Failed to generate weekly plan" };
    }
}

/**
 * Régénère un jour spécifique du plan
 */
export async function regenerateDayPlan(
    dayIndex: number, 
    preferences: WeeklyPlanPreferences,
    existingPlan: any
) {
    try {
        const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
        const day = days[dayIndex];
        console.log(`🔄 Regenerating ${day}...`);

        // Collect titles from other days to avoid duplicates
        const usedRecipeTitles: string[] = [];
        existingPlan.days.forEach((d: any, idx: number) => {
            if (idx !== dayIndex) {
                d.meals.forEach((m: any) => {
                    if (m.name) usedRecipeTitles.push(m.name);
                });
            }
        });

        const dayMeals = [];
        const isWeekend = dayIndex >= 5;
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

        const mealTypes = [
            { type: 'breakfast', name: 'Petit-déjeuner', calorieTarget: preferences.dailyCalories * 0.25 },
            { type: 'lunch', name: 'Déjeuner', calorieTarget: preferences.dailyCalories * 0.35 },
            { type: 'snack', name: 'Collation', calorieTarget: preferences.dailyCalories * 0.10 },
            { type: 'dinner', name: 'Dîner', calorieTarget: preferences.dailyCalories * 0.30 },
        ];

        for (const mealType of mealTypes) {
            // Check fasting window for breakfast
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
                    ingredients: ['Eau', 'Thé ou café sans sucre (optionnel)'],
                    instructions: ['Restez hydraté pendant la période de jeûne'],
                    calories: 0,
                    proteins: 0,
                    carbs: 0,
                    fats: 0,
                    prepTime: 0,
                    isFasting: true
                });
                continue;
            }

            const prompt = `
                ${SIMPLE_RECIPE_GUIDELINES}
                
                ${MEAL_TYPE_GUIDELINES[mealType.type as keyof typeof MEAL_TYPE_GUIDELINES] || ''}
                ${fastingContext ? `\n⏰ ${fastingContext}` : ''}

                Génère une recette SIMPLE de ${mealType.name} pour ${day}.
                
                CONTRAINTES:
                - Calories: ~${Math.round(mealType.calorieTarget)} kcal
                - Régime: ${preferences.dietType || 'équilibré'}
                - Allergies: ${preferences.allergies?.join(', ') || 'aucune'}
                - ÉVITER: ${usedRecipeTitles.slice(-5).join(', ')}
                - Temps MAX: ${maxCookingTime} min
                
                JSON UNIQUEMENT:
                {
                  "title": "Nom simple",
                  "description": "1 phrase",
                  "ingredients": ["6-8 ingrédients max"],
                  "instructions": ["5 étapes max"],
                  "macros": {"calories": ${Math.round(mealType.calorieTarget)}, "proteins": 25, "carbs": 35, "fats": 12},
                  "temps_preparation": ${Math.min(maxCookingTime, 20)}
                }
            `;

            const result = await models.flash.generateContent(prompt);
            const text = extractTextFromResponse(result.response);
            const jsonStr = text.replace(/```json\n?|\n?```/g, "").trim();
            const recipe = JSON.parse(jsonStr);

            usedRecipeTitles.push(recipe.title);

            // Save to DB
            const savedResult = await saveRecipe({
                title: recipe.title,
                description: recipe.description,
                ingredients: recipe.ingredients,
                instructions: recipe.instructions,
                calories: recipe.macros.calories,
                proteins: recipe.macros.proteins,
                carbs: recipe.macros.carbs,
                fats: recipe.macros.fats,
                prepTime: recipe.temps_preparation,
                tags: [],
            });

            const recipeId = savedResult.success ? savedResult.recipe?.id : undefined;

            // Version légère pour l'affichage (détails complets en DB via recipeId)
            dayMeals.push({
                type: mealType.type,
                name: recipe.title,
                description: recipe.description,
                calories: recipe.macros.calories,
                proteins: recipe.macros.proteins,
                carbs: recipe.macros.carbs,
                fats: recipe.macros.fats,
                prepTime: recipe.temps_preparation,
                imageUrl: null,
                recipeId,
            });
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
        return { success: false, error: "Failed to regenerate day" };
    }
}

export async function generateShoppingList(weeklyPlan: any) {
    try {
        console.log('🛒 Generating shopping list...');

        // Collect all ingredients from all meals
        const allIngredients: string[] = [];

        weeklyPlan.days.forEach((day: any) => {
            day.meals.forEach((meal: any) => {
                if (meal.ingredients) {
                    allIngredients.push(...meal.ingredients);
                }
            });
        });

        // Use AI to consolidate and organize the shopping list
        const prompt = `
      Tu es un assistant culinaire expert. Voici une liste d'ingrédients pour une semaine de repas:
      
      ${allIngredients.join('\n')}
      
      TÂCHE:
      1. Consolide les ingrédients similaires (ex: "200g de riz" + "150g de riz" = "350g de riz")
      2. Organise par catégories (Fruits & Légumes, Viandes & Poissons, Produits laitiers, Épicerie, etc.)
      3. Élimine les doublons
      
      Réponds UNIQUEMENT avec un JSON valide:
      {
        "categories": [
          {
            "name": "Fruits & Légumes",
            "items": ["2kg de tomates", "500g de carottes"]
          },
          {
            "name": "Viandes & Poissons",
            "items": ["500g de poulet", "300g de saumon"]
          }
        ]
      }
    `;

        const result = await models.flash.generateContent(prompt);
        const text = extractTextFromResponse(result.response);
        const jsonStr = text.replace(/```json\n?|\n?```/g, "").trim();
        const shoppingList = JSON.parse(jsonStr);

        console.log('✅ Shopping list generated!');
        return { success: true, shoppingList };
    } catch (error) {
        console.error("Error generating shopping list:", error);
        return { success: false, error: "Failed to generate shopping list" };
    }
}
