'use server';

import { models, isAIAvailable } from '@/lib/ai/config';
import { FOOD_PHOTO_ANALYSIS_PROMPT, QUICK_FOOD_ANALYSIS_PROMPT } from '@/lib/ai/prompts';
import type { NutritionInfo } from '@/types/meal';

// Types for food analysis results
export interface AnalyzedFood {
    name: string;
    description: string;
    estimatedWeight: number;
    ingredients: string[];
    nutrition: NutritionInfo;
    confidence: number;
}

export interface FoodAnalysisResult {
    success: boolean;
    foods?: AnalyzedFood[];
    totalNutrition?: NutritionInfo;
    mealType?: 'breakfast' | 'lunch' | 'snack' | 'dinner';
    notes?: string;
    error?: string;
}

export interface QuickAnalysisResult {
    success: boolean;
    name?: string;
    description?: string;
    calories?: number;
    proteins?: number;
    carbs?: number;
    fats?: number;
    confidence?: number;
    error?: string;
}

// Clean JSON from markdown code blocks
function cleanJsonResponse(text: string): string {
    return text.replace(/```json\n?|\n?```/g, "").trim();
}

/**
 * Analyze a food photo using Gemini Vision
 * Returns detailed nutritional information about the food in the image
 */
export async function analyzeFoodPhoto(
    imageBase64: string,
    mimeType: string = 'image/jpeg'
): Promise<FoodAnalysisResult> {
    try {
        if (!isAIAvailable()) {
            return {
                success: false,
                error: "L'IA n'est pas configurée. Veuillez configurer GOOGLE_CLOUD_PROJECT."
            };
        }

        // Remove data URL prefix if present
        const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');

        // Use Gemini Pro Vision for image analysis
        const result = await models.pro.generateContent([
            {
                inlineData: {
                    mimeType: mimeType,
                    data: base64Data
                }
            },
            { text: FOOD_PHOTO_ANALYSIS_PROMPT }
        ]);

        const response = result.response;
        const text = typeof response.text === 'function'
            ? response.text()
            : response.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
            throw new Error('No response from AI');
        }

        const jsonStr = cleanJsonResponse(text);
        const data = JSON.parse(jsonStr);

        if (!data.success) {
            return {
                success: false,
                error: data.error || "Impossible d'analyser cette image"
            };
        }

        return {
            success: true,
            foods: data.foods,
            totalNutrition: data.totalNutrition,
            mealType: data.mealType,
            notes: data.notes
        };

    } catch (error) {
        console.error("Error in analyzeFoodPhoto:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Erreur lors de l'analyse de la photo"
        };
    }
}

/**
 * Quick food analysis for faster results
 * Returns simplified nutritional estimation
 */
export async function quickAnalyzeFoodPhoto(
    imageBase64: string,
    mimeType: string = 'image/jpeg'
): Promise<QuickAnalysisResult> {
    try {
        if (!isAIAvailable()) {
            return {
                success: false,
                error: "L'IA n'est pas configurée."
            };
        }

        // Remove data URL prefix if present
        const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');

        // Use Gemini Flash for faster analysis
        const result = await models.flash.generateContent([
            {
                inlineData: {
                    mimeType: mimeType,
                    data: base64Data
                }
            },
            { text: QUICK_FOOD_ANALYSIS_PROMPT }
        ]);

        const response = result.response;
        const text = typeof response.text === 'function'
            ? response.text()
            : response.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
            throw new Error('No response from AI');
        }

        const jsonStr = cleanJsonResponse(text);
        const data = JSON.parse(jsonStr);

        if (data.error) {
            return {
                success: false,
                error: data.error
            };
        }

        return {
            success: true,
            name: data.name,
            description: data.description,
            calories: data.calories,
            proteins: data.proteins,
            carbs: data.carbs,
            fats: data.fats,
            confidence: data.confidence
        };

    } catch (error) {
        console.error("Error in quickAnalyzeFoodPhoto:", error);
        return {
            success: false,
            error: "Erreur lors de l'analyse rapide"
        };
    }
}

/**
 * Analyze multiple food photos and combine results
 */
export async function analyzeMultipleFoodPhotos(
    images: Array<{ base64: string; mimeType?: string }>
): Promise<FoodAnalysisResult> {
    try {
        const results = await Promise.all(
            images.map(img => analyzeFoodPhoto(img.base64, img.mimeType || 'image/jpeg'))
        );

        // Combine all successful results
        const allFoods: AnalyzedFood[] = [];
        const notes: string[] = [];

        for (const result of results) {
            if (result.success && result.foods) {
                allFoods.push(...result.foods);
                if (result.notes) {
                    notes.push(result.notes);
                }
            }
        }

        if (allFoods.length === 0) {
            return {
                success: false,
                error: "Aucun aliment détecté dans les images"
            };
        }

        // Calculate total nutrition
        const totalNutrition: NutritionInfo = {
            calories: 0,
            proteins: 0,
            carbs: 0,
            fats: 0,
            fiber: 0,
            sugar: 0,
            sodium: 0
        };

        for (const food of allFoods) {
            totalNutrition.calories += food.nutrition.calories;
            totalNutrition.proteins += food.nutrition.proteins;
            totalNutrition.carbs += food.nutrition.carbs;
            totalNutrition.fats += food.nutrition.fats;
            totalNutrition.fiber = (totalNutrition.fiber || 0) + (food.nutrition.fiber || 0);
            totalNutrition.sugar = (totalNutrition.sugar || 0) + (food.nutrition.sugar || 0);
            totalNutrition.sodium = (totalNutrition.sodium || 0) + (food.nutrition.sodium || 0);
        }

        return {
            success: true,
            foods: allFoods,
            totalNutrition,
            notes: notes.length > 0 ? notes.join(' | ') : undefined
        };

    } catch (error) {
        console.error("Error in analyzeMultipleFoodPhotos:", error);
        return {
            success: false,
            error: "Erreur lors de l'analyse des photos"
        };
    }
}
