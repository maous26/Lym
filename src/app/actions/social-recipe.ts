'use server';

import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { models, isAIAvailable } from '@/lib/ai/config';
import { awardXp, incrementStat, updateStreak } from './gamification';
import { XP_REWARDS } from '@/lib/gamification-utils';
import { generateFoodImage } from './ai';

// ============================================
// TYPES
// ============================================
type VideoPlatform = 'youtube' | 'instagram' | 'tiktok';

interface VideoInfo {
    platform: VideoPlatform;
    videoId: string;
    url: string;
    thumbnailUrl: string;
}

interface ExtractedRecipe {
    title: string;
    description: string;
    ingredients: Array<{ name: string; quantity: string; unit: string }>;
    instructions: string[];
    nutrition: {
        calories: number;
        proteins: number;
        carbs: number;
        fats: number;
        fiber?: number;
    };
    prepTime: number;
    cookTime: number;
    servings: number;
    difficulty: string;
    tags: string[];
}

// ============================================
// URL PARSING & VALIDATION
// ============================================

function parseVideoUrl(url: string): VideoInfo | null {
    // YouTube patterns
    const youtubePatterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    ];

    for (const pattern of youtubePatterns) {
        const match = url.match(pattern);
        if (match) {
            return {
                platform: 'youtube',
                videoId: match[1],
                url: `https://www.youtube.com/watch?v=${match[1]}`,
                thumbnailUrl: `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg`,
            };
        }
    }

    // Instagram patterns (reels, posts)
    const instagramPatterns = [
        /instagram\.com\/(?:p|reel|reels)\/([a-zA-Z0-9_-]+)/,
    ];

    for (const pattern of instagramPatterns) {
        const match = url.match(pattern);
        if (match) {
            return {
                platform: 'instagram',
                videoId: match[1],
                url: `https://www.instagram.com/reel/${match[1]}/`,
                thumbnailUrl: '', // Instagram thumbnails require API access
            };
        }
    }

    // TikTok patterns
    const tiktokPatterns = [
        /tiktok\.com\/@[^\/]+\/video\/(\d+)/,
        /vm\.tiktok\.com\/([a-zA-Z0-9]+)/,
    ];

    for (const pattern of tiktokPatterns) {
        const match = url.match(pattern);
        if (match) {
            return {
                platform: 'tiktok',
                videoId: match[1],
                url,
                thumbnailUrl: '',
            };
        }
    }

    return null;
}

// ============================================
// TRANSCRIPT EXTRACTION
// ============================================

async function getYouTubeTranscript(videoId: string): Promise<string> {
    try {
        const { YoutubeTranscript } = await import('youtube-transcript');
        const transcript = await YoutubeTranscript.fetchTranscript(videoId);
        return transcript.map((t: { text: string }) => t.text).join(' ');
    } catch (error) {
        console.error('Error fetching YouTube transcript:', error);
        throw new Error('Impossible de récupérer les sous-titres de cette vidéo. Assurez-vous que la vidéo a des sous-titres disponibles.');
    }
}

async function getInstagramContent(videoId: string): Promise<string> {
    // Instagram doesn't have a public transcript API
    // We'll use Gemini to describe what we can get from the page
    // For now, we'll prompt the user to describe the recipe
    throw new Error('Instagram: veuillez copier la description de la recette dans le champ ci-dessous.');
}

// ============================================
// AI RECIPE EXTRACTION
// ============================================

function cleanJsonResponse(text: string): string {
    return text.replace(/```json\n?|\n?```/g, '').trim();
}

async function extractRecipeFromTranscript(transcript: string, videoUrl: string): Promise<ExtractedRecipe> {
    if (!isAIAvailable()) {
        throw new Error("L'IA n'est pas configurée");
    }

    const prompt = `Tu es un expert culinaire et nutritionniste. Analyse ce transcript d'une vidéo de recette et extrais TOUTES les informations.

TRANSCRIPT:
"""
${transcript.substring(0, 15000)}
"""

URL source: ${videoUrl}

INSTRUCTIONS:
1. TITRE DE LA RECETTE (TRÈS IMPORTANT):
   - Si le titre est mentionné explicitement dans le transcript, utilise-le
   - SINON, CRÉE un titre descriptif et appétissant basé sur:
     * L'ingrédient principal (viande, poisson, légume, etc.)
     * La méthode de cuisson (grillé, mijoté, rôti, etc.)
     * L'origine ou le style si évident (à l'italienne, façon asiatique, etc.)
   - Exemples de bons titres: "Poulet rôti aux herbes de Provence", "Curry de légumes crémeux", "Saumon grillé sauce citronnée"
   - NE JAMAIS utiliser "Recette inconnue" ou des titres génériques

2. Liste TOUS les ingrédients avec leurs quantités PRÉCISES (convertis en grammes/ml si possible)
3. Rédige les instructions étape par étape de façon claire
4. CALCULE les valeurs nutritionnelles basées sur les quantités d'ingrédients:
   - Utilise les valeurs nutritionnelles standard des aliments
   - Calcule pour 1 portion
5. Estime le temps de préparation et de cuisson
6. Détermine la difficulté (facile, moyen, difficile)
7. Ajoute des tags pertinents (végétarien, rapide, français, etc.)

Si des informations manquent, fais des estimations raisonnables basées sur le contexte.

RÉPONDS UNIQUEMENT avec ce JSON valide:
{
  "title": "Nom de la recette",
  "description": "Description appétissante en 1-2 phrases",
  "ingredients": [
    { "name": "Ingrédient", "quantity": "200", "unit": "g" }
  ],
  "instructions": [
    "Étape 1: ...",
    "Étape 2: ..."
  ],
  "nutrition": {
    "calories": 450,
    "proteins": 25,
    "carbs": 35,
    "fats": 18,
    "fiber": 5
  },
  "prepTime": 15,
  "cookTime": 25,
  "servings": 4,
  "difficulty": "facile",
  "tags": ["tag1", "tag2"]
}`;

    const result = await models.pro.generateContent(prompt);
    const response = result.response;

    // Extract text from response
    let text: string;
    if (typeof response.text === 'function') {
        text = response.text();
    } else if (response.candidates?.[0]?.content?.parts?.[0]?.text) {
        text = response.candidates[0].content.parts[0].text;
    } else {
        throw new Error('Impossible d\'extraire la réponse');
    }

    const jsonStr = cleanJsonResponse(text);
    return JSON.parse(jsonStr);
}

// ============================================
// MAIN ACTIONS
// ============================================

/**
 * Extract recipe from video URL WITHOUT saving (preview step)
 */
export async function extractVideoRecipe(videoUrl: string, manualDescription?: string): Promise<{
    success: boolean;
    extractedRecipe?: ExtractedRecipe & { videoInfo: VideoInfo };
    error?: string;
}> {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return { success: false, error: 'Non authentifié' };
    }

    try {
        // Parse and validate URL
        const videoInfo = parseVideoUrl(videoUrl);
        if (!videoInfo) {
            return { success: false, error: 'URL non valide. Formats supportés: YouTube, Instagram Reels, TikTok' };
        }

        // Check if recipe from this video already exists
        const existingRecipe = await prisma.recipe.findFirst({
            where: {
                videoId: videoInfo.videoId,
                videoPlatform: videoInfo.platform,
            },
        });

        if (existingRecipe) {
            return { success: false, error: 'Cette vidéo a déjà été soumise !' };
        }

        // Get transcript based on platform
        let transcript: string;

        if (videoInfo.platform === 'youtube') {
            transcript = await getYouTubeTranscript(videoInfo.videoId);
        } else if (manualDescription) {
            transcript = manualDescription;
        } else {
            return {
                success: false,
                error: 'Pour Instagram/TikTok, veuillez ajouter une description de la recette.'
            };
        }

        // Extract recipe using AI (without saving)
        const extractedRecipe = await extractRecipeFromTranscript(transcript, videoUrl);

        return {
            success: true,
            extractedRecipe: {
                ...extractedRecipe,
                videoInfo,
            },
        };
    } catch (error) {
        console.error('Error extracting video recipe:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Erreur lors de l\'extraction de la recette'
        };
    }
}

/**
 * Save a validated/edited recipe
 */
export async function saveValidatedRecipe(
    recipeData: ExtractedRecipe,
    videoInfo: { platform: VideoPlatform; videoId: string; url: string }
): Promise<{
    success: boolean;
    recipe?: any;
    recipeId?: string;
    xpEarned?: number;
    error?: string;
}> {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return { success: false, error: 'Non authentifié' };
    }

    try {
        // Generate AI image for the recipe
        let generatedImageUrl: string | null = null;
        try {
            const imagePrompt = `${recipeData.title}: ${recipeData.description}`;
            const imageResult = await generateFoodImage(imagePrompt);
            if (imageResult.success && imageResult.image) {
                generatedImageUrl = imageResult.image;
            }
        } catch (imageError) {
            console.warn('Could not generate image for recipe:', imageError);
        }

        // Save to database
        const savedRecipe = await prisma.recipe.create({
            data: {
                title: recipeData.title,
                description: recipeData.description,
                imageUrl: generatedImageUrl,
                prepTime: recipeData.prepTime,
                cookTime: recipeData.cookTime,
                servings: recipeData.servings,
                difficulty: recipeData.difficulty,
                calories: recipeData.nutrition.calories,
                proteins: recipeData.nutrition.proteins,
                carbs: recipeData.nutrition.carbs,
                fats: recipeData.nutrition.fats,
                fiber: recipeData.nutrition.fiber,
                ingredients: JSON.stringify(recipeData.ingredients),
                instructions: JSON.stringify(recipeData.instructions),
                tags: JSON.stringify(recipeData.tags),
                source: videoInfo.platform,
                generatedBy: 'gemini',
                videoUrl: videoInfo.url,
                videoId: videoInfo.videoId,
                thumbnailUrl: null,
                videoPlatform: videoInfo.platform,
                authorId: session.user.id,
                status: 'approved',
            },
        });

        // Award XP for submission
        const xpResult = await awardXp(
            session.user.id,
            XP_REWARDS.submit_video_recipe || 50,
            'submit_video_recipe',
            savedRecipe.id,
            'recipe'
        );

        // Update streak
        await updateStreak(session.user.id);

        return {
            success: true,
            recipe: {
                ...savedRecipe,
                ingredients: recipeData.ingredients,
                instructions: recipeData.instructions,
                tags: recipeData.tags,
            },
            recipeId: savedRecipe.id,
            xpEarned: xpResult.xpAwarded,
        };
    } catch (error) {
        console.error('Error saving validated recipe:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Erreur lors de la sauvegarde'
        };
    }
}

/**
 * Submit a video URL and extract the recipe (legacy - kept for compatibility)
 */
export async function submitVideoRecipe(videoUrl: string, manualDescription?: string): Promise<{
    success: boolean;
    recipe?: any;
    recipeId?: string;
    xpEarned?: number;
    error?: string;
}> {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return { success: false, error: 'Non authentifié' };
    }

    try {
        // Parse and validate URL
        const videoInfo = parseVideoUrl(videoUrl);
        if (!videoInfo) {
            return { success: false, error: 'URL non valide. Formats supportés: YouTube, Instagram Reels, TikTok' };
        }

        // Check if recipe from this video already exists
        const existingRecipe = await prisma.recipe.findFirst({
            where: {
                videoId: videoInfo.videoId,
                videoPlatform: videoInfo.platform,
            },
        });

        if (existingRecipe) {
            return { success: false, error: 'Cette vidéo a déjà été soumise !' };
        }

        // Get transcript based on platform
        let transcript: string;

        if (videoInfo.platform === 'youtube') {
            transcript = await getYouTubeTranscript(videoInfo.videoId);
        } else if (manualDescription) {
            // For Instagram/TikTok, use manual description
            transcript = manualDescription;
        } else {
            return {
                success: false,
                error: 'Pour Instagram/TikTok, veuillez ajouter une description de la recette.'
            };
        }

        // Extract recipe using AI
        const extractedRecipe = await extractRecipeFromTranscript(transcript, videoUrl);

        // Generate AI image for the recipe (no YouTube thumbnail for copyright)
        let generatedImageUrl: string | null = null;
        try {
            const imagePrompt = `${extractedRecipe.title}: ${extractedRecipe.description}`;
            const imageResult = await generateFoodImage(imagePrompt);
            if (imageResult.success && imageResult.image) {
                generatedImageUrl = imageResult.image;
            }
        } catch (imageError) {
            console.warn('Could not generate image for recipe:', imageError);
            // Continue without image - not critical
        }

        // Save to database
        const savedRecipe = await prisma.recipe.create({
            data: {
                title: extractedRecipe.title,
                description: extractedRecipe.description,
                imageUrl: generatedImageUrl,
                prepTime: extractedRecipe.prepTime,
                cookTime: extractedRecipe.cookTime,
                servings: extractedRecipe.servings,
                difficulty: extractedRecipe.difficulty,
                calories: extractedRecipe.nutrition.calories,
                proteins: extractedRecipe.nutrition.proteins,
                carbs: extractedRecipe.nutrition.carbs,
                fats: extractedRecipe.nutrition.fats,
                fiber: extractedRecipe.nutrition.fiber,
                ingredients: JSON.stringify(extractedRecipe.ingredients),
                instructions: JSON.stringify(extractedRecipe.instructions),
                tags: JSON.stringify(extractedRecipe.tags),
                source: videoInfo.platform,
                generatedBy: 'gemini',
                videoUrl: videoInfo.url,
                videoId: videoInfo.videoId,
                thumbnailUrl: null, // No YouTube thumbnail for copyright reasons
                videoPlatform: videoInfo.platform,
                transcript: transcript.substring(0, 10000), // Limit storage
                authorId: session.user.id,
                status: 'approved', // Auto-approve for MVP
            },
        });

        // Award XP for submission
        const xpResult = await awardXp(
            session.user.id,
            XP_REWARDS.submit_video_recipe || 50,
            'submit_video_recipe',
            savedRecipe.id,
            'recipe'
        );

        // Update streak
        await updateStreak(session.user.id);

        return {
            success: true,
            recipe: {
                ...savedRecipe,
                ingredients: extractedRecipe.ingredients,
                instructions: extractedRecipe.instructions,
                tags: extractedRecipe.tags,
            },
            recipeId: savedRecipe.id,
            xpEarned: xpResult.xpAwarded,
        };
    } catch (error) {
        console.error('Error submitting video recipe:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Erreur lors de l\'extraction de la recette'
        };
    }
}

/**
 * Get community recipes filtered by user profile
 */
export async function getCommunityRecipes(options?: {
    limit?: number;
    offset?: number;
    excludeUserAllergies?: boolean;
}): Promise<{
    success: boolean;
    recipes?: any[];
    total?: number;
    error?: string;
}> {
    const session = await getServerSession(authOptions);
    const limit = options?.limit || 10;
    const offset = options?.offset || 0;

    try {
        // Get user allergies if filtering requested
        let excludeTags: string[] = [];
        if (session?.user?.id && options?.excludeUserAllergies) {
            const user = await prisma.user.findUnique({
                where: { id: session.user.id },
                select: { allergies: true, intolerances: true },
            });
            if (user?.allergies) {
                excludeTags = JSON.parse(user.allergies);
            }
        }

        // Query recipes
        const [recipes, total] = await Promise.all([
            prisma.recipe.findMany({
                where: {
                    source: { in: ['youtube', 'instagram', 'tiktok', 'community'] },
                    status: 'approved',
                },
                orderBy: [
                    { averageRating: 'desc' },
                    { ratingsCount: 'desc' },
                    { createdAt: 'desc' },
                ],
                take: limit,
                skip: offset,
                include: {
                    author: {
                        select: { id: true, name: true, image: true },
                    },
                },
            }),
            prisma.recipe.count({
                where: {
                    source: { in: ['youtube', 'instagram', 'tiktok', 'community'] },
                    status: 'approved',
                },
            }),
        ]);

        // Parse JSON fields and filter by allergies
        const parsedRecipes = recipes
            .map((r) => ({
                ...r,
                ingredients: JSON.parse(r.ingredients),
                instructions: JSON.parse(r.instructions),
                tags: r.tags ? JSON.parse(r.tags) : [],
            }))
            .filter((r) => {
                if (excludeTags.length === 0) return true;
                // Check if recipe contains allergens
                const recipeTags = r.tags.map((t: string) => t.toLowerCase());
                const ingredientNames = r.ingredients.map((i: any) => i.name.toLowerCase()).join(' ');
                return !excludeTags.some(
                    (allergen) =>
                        recipeTags.includes(allergen.toLowerCase()) ||
                        ingredientNames.includes(allergen.toLowerCase())
                );
            });

        return { success: true, recipes: parsedRecipes, total };
    } catch (error) {
        console.error('Error getting community recipes:', error);
        return { success: false, error: 'Erreur lors de la récupération des recettes' };
    }
}

/**
 * Get top rated community recipes for homepage
 */
export async function getTopCommunityRecipes(limit: number = 5): Promise<{
    success: boolean;
    recipes?: any[];
    error?: string;
}> {
    const session = await getServerSession(authOptions);

    try {
        // Get user preferences for filtering
        let userPrefs: { allergies: string | null; dietType: string | null } | null = null;
        if (session?.user?.id) {
            userPrefs = await prisma.user.findUnique({
                where: { id: session.user.id },
                select: { allergies: true, dietType: true },
            });
        }

        const recipes = await prisma.recipe.findMany({
            where: {
                source: { in: ['youtube', 'instagram', 'tiktok', 'community'] },
                status: 'approved',
                ratingsCount: { gte: 0 }, // Include all for now, can increase threshold later
            },
            orderBy: [
                { averageRating: 'desc' },
                { ratingsCount: 'desc' },
            ],
            take: limit * 2, // Get extra for filtering
            include: {
                author: {
                    select: { id: true, name: true, image: true },
                },
            },
        });

        // Parse and filter
        let parsedRecipes = recipes.map((r) => ({
            ...r,
            ingredients: JSON.parse(r.ingredients),
            instructions: JSON.parse(r.instructions),
            tags: r.tags ? JSON.parse(r.tags) : [],
        }));

        // Filter by user allergies
        if (userPrefs?.allergies) {
            const allergies = JSON.parse(userPrefs.allergies).map((a: string) => a.toLowerCase());
            parsedRecipes = parsedRecipes.filter((r) => {
                const ingredientText = r.ingredients.map((i: any) => i.name.toLowerCase()).join(' ');
                return !allergies.some((a: string) => ingredientText.includes(a));
            });
        }

        return { success: true, recipes: parsedRecipes.slice(0, limit) };
    } catch (error) {
        console.error('Error getting top community recipes:', error);
        return { success: false, error: 'Erreur' };
    }
}

/**
 * Add a community recipe to user's meal plan
 */
export async function addRecipeToMealPlan(
    recipeId: string,
    date: string, // YYYY-MM-DD
    mealType: 'breakfast' | 'lunch' | 'snack' | 'dinner'
): Promise<{ success: boolean; error?: string }> {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return { success: false, error: 'Non authentifié' };
    }

    try {
        // Get recipe
        const recipe = await prisma.recipe.findUnique({
            where: { id: recipeId },
        });

        if (!recipe) {
            return { success: false, error: 'Recette non trouvée' };
        }

        // Find or create meal plan for this week
        const targetDate = new Date(date);
        const startOfWeek = new Date(targetDate);
        startOfWeek.setDate(targetDate.getDate() - targetDate.getDay() + 1); // Monday
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6); // Sunday

        let mealPlan = await prisma.mealPlan.findFirst({
            where: {
                userId: session.user.id,
                startDate: { lte: targetDate },
                endDate: { gte: targetDate },
            },
            include: { days: true },
        });

        if (!mealPlan) {
            mealPlan = await prisma.mealPlan.create({
                data: {
                    userId: session.user.id,
                    startDate: startOfWeek,
                    endDate: endOfWeek,
                    status: 'active',
                },
                include: { days: true },
            });
        }

        // Find or create day
        let mealPlanDay = mealPlan.days.find(
            (d) => d.date.toISOString().split('T')[0] === date
        );

        if (!mealPlanDay) {
            mealPlanDay = await prisma.mealPlanDay.create({
                data: {
                    mealPlanId: mealPlan.id,
                    date: new Date(date),
                },
            });
        }

        // Add planned meal
        await prisma.plannedMeal.create({
            data: {
                mealPlanDayId: mealPlanDay.id,
                type: mealType,
                title: recipe.title,
                description: recipe.description,
                calories: recipe.calories,
                proteins: recipe.proteins,
                carbs: recipe.carbs,
                fats: recipe.fats,
                prepTime: recipe.prepTime,
            },
        });

        return { success: true };
    } catch (error) {
        console.error('Error adding recipe to meal plan:', error);
        return { success: false, error: 'Erreur lors de l\'ajout au plan' };
    }
}

/**
 * Get user's submitted recipes
 */
export async function getUserSubmittedRecipes(): Promise<{
    success: boolean;
    recipes?: any[];
    error?: string;
}> {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return { success: false, error: 'Non authentifié' };
    }

    try {
        const recipes = await prisma.recipe.findMany({
            where: { authorId: session.user.id },
            orderBy: { createdAt: 'desc' },
        });

        const parsedRecipes = recipes.map((r) => ({
            ...r,
            ingredients: JSON.parse(r.ingredients),
            instructions: JSON.parse(r.instructions),
            tags: r.tags ? JSON.parse(r.tags) : [],
        }));

        return { success: true, recipes: parsedRecipes };
    } catch (error) {
        console.error('Error getting user recipes:', error);
        return { success: false, error: 'Erreur' };
    }
}

/**
 * Delete a recipe (only by author)
 */
export async function deleteRecipe(recipeId: string): Promise<{
    success: boolean;
    error?: string;
}> {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return { success: false, error: 'Non authentifié' };
    }

    try {
        // Find the recipe and verify ownership
        const recipe = await prisma.recipe.findUnique({
            where: { id: recipeId },
            select: { authorId: true },
        });

        if (!recipe) {
            return { success: false, error: 'Recette non trouvée' };
        }

        if (recipe.authorId !== session.user.id) {
            return { success: false, error: 'Vous ne pouvez supprimer que vos propres recettes' };
        }

        // Delete the recipe (ratings will cascade delete)
        await prisma.recipe.delete({
            where: { id: recipeId },
        });

        return { success: true };
    } catch (error) {
        console.error('Error deleting recipe:', error);
        return { success: false, error: 'Erreur lors de la suppression' };
    }
}
