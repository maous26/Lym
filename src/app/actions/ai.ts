'use server';

import { models } from '@/lib/ai/config';
import { COACH_SYSTEM_PROMPT, MEAL_PLANNER_SYSTEM_PROMPT, MEAL_TYPE_GUIDELINES } from '@/lib/ai/prompts';
import { generateUserProfileContext } from './ai-coach';
import { getUserPreferencesSummary } from './feedback';

// Helper function to extract text from Vertex AI response
function extractTextFromResponse(response: any): string {
    // Try the text() method first (if available)
    if (typeof response.text === 'function') {
        return response.text();
    }
    // Fallback to candidates structure
    if (response.candidates?.[0]?.content?.parts?.[0]?.text) {
        return response.candidates[0].content.parts[0].text;
    }
    throw new Error('Unable to extract text from response');
}

// Interface pour le programme de jeûne
interface FastingSchedule {
    type: 'none' | '16_8' | '18_6' | '20_4' | '5_2' | 'eat_stop_eat';
    eatingWindowStart?: string;
    eatingWindowEnd?: string;
}

// Interface pour le profil utilisateur
interface UserProfile {
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
}

export async function chatWithCoach(message: string, context?: any, userProfile?: UserProfile) {
    try {
        const profileContext = userProfile ? generateUserProfileContext(userProfile) : '';
        
        const chat = models.pro.startChat({
            history: [
                {
                    role: "user",
                    parts: [{ text: `System Context: ${COACH_SYSTEM_PROMPT}\n\n${profileContext}` }],
                },
                {
                    role: "model",
                    parts: [{ text: "Compris. Je suis prêt à vous aider en tant que coach nutritionnel personnalisé." }],
                },
            ],
        });

        const contextStr = context ? `\nContexte additionnel: ${JSON.stringify(context)}` : "";
        const result = await chat.sendMessage(message + contextStr);
        const response = result.response;
        return { success: true, message: extractTextFromResponse(response) };
    } catch (error) {
        console.error("Error in chatWithCoach:", error);
        return { success: false, error: "Failed to get response from coach" };
    }
}

export async function generateMealPlan(preferences: any, userProfile?: UserProfile, userId?: string) {
    try {
        const profileContext = userProfile ? generateUserProfileContext(userProfile) : '';
        
        // Get user preferences from feedback (ML-based)
        const userFeedbackPreferences = await getUserPreferencesSummary(userId || 'default');
        
        const prompt = `
      ${MEAL_PLANNER_SYSTEM_PROMPT}
      
      ${profileContext}
      
      ${userFeedbackPreferences}
      
      Génère un plan de repas pour 7 jours basé sur ces préférences :
      ${JSON.stringify(preferences)}
      
      IMPORTANT:
      - Adapte les recettes au niveau de cuisine de l'utilisateur
      - Respecte le temps de préparation disponible (semaine vs weekend)
      - TIENS COMPTE DES PRÉFÉRENCES APPRISES (tags aimés/détestés) pour améliorer la satisfaction
      - Respecte strictement le régime alimentaire et les allergies
      - Privilégie les types de plats bien notés par l'utilisateur
      
      Le format de réponse DOIT être un JSON valide correspondant à cette structure :
      {
        "days": [
          {
            "day": "Lundi",
            "meals": [
              { "type": "breakfast", "name": "...", "calories": 0, "prepTime": 15 },
              { "type": "lunch", "name": "...", "calories": 0, "prepTime": 30 },
              { "type": "dinner", "name": "...", "calories": 0, "prepTime": 25 },
              { "type": "snack", "name": "...", "calories": 0, "prepTime": 5 }
            ],
            "totalCalories": 0
          }
        ]
      }
    `;

        const result = await models.flash.generateContent(prompt);
        const response = result.response;
        const text = extractTextFromResponse(response);

        // Clean up markdown code blocks if present
        const jsonStr = text.replace(/```json\n?|\n?```/g, "").trim();
        const plan = JSON.parse(jsonStr);

        return { success: true, plan };
    } catch (error) {
        console.error("Error in generateMealPlan:", error);
        return { success: false, error: "Failed to generate meal plan" };
    }
}

export async function generateRecipe(request: string) {
    try {
        const prompt = `
      ${MEAL_PLANNER_SYSTEM_PROMPT}
      
      Génère une recette détaillée pour : ${request}
      
      Réponds UNIQUEMENT avec un JSON valide.
    `;

        const result = await models.flash.generateContent(prompt);
        const response = result.response;
        const text = extractTextFromResponse(response);

        const jsonStr = text.replace(/```json\n?|\n?```/g, "").trim();
        const recipe = JSON.parse(jsonStr);

        return { success: true, recipe };
    } catch (error) {
        console.error("Error in generateRecipe:", error);
        return { success: false, error: "Failed to generate recipe" };
    }
}

export async function suggestRecipe(context: {
    consumed: { calories: number; proteins: number; carbs: number; fats: number };
    targets: { calories: number; proteins: number; carbs: number; fats: number };
    mealType: string;
    userProfile?: UserProfile;
    userId?: string;
}) {
    try {
        const remaining = {
            calories: Math.max(0, context.targets.calories - context.consumed.calories),
            proteins: Math.max(0, context.targets.proteins - context.consumed.proteins),
            carbs: Math.max(0, context.targets.carbs - context.consumed.carbs),
            fats: Math.max(0, context.targets.fats - context.consumed.fats),
        };

        // Generate profile context if available
        const profileContext = context.userProfile ? generateUserProfileContext(context.userProfile) : '';
        
        // Get user preferences from feedback (ML-based)
        const userPreferences = await getUserPreferencesSummary(context.userId || 'default');

        // First, try to find existing recipes from database
        const { searchRecipes } = await import('./recipes');
        const existingRecipes = await searchRecipes({
            calories: {
                min: Math.max(0, remaining.calories - 200),
                max: remaining.calories + 200,
            },
            proteins: {
                min: Math.max(0, remaining.proteins - 10),
            },
            limit: 5,
        });

        // If we have good matches, return one randomly
        if (existingRecipes.success && existingRecipes.recipes && existingRecipes.recipes.length > 0) {
            const randomRecipe = existingRecipes.recipes[Math.floor(Math.random() * existingRecipes.recipes.length)];

            return {
                success: true,
                recipe: {
                    title: randomRecipe.title,
                    description: randomRecipe.description,
                    ingredients: JSON.parse(randomRecipe.ingredients),
                    instructions: JSON.parse(randomRecipe.instructions),
                    macros: {
                        calories: randomRecipe.calories,
                        proteins: randomRecipe.proteins,
                        carbs: randomRecipe.carbs,
                        fats: randomRecipe.fats,
                    },
                    temps_preparation: randomRecipe.prepTime,
                    imageUrl: randomRecipe.imageUrl, // Include existing image
                    fromDatabase: true,
                    recipeId: randomRecipe.id,
                },
            };
        }

        // Determine max prep time based on user profile
        const isWeekend = new Date().getDay() === 0 || new Date().getDay() === 6;
        const maxPrepTime = context.userProfile 
            ? (isWeekend ? context.userProfile.cookingTimeWeekend : context.userProfile.cookingTimeWeekday) || 30
            : 30;

        // If no matches, generate a new recipe
        const prompt = `
      ${MEAL_PLANNER_SYSTEM_PROMPT}
      
      ${profileContext}
      
      ${userPreferences}
      
      ${MEAL_TYPE_GUIDELINES[context.mealType as keyof typeof MEAL_TYPE_GUIDELINES] || ''}
      
      CONTEXTE NUTRITIONNEL UTILISATEUR :
      - Objectif journalier : ${context.targets.calories} kcal
      - Déjà consommé : ${Math.round(context.consumed.calories)} kcal
      - RESTE À CONSOMMER : ${Math.round(remaining.calories)} kcal
      
      BESOINS EN MACROS RESTANTS :
      - Protéines : ${Math.round(remaining.proteins)}g
      - Glucides : ${Math.round(remaining.carbs)}g
      - Lipides : ${Math.round(remaining.fats)}g
      
      CONTRAINTES DE TEMPS:
      - Temps de préparation maximum: ${maxPrepTime} minutes
      - Jour: ${isWeekend ? 'Weekend (plus de temps disponible)' : 'Semaine (recette rapide préférée)'}
      
      ${context.userProfile?.cookingSkillLevel === 'beginner' ? 'NIVEAU DÉBUTANT: Proposer une recette simple avec peu d\'étapes et des techniques basiques.' : ''}
      ${context.userProfile?.dietaryPreferences ? `RÉGIME: Respecter strictement le régime ${context.userProfile.dietaryPreferences}.` : ''}
      ${context.userProfile?.allergies?.length ? `ALLERGIES: Éviter absolument: ${context.userProfile.allergies.join(', ')}.` : ''}
      
      ${context.userProfile?.fastingSchedule?.type && context.userProfile.fastingSchedule.type !== 'none' ? `
      ⏰ JEÛNE INTERMITTENT ACTIF:
      - Type: ${context.userProfile.fastingSchedule.type === '16_8' ? '16:8' : context.userProfile.fastingSchedule.type === '18_6' ? '18:6' : context.userProfile.fastingSchedule.type === '20_4' ? '20:4 (OMAD)' : context.userProfile.fastingSchedule.type === '5_2' ? '5:2' : context.userProfile.fastingSchedule.type}
      - Fenêtre alimentaire: ${context.userProfile.fastingSchedule.eatingWindowStart || '12:00'} - ${context.userProfile.fastingSchedule.eatingWindowEnd || '20:00'}
      - ADAPTER les repas pour maximiser la satiété et l'énergie pendant la fenêtre alimentaire
      ${context.userProfile.fastingSchedule.type === '20_4' ? '- Repas TRÈS copieux et nutritif car fenêtre courte' : ''}
      ${context.userProfile.fastingSchedule.type === '5_2' ? '- Aujourd\'hui pourrait être un jour de restriction: repas très léger si demandé' : ''}
      ` : ''}
      
      TÂCHE :
      Génère une recette de ${context.mealType} qui aide à combler ces besoins restants, sans dépasser significativement les calories restantes.
      La recette doit ABSOLUMENT respecter les habitudes françaises pour ce type de repas.
      ${context.userProfile?.fastingSchedule?.type && context.userProfile.fastingSchedule.type !== 'none' ? 'Adapter la recette pour le jeûne intermittent (plus rassasiante, riche en protéines et fibres).' : ''}
      
      IMPORTANT: Pour un petit-déjeuner, NE JAMAIS proposer de plats salés complexes comme du saumon grillé, poisson, ou viandes en sauce.
      
      Réponds UNIQUEMENT avec un JSON valide avec cette structure exacte:
      {
        "title": "Nom du plat",
        "description": "Description courte",
        "ingredients": ["ingrédient 1", "ingrédient 2"],
        "instructions": ["étape 1", "étape 2"],
        "macros": {
          "calories": 500,
          "proteins": 30,
          "carbs": 40,
          "fats": 15
        },
        "temps_preparation": 20
      }
    `;

        const result = await models.pro.generateContent(prompt);
        const response = result.response;
        const text = extractTextFromResponse(response);

        const jsonStr = text.replace(/```json\n?|\n?```/g, "").trim();
        const recipe = JSON.parse(jsonStr);

        // Save the newly generated recipe to database
        const { saveRecipe } = await import('./recipes');
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
        });

        // Include the recipeId in the response
        const recipeId = savedResult.success ? savedResult.recipe?.id : undefined;

        // Auto-generate image for new recipe
        let imageUrl = null;
        if (recipeId) {
            console.log('🎨 Auto-generating image for new recipe:', recipe.title);
            const imageResult = await generateFoodImage(recipe.title);

            if (imageResult.success && imageResult.image) {
                imageUrl = imageResult.image;
                // Save image to database
                const { updateRecipeImage } = await import('./recipes');
                await updateRecipeImage(recipeId, imageUrl);
                console.log('✅ Image auto-generated and saved for recipe:', recipeId);
            } else {
                console.warn('⚠️ Failed to auto-generate image:', imageResult.error);
            }
        }

        return {
            success: true,
            recipe: {
                ...recipe,
                fromDatabase: false,
                recipeId,
                imageUrl, // Include the generated image
            }
        };
    } catch (error) {
        console.error("Error in suggestRecipe:", error);
        return { success: false, error: "Failed to suggest recipe" };
    }
}

// Vertex AI Image Generation
import { v1 } from '@google-cloud/aiplatform';
import { helpers } from '@google-cloud/aiplatform';
import { IMAGE_GENERATION_PROMPT_TEMPLATE } from '@/lib/ai/prompts';

export async function generateFoodImage(description: string) {
    try {
        const projectId = process.env.GOOGLE_CLOUD_PROJECT;
        const location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';

        if (!projectId) {
            console.warn("GOOGLE_CLOUD_PROJECT not configured, image generation disabled");
            return { success: false, error: "Image generation not configured. Add GOOGLE_CLOUD_PROJECT to .env" };
        }

        // Initialize Vertex AI
        const clientOptions = {
            apiEndpoint: `${location}-aiplatform.googleapis.com`,
        };

        const predictionServiceClient = new v1.PredictionServiceClient(clientOptions);

        const endpoint = `projects/${projectId}/locations/${location}/publishers/google/models/imagen-3.0-generate-001`;

        const prompt = IMAGE_GENERATION_PROMPT_TEMPLATE(description);

        const instance = {
            prompt: prompt,
        };

        const instanceValue = helpers.toValue(instance);

        const parameter = {
            sampleCount: 1,
            aspectRatio: "1:1",
            safetyFilterLevel: "block_some",
            personGeneration: "allow_adult",
        };

        const parameterValue = helpers.toValue(parameter);

        // @ts-ignore - types for predict are complex
        const [response] = await predictionServiceClient.predict({
            endpoint,
            instances: [instanceValue as any],
            parameters: parameterValue as any,
        });

        if (!response.predictions || response.predictions.length === 0) {
            throw new Error("No image generated");
        }

        const prediction = response.predictions?.[0];
        if (!prediction) {
            throw new Error("No prediction found");
        }
        const predictionValue = helpers.fromValue(prediction as any);
        // @ts-ignore - bytesBase64Encoded exists on the response but types might be outdated
        const base64Image = predictionValue?.bytesBase64Encoded;

        if (!base64Image) {
            throw new Error("No image data in response");
        }

        return { success: true, image: `data:image/png;base64,${base64Image}` };

    } catch (error) {
        console.error("Error in generateFoodImage:", error);
        return { success: false, error: error instanceof Error ? error.message : "Failed to generate image" };
    }
}
