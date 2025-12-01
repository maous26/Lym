'use server';

import { models } from '@/lib/ai/config';
import { generateFoodImage } from './ai';

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

interface ExtractedRecipe {
    title: string;
    description: string;
    ingredients: string[];
    instructions: string[];
    prepTime: number;
    calories: number;
    proteins: number;
    carbs: number;
    fats: number;
    imageUrl: string;
    originalUrl: string;
    platform: string;
}

/**
 * Extract recipe from text content using AI
 */
export async function extractRecipeFromText(
    recipeText: string,
    sourceUrl?: string
): Promise<{
    success: boolean;
    recipe?: ExtractedRecipe;
    error?: string;
}> {
    try {
        // Detect platform from URL if provided
        let platform = 'unknown';
        if (sourceUrl) {
            if (sourceUrl.includes('instagram')) platform = 'instagram';
            else if (sourceUrl.includes('tiktok')) platform = 'tiktok';
            else if (sourceUrl.includes('youtube') || sourceUrl.includes('youtu.be')) platform = 'youtube';
        }

        const model = models.flash;

        const prompt = `Tu es un expert en analyse de recettes de cuisine.

Analyse ce texte de recette et extrait les informations structurées :

${recipeText}

${sourceUrl ? `Source : ${sourceUrl} (${platform})` : ''}

Retourne un JSON avec cette structure EXACTE :
{
  "title": "Nom de la recette",
  "description": "Description courte et appétissante (max 100 caractères)",
  "ingredients": ["ingrédient 1 avec quantité", "ingrédient 2 avec quantité", ...],
  "instructions": ["étape 1", "étape 2", ...],
  "prepTime": 30,
  "calories": 450,
  "proteins": 35,
  "carbs": 40,
  "fats": 15
}

RÈGLES STRICTES :
- Titre clair et accrocheur
- Extraire TOUS les ingrédients avec quantités précises
- Extraire TOUTES les étapes dans l'ordre
- Si les macros ne sont pas mentionnées, estime-les de façon réaliste
- Temps de préparation réaliste (15-60 min)
- Calories entre 200-800, protéines 15-60g, glucides 20-100g, lipides 10-40g

Retourne UNIQUEMENT le JSON, sans markdown ni texte supplémentaire.`;

        const result = await model.generateContent(prompt);
        const response = result.response;
        const responseText = extractTextFromResponse(response);

        // Clean response
        let jsonText = responseText.trim();
        if (jsonText.startsWith('```json')) {
            jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
        } else if (jsonText.startsWith('```')) {
            jsonText = jsonText.replace(/```\n?/g, '');
        }

        const recipeData = JSON.parse(jsonText);

        // Generate AI image based on the recipe
        console.log('Generating image for:', recipeData.title);
        const imageResult = await generateFoodImage(
            `${recipeData.title}, ${recipeData.description}, professional food photography, appetizing, high quality, realistic`
        );
        console.log('Image generated:', imageResult.success);

        const extractedRecipe: ExtractedRecipe = {
            ...recipeData,
            imageUrl: imageResult.image || '',
            originalUrl: sourceUrl || '',
            platform,
        };

        return {
            success: true,
            recipe: extractedRecipe,
        };
    } catch (error) {
        console.error('Error extracting recipe from text:', error);
        return {
            success: false,
            error: 'Impossible de traiter la recette. Vérifiez le format.',
        };
    }
}

/**
 * Extract recipe from social media URL using AI
 * DEPRECATED: Use extractRecipeFromText instead
 */
export async function extractRecipeFromUrl(url: string): Promise<{
    success: boolean;
    recipe?: ExtractedRecipe;
    error?: string;
}> {
    try {
        // Detect platform
        let platform = 'unknown';
        if (url.includes('instagram')) platform = 'instagram';
        else if (url.includes('tiktok')) platform = 'tiktok';
        else if (url.includes('youtube') || url.includes('youtu.be')) platform = 'youtube';

        // For now, we'll simulate extraction with AI
        // In production, you'd scrape the actual content
        const model = models.flash;

        const prompt = `Tu es un expert en création de recettes inspirées des réseaux sociaux.

URL fournie : ${url}
Plateforme détectée : ${platform}

TÂCHE : Génère une recette authentique, moderne et appétissante dans le style typique de ${platform}.

${platform === 'instagram' ? '📸 Style Instagram : Visuel, healthy, tendance, présenté de façon esthétique. Pense aux bowl, salades colorées, smoothies, buddha bowls, avocado toasts, etc.' : ''}
${platform === 'tiktok' ? '🎵 Style TikTok : Rapide, fun, viral, facile à reproduire. Pense aux recettes "hack", wraps tendances, pâtes crémeuses, desserts rapides, etc.' : ''}
${platform === 'youtube' ? '📹 Style YouTube : Détaillé, technique, recette complète. Peut être plus élaboré avec plusieurs étapes.' : ''}

Retourne un JSON avec cette structure EXACTE :
{
  "title": "Nom accrocheur et moderne (ex: Bowl Buddha Protéiné, Pasta Crémeuse Virale, etc.)",
  "description": "Description courte et appétissante en français",
  "ingredients": ["200g de poulet", "100g de riz basmati", "1 avocat mûr", ...],
  "instructions": ["Faire cuire le riz selon les instructions", "Couper le poulet en dés...", ...],
  "prepTime": 30,
  "calories": 450,
  "proteins": 35,
  "carbs": 40,
  "fats": 15
}

RÈGLES STRICTES :
- Titre en français, moderne et accrocheur (pas de "Délicieux poulet" mais "Bowl Poulet Thaï" ou "Poulet Crémeux au Curry")
- 6-10 ingrédients avec quantités PRÉCISES (grammes, cuillères, pièces)
- 5-8 étapes CLAIRES et CONCISES (pas de roman, style recette moderne)
- Macros RÉALISTES : calories entre 300-700, protéines 20-50g, glucides 30-80g, lipides 10-30g
- Temps de préparation réaliste (15-60 min)
- Recette équilibrée et appétissante
- Inspiration française/méditerranéenne de préférence

Retourne UNIQUEMENT le JSON, sans markdown ni texte supplémentaire.`;

        const result = await model.generateContent(prompt);
        const response = result.response;
        const responseText = extractTextFromResponse(response);

        // Clean response
        let jsonText = responseText.trim();
        if (jsonText.startsWith('```json')) {
            jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
        } else if (jsonText.startsWith('```')) {
            jsonText = jsonText.replace(/```\n?/g, '');
        }

        const recipeData = JSON.parse(jsonText);

        // Generate AI image based on the recipe
        const imageResult = await generateFoodImage(
            `${recipeData.title}, ${recipeData.description}, professional food photography, appetizing, high quality`
        );

        const extractedRecipe: ExtractedRecipe = {
            ...recipeData,
            imageUrl: imageResult.image || '',
            originalUrl: url,
            platform,
        };

        return {
            success: true,
            recipe: extractedRecipe,
        };
    } catch (error) {
        console.error('Error extracting recipe:', error);
        return {
            success: false,
            error: 'Impossible d\'extraire la recette. Vérifiez le lien.',
        };
    }
}

/**
 * Save extracted recipe to database
 */
export async function saveExtractedRecipe(
    recipe: ExtractedRecipe, 
    userId: string = 'default',
    userName: string = 'Anonyme'
) {
    try {
        const { saveRecipe } = await import('./recipes');

        const result = await saveRecipe({
            title: recipe.title,
            description: recipe.description,
            ingredients: recipe.ingredients,
            instructions: recipe.instructions,
            prepTime: recipe.prepTime,
            calories: recipe.calories,
            proteins: recipe.proteins,
            carbs: recipe.carbs,
            fats: recipe.fats,
            imageUrl: recipe.imageUrl,
            source: 'USER_SHARED', // New source type
            userId,
            creatorId: userId,
            creatorName: userName,
        });

        return result;
    } catch (error) {
        console.error('Error saving extracted recipe:', error);
        return {
            success: false,
            error: 'Erreur lors de la sauvegarde',
        };
    }
}
