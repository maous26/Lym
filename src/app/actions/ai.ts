'use server';

import { v2 as cloudinary } from 'cloudinary';
import { models, isAIAvailable } from '@/lib/ai/config';
import { COACH_SYSTEM_PROMPT, MEAL_PLANNER_SYSTEM_PROMPT, MEAL_TYPE_GUIDELINES, IMAGE_GENERATION_PROMPT_TEMPLATE } from '@/lib/ai/prompts';
import { generateUserProfileContext } from '@/lib/ai/user-context';
import type { UserProfile } from '@/types/user';
import type { NutritionInfo } from '@/types/meal';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload image to Cloudinary permanent storage
 * Downloads the temporary URL and stores it permanently
 */
async function uploadImageToStorage(tempUrl: string, filename: string): Promise<string | null> {
    try {
        // Check if Cloudinary is configured
        if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
            console.warn('Cloudinary not configured, skipping image persistence');
            return null;
        }

        // Upload directly from URL to Cloudinary
        const result = await cloudinary.uploader.upload(tempUrl, {
            folder: 'lym-recipes',
            public_id: filename,
            resource_type: 'image',
            transformation: [
                { width: 1024, height: 1024, crop: 'limit' },
                { quality: 'auto:good' },
                { fetch_format: 'auto' }
            ]
        });

        console.log('Image uploaded to Cloudinary:', result.secure_url);
        return result.secure_url;
    } catch (error) {
        console.error('Error uploading image to Cloudinary:', error);
        return null;
    }
}

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

// Clean JSON from markdown code blocks
function cleanJsonResponse(text: string): string {
    return text.replace(/```json\n?|\n?```/g, "").trim();
}

/**
 * Chat with the AI coach
 */
export async function chatWithCoach(
    message: string,
    context?: {
        consumed?: NutritionInfo;
        targets?: NutritionInfo;
    },
    userProfile?: UserProfile
) {
    try {
        if (!isAIAvailable()) {
            return {
                success: false,
                error: "L'IA n'est pas configurée. Veuillez configurer GOOGLE_CLOUD_PROJECT."
            };
        }

        const profileContext = userProfile ? generateUserProfileContext(userProfile) : '';

        // Build nutrition context if available
        let nutritionContext = '';
        if (context?.consumed && context?.targets) {
            const remaining = {
                calories: Math.max(0, context.targets.calories - context.consumed.calories),
                proteins: Math.max(0, context.targets.proteins - context.consumed.proteins),
                carbs: Math.max(0, context.targets.carbs - context.consumed.carbs),
                fats: Math.max(0, context.targets.fats - context.consumed.fats),
            };

            nutritionContext = `
DONNÉES NUTRITIONNELLES AUJOURD'HUI:
- Calories: ${Math.round(context.consumed.calories)}/${context.targets.calories} kcal (reste: ${Math.round(remaining.calories)} kcal)
- Protéines: ${Math.round(context.consumed.proteins)}/${context.targets.proteins}g (reste: ${Math.round(remaining.proteins)}g)
- Glucides: ${Math.round(context.consumed.carbs)}/${context.targets.carbs}g (reste: ${Math.round(remaining.carbs)}g)
- Lipides: ${Math.round(context.consumed.fats)}/${context.targets.fats}g (reste: ${Math.round(remaining.fats)}g)
`;
        }

        const chat = models.pro.startChat({
            history: [
                {
                    role: "user",
                    parts: [{ text: `System Context: ${COACH_SYSTEM_PROMPT}\n\n${profileContext}\n\n${nutritionContext}` }],
                },
                {
                    role: "model",
                    parts: [{ text: "Compris. Je suis prêt à vous aider en tant que coach nutritionnel personnalisé." }],
                },
            ],
        });

        const result = await chat.sendMessage(message);
        const response = result.response;
        return { success: true, message: extractTextFromResponse(response) };
    } catch (error) {
        console.error("Error in chatWithCoach:", error);
        return { success: false, error: "Impossible d'obtenir une réponse du coach" };
    }
}

/**
 * Generate a single recipe based on request
 */
export async function generateRecipe(request: string, userProfile?: UserProfile) {
    try {
        if (!isAIAvailable()) {
            return {
                success: false,
                error: "L'IA n'est pas configurée. Veuillez configurer GOOGLE_CLOUD_PROJECT."
            };
        }

        const profileContext = userProfile ? generateUserProfileContext(userProfile) : '';

        const prompt = `
${MEAL_PLANNER_SYSTEM_PROMPT}

${profileContext}

Génère une recette détaillée pour : ${request}

IMPORTANT:
- La recette doit être simple et réalisable
- Ingrédients disponibles en supermarché
- Instructions claires étape par étape

Réponds UNIQUEMENT avec un JSON valide avec cette structure exacte:
{
  "title": "Nom du plat",
  "description": "Description courte et appétissante",
  "ingredients": [
    { "name": "ingrédient 1", "quantity": "200", "unit": "g" },
    { "name": "ingrédient 2", "quantity": "1", "unit": "pièce" }
  ],
  "instructions": ["étape 1", "étape 2", "étape 3"],
  "nutrition": {
    "calories": 500,
    "proteins": 30,
    "carbs": 40,
    "fats": 15,
    "fiber": 5,
    "sugar": 8,
    "sodium": 400
  },
  "prepTime": 15,
  "cookTime": 25,
  "servings": 2,
  "difficulty": "facile",
  "tags": ["healthy", "rapide", "économique"]
}
`;

        const result = await models.flash.generateContent(prompt);
        const response = result.response;
        const text = extractTextFromResponse(response);
        const jsonStr = cleanJsonResponse(text);
        const recipe = JSON.parse(jsonStr);

        return { success: true, recipe };
    } catch (error) {
        console.error("Error in generateRecipe:", error);
        return { success: false, error: "Impossible de générer la recette" };
    }
}

/**
 * Suggest a recipe based on nutritional context
 */
export async function suggestRecipe(context: {
    consumed: NutritionInfo;
    targets: NutritionInfo;
    mealType: 'breakfast' | 'lunch' | 'snack' | 'dinner';
    userProfile?: UserProfile;
}) {
    try {
        if (!isAIAvailable()) {
            return {
                success: false,
                error: "L'IA n'est pas configurée. Veuillez configurer GOOGLE_CLOUD_PROJECT."
            };
        }

        const remaining = {
            calories: Math.max(0, context.targets.calories - context.consumed.calories),
            proteins: Math.max(0, context.targets.proteins - context.consumed.proteins),
            carbs: Math.max(0, context.targets.carbs - context.consumed.carbs),
            fats: Math.max(0, context.targets.fats - context.consumed.fats),
        };

        const profileContext = context.userProfile ? generateUserProfileContext(context.userProfile) : '';
        const mealGuidelines = MEAL_TYPE_GUIDELINES[context.mealType] || '';

        // Determine max prep time based on user profile
        const isWeekend = new Date().getDay() === 0 || new Date().getDay() === 6;
        const maxPrepTime = context.userProfile
            ? (isWeekend ? context.userProfile.cookingTimeWeekend : context.userProfile.cookingTimeWeekday) || 30
            : 30;

        const prompt = `
${MEAL_PLANNER_SYSTEM_PROMPT}

${profileContext}

${mealGuidelines}

CONTEXTE NUTRITIONNEL UTILISATEUR:
- Objectif journalier: ${context.targets.calories} kcal
- Déjà consommé: ${Math.round(context.consumed.calories)} kcal
- RESTE À CONSOMMER: ${Math.round(remaining.calories)} kcal

BESOINS EN MACROS RESTANTS:
- Protéines: ${Math.round(remaining.proteins)}g
- Glucides: ${Math.round(remaining.carbs)}g
- Lipides: ${Math.round(remaining.fats)}g

CONTRAINTES DE TEMPS:
- Temps de préparation maximum: ${maxPrepTime} minutes
- Jour: ${isWeekend ? 'Weekend (plus de temps disponible)' : 'Semaine (recette rapide préférée)'}

${context.userProfile?.cookingSkillLevel === 'beginner' ? 'NIVEAU DÉBUTANT: Proposer une recette simple avec peu d\'étapes et des techniques basiques.' : ''}
${context.userProfile?.dietType ? `RÉGIME: Respecter strictement le régime ${context.userProfile.dietType}.` : ''}
${context.userProfile?.allergies?.length ? `ALLERGIES: Éviter absolument: ${context.userProfile.allergies.join(', ')}.` : ''}

TÂCHE:
Génère une recette de ${context.mealType} qui aide à combler ces besoins restants, sans dépasser significativement les calories restantes.
La recette doit ABSOLUMENT respecter les habitudes françaises pour ce type de repas.

IMPORTANT: Pour un petit-déjeuner, NE JAMAIS proposer de plats salés complexes comme du saumon grillé, poisson, ou viandes en sauce.

Réponds UNIQUEMENT avec un JSON valide avec cette structure exacte:
{
  "title": "Nom du plat",
  "description": "Description courte",
  "ingredients": [
    { "name": "ingrédient 1", "quantity": "200", "unit": "g" }
  ],
  "instructions": ["étape 1", "étape 2"],
  "nutrition": {
    "calories": 500,
    "proteins": 30,
    "carbs": 40,
    "fats": 15,
    "fiber": 5,
    "sugar": 8,
    "sodium": 400
  },
  "prepTime": 20,
  "cookTime": 15,
  "servings": 1,
  "difficulty": "facile",
  "tags": ["healthy", "rapide"]
}
`;

        const result = await models.pro.generateContent(prompt);
        const response = result.response;
        const text = extractTextFromResponse(response);
        const jsonStr = cleanJsonResponse(text);
        const recipe = JSON.parse(jsonStr);

        return { success: true, recipe };
    } catch (error) {
        console.error("Error in suggestRecipe:", error);
        return { success: false, error: "Impossible de suggérer une recette" };
    }
}

/**
 * Generate food image using OpenAI DALL-E 3 and persist to permanent storage
 */
export async function generateFoodImage(description: string): Promise<{ success: boolean; image?: string; error?: string }> {
    try {
        const apiKey = process.env.OPENAI_API_KEY;

        if (!apiKey) {
            console.log('OpenAI API key not configured');
            return { success: false, error: "OPENAI_API_KEY not configured" };
        }

        const prompt = IMAGE_GENERATION_PROMPT_TEMPLATE(description);
        console.log('Generating image with DALL-E 3:', prompt.substring(0, 100));

        const response = await fetch('https://api.openai.com/v1/images/generations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: 'dall-e-3',
                prompt: prompt,
                n: 1,
                size: '1024x1024',
                quality: 'standard',
                response_format: 'url',
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('DALL-E API error:', response.status, errorData);
            return { success: false, error: `DALL-E error: ${response.status}` };
        }

        const data = await response.json();
        const tempImageUrl = data.data?.[0]?.url;

        if (!tempImageUrl) {
            console.error('No image URL in response:', data);
            return { success: false, error: "No image URL in response" };
        }

        console.log('Image generated successfully, persisting to storage...');

        // Generate unique filename based on timestamp and description hash
        const timestamp = Date.now();
        const descHash = description.slice(0, 30).replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
        const filename = `${timestamp}-${descHash}`;

        // Upload to permanent storage (Vercel Blob)
        const permanentUrl = await uploadImageToStorage(tempImageUrl, filename);

        if (permanentUrl) {
            console.log('Image persisted successfully:', permanentUrl);
            return { success: true, image: permanentUrl };
        } else {
            // Fallback to temp URL if storage fails (better than nothing)
            console.warn('Storage failed, returning temporary URL');
            return { success: true, image: tempImageUrl };
        }

    } catch (error) {
        console.error("Error in generateFoodImage:", error);
        return { success: false, error: error instanceof Error ? error.message : "Failed to generate image" };
    }
}

/**
 * Generate detailed recipe from a meal plan item
 * Used when viewing recipe details in the weekly planner
 */
export async function generateRecipeDetails(meal: {
    name: string;
    description?: string;
    calories: number;
    proteins: number;
    carbs: number;
    fats: number;
    prepTime: number;
    type: string;
}, userProfile?: UserProfile) {
    try {
        if (!isAIAvailable()) {
            return {
                success: false,
                error: "L'IA n'est pas configurée. Veuillez configurer GOOGLE_CLOUD_PROJECT."
            };
        }

        const profileContext = userProfile ? generateUserProfileContext(userProfile) : '';

        const mealTypeLabels: Record<string, string> = {
            breakfast: 'petit-déjeuner',
            lunch: 'déjeuner',
            snack: 'collation',
            dinner: 'dîner'
        };

        const prompt = `
Tu es un chef cuisinier français expert. Tu dois créer une recette COMPLÈTE et DÉTAILLÉE.

${profileContext}

PLAT À PRÉPARER: "${meal.name}"
Description: ${meal.description || 'Plat savoureux et équilibré'}
Type de repas: ${mealTypeLabels[meal.type] || meal.type}
Temps de préparation: ${meal.prepTime} minutes maximum

OBJECTIFS NUTRITIONNELS (pour 1 personne):
- Calories: environ ${meal.calories} kcal
- Protéines: environ ${meal.proteins}g
- Glucides: environ ${meal.carbs}g
- Lipides: environ ${meal.fats}g

INSTRUCTIONS IMPORTANTES:
1. Liste TOUS les ingrédients avec quantités PRÉCISES (grammes, ml, pièces)
2. Minimum 5-8 ingrédients pour une recette complète
3. Instructions DÉTAILLÉES étape par étape (minimum 5 étapes)
4. Chaque étape doit être claire et actionnable
5. Ajoute 2-3 astuces de chef utiles
6. Les ingrédients doivent être disponibles en supermarché français

Réponds UNIQUEMENT avec ce JSON (pas de texte avant ou après):
{
  "ingredients": [
    { "name": "Poulet (filet)", "quantity": "150", "unit": "g" },
    { "name": "Huile d'olive", "quantity": "1", "unit": "c. à soupe" },
    { "name": "Ail", "quantity": "2", "unit": "gousses" },
    { "name": "Sel", "quantity": "1", "unit": "pincée" },
    { "name": "Poivre noir", "quantity": "1", "unit": "pincée" }
  ],
  "instructions": [
    "Sortir le poulet du réfrigérateur 15 minutes avant pour qu'il soit à température ambiante.",
    "Émincer finement l'ail et réserver.",
    "Faire chauffer l'huile d'olive dans une poêle à feu moyen-vif.",
    "Saisir le poulet 4-5 minutes de chaque côté jusqu'à coloration dorée.",
    "Ajouter l'ail, baisser le feu et cuire encore 2 minutes.",
    "Assaisonner de sel et poivre, laisser reposer 2 minutes avant de servir."
  ],
  "tips": [
    "Pour un poulet plus juteux, ne le coupez pas immédiatement après cuisson.",
    "Vous pouvez remplacer l'huile d'olive par du beurre pour plus de saveur.",
    "Accompagnez de riz basmati ou de légumes grillés."
  ]
}
`;

        const result = await models.pro.generateContent(prompt);
        const response = result.response;
        const text = extractTextFromResponse(response);
        const jsonStr = cleanJsonResponse(text);
        const recipe = JSON.parse(jsonStr);

        // Validate and ensure minimum content
        if (!recipe.ingredients || recipe.ingredients.length < 3) {
            throw new Error('Recette incomplète');
        }
        if (!recipe.instructions || recipe.instructions.length < 3) {
            throw new Error('Instructions incomplètes');
        }

        return { success: true, recipe };
    } catch (error) {
        console.error("Error in generateRecipeDetails:", error);
        return { success: false, error: "Impossible de générer les détails de la recette" };
    }
}

/**
 * Generate multiple recipe suggestions
 */
export async function generateRecipeSuggestions(
    count: number = 3,
    mealType: 'breakfast' | 'lunch' | 'snack' | 'dinner',
    userProfile?: UserProfile
) {
    try {
        if (!isAIAvailable()) {
            return {
                success: false,
                error: "L'IA n'est pas configurée. Veuillez configurer GOOGLE_CLOUD_PROJECT."
            };
        }

        const profileContext = userProfile ? generateUserProfileContext(userProfile) : '';
        const mealGuidelines = MEAL_TYPE_GUIDELINES[mealType] || '';

        const prompt = `
${MEAL_PLANNER_SYSTEM_PROMPT}

${profileContext}

${mealGuidelines}

Génère ${count} suggestions de recettes pour un ${mealType === 'breakfast' ? 'petit-déjeuner' : mealType === 'lunch' ? 'déjeuner' : mealType === 'snack' ? 'collation' : 'dîner'}.

IMPORTANT:
- Recettes variées et différentes
- Adaptées au profil utilisateur
- Simples et réalisables

Réponds UNIQUEMENT avec un JSON valide:
{
  "suggestions": [
    {
      "title": "Nom du plat",
      "description": "Description courte",
      "calories": 500,
      "proteins": 30,
      "carbs": 40,
      "fats": 15,
      "prepTime": 20,
      "difficulty": "facile",
      "tags": ["healthy", "rapide"]
    }
  ]
}
`;

        const result = await models.flash.generateContent(prompt);
        const response = result.response;
        const text = extractTextFromResponse(response);
        const jsonStr = cleanJsonResponse(text);
        const data = JSON.parse(jsonStr);

        return { success: true, suggestions: data.suggestions || [] };
    } catch (error) {
        console.error("Error in generateRecipeSuggestions:", error);
        return { success: false, error: "Impossible de générer les suggestions" };
    }
}
