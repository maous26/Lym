'use client';

import { useState } from 'react';
import { generateRecipe, generateFoodImage, suggestRecipe } from '@/app/actions/ai';
import { rateRecipe } from '@/app/actions/recipes';
import { Loader2, Sparkles, ChefHat, ImageIcon, BrainCircuit, PenLine, Star, MessageCircle } from 'lucide-react';
import { Product } from '@/types/product';
import { useMealStore } from '@/store/meal-store';
import Image from 'next/image';
import { RecipeFeedbackModal } from '@/components/features/feedback/RecipeFeedbackModal';
import { QuickFeedbackButtons } from '@/components/features/feedback/QuickFeedbackButtons';

interface AIMealGeneratorProps {
    onMealGenerated: (product: Product) => void;
}

export function AIMealGenerator({ onMealGenerated }: AIMealGeneratorProps) {
    const [mode, setMode] = useState<'analyze' | 'suggest'>('analyze');
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [generatedRecipe, setGeneratedRecipe] = useState<any>(null);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [imageError, setImageError] = useState<string | null>(null);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);

    const { getDailyNutrition, selectedDate } = useMealStore();

    const handleGenerate = async () => {
        if (!prompt.trim()) return;

        setIsLoading(true);
        setGeneratedRecipe(null);
        setGeneratedImage(null);
        setRating(0);
        setImageError(null);

        try {
            const result = await generateRecipe(prompt);
            console.log("Generate recipe result:", result);
            if (result.success && result.recipe) {
                console.log("Setting recipe:", result.recipe);
                setGeneratedRecipe(result.recipe);

                // Auto-load image if available
                if (result.recipe.imageUrl) {
                    setGeneratedImage(result.recipe.imageUrl);
                }
            } else {
                console.error("Recipe generation failed:", result);
            }
        } catch (error) {
            console.error("Error generating recipe:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSuggest = async () => {
        setIsLoading(true);
        setGeneratedRecipe(null);
        setGeneratedImage(null);
        setRating(0);
        setImageError(null);

        try {
            // Get current nutrition state
            // TODO: Get real targets from user profile
            const targets = { calories: 2000, proteins: 150, carbs: 250, fats: 70 };
            const dailyStats = getDailyNutrition(selectedDate, targets);

            const context = {
                consumed: {
                    calories: dailyStats.calories,
                    proteins: dailyStats.proteins,
                    carbs: dailyStats.carbs,
                    fats: dailyStats.fats
                },
                targets,
                mealType: 'repas équilibré' // Could be dynamic based on time of day
            };

            const result = await suggestRecipe(context);
            console.log("Suggest recipe result:", result);
            if (result.success && result.recipe) {
                console.log("Setting suggested recipe:", result.recipe);
                setGeneratedRecipe(result.recipe);

                // If recipe has an existing image, load it
                if (result.recipe.imageUrl) {
                    setGeneratedImage(result.recipe.imageUrl);
                }
            } else {
                console.error("Recipe suggestion failed:", result);
            }
        } catch (error) {
            console.error("Error suggesting recipe:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerateImage = async () => {
        if (!generatedRecipe || isGeneratingImage) return;

        setIsGeneratingImage(true);
        setImageError(null);
        try {
            const result = await generateFoodImage(generatedRecipe.title);
            if (result.success && result.image) {
                setGeneratedImage(result.image);

                // Save image to database if recipe has an ID
                if (generatedRecipe.recipeId) {
                    const { updateRecipeImage } = await import('@/app/actions/recipes');
                    await updateRecipeImage(generatedRecipe.recipeId, result.image);
                    console.log('✅ Image saved to database for recipe:', generatedRecipe.recipeId);
                }
            } else {
                setImageError(result.error || "Échec de la génération");
            }
        } catch (error) {
            console.error("Error generating image:", error);
            setImageError("Erreur inattendue");
        } finally {
            setIsGeneratingImage(false);
        }
    };

    const handleRating = async (score: number) => {
        setRating(score);

        if (generatedRecipe?.recipeId) {
            try {
                await rateRecipe(generatedRecipe.recipeId, score);
            } catch (error) {
                console.error("Error saving rating:", error);
            }
        }
    };

    const handleSelect = () => {
        if (!generatedRecipe) return;

        const product: Product = {
            id: `ai-${Date.now()}`,
            name: generatedRecipe.title,
            calories: generatedRecipe.macros.calories,
            proteins: generatedRecipe.macros.proteins,
            carbs: generatedRecipe.macros.carbs,
            fats: generatedRecipe.macros.lipides || generatedRecipe.macros.fats,
            source: 'AI',
            brand: 'Maison',
            image: generatedImage || undefined
        };

        onMealGenerated(product);
    };

    return (
        <div className="space-y-6">
            {/* Mode Selection */}
            <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
                <button
                    onClick={() => setMode('analyze')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all ${mode === 'analyze'
                        ? 'bg-white text-emerald-600 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <PenLine size={18} />
                    Je décris
                </button>
                <button
                    onClick={() => setMode('suggest')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all ${mode === 'suggest'
                        ? 'bg-white text-purple-600 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <BrainCircuit size={18} />
                    Suggère-moi
                </button>
            </div>

            <div className={`p-6 rounded-2xl border transition-colors ${mode === 'analyze'
                ? 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-100'
                : 'bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-100'
                }`}>
                <div className="flex items-center gap-3 mb-4">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${mode === 'analyze' ? 'bg-emerald-100 text-emerald-600' : 'bg-purple-100 text-purple-600'
                        }`}>
                        {mode === 'analyze' ? <Sparkles size={20} /> : <BrainCircuit size={20} />}
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">
                            {mode === 'analyze' ? 'Assistant Chef IA' : 'Suggestion Intelligente'}
                        </h3>
                        <p className="text-xs text-gray-500">
                            {mode === 'analyze'
                                ? 'Décrivez votre repas, je calcule tout !'
                                : 'Je propose un repas adapté à vos besoins restants.'}
                        </p>
                    </div>
                </div>

                {mode === 'analyze' ? (
                    <div className="relative">
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Ex: Omelette avec 3 œufs, épinards et fromage de chèvre..."
                            className="w-full p-4 rounded-xl border border-emerald-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none min-h-[100px] text-gray-800 placeholder:text-gray-400 bg-white/80"
                        />
                        <button
                            onClick={handleGenerate}
                            disabled={isLoading || !prompt.trim()}
                            className="absolute bottom-3 right-3 bg-emerald-500 text-white p-2 rounded-lg hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isLoading ? <Loader2 size={20} className="animate-spin" /> : <ChefHat size={20} />}
                        </button>
                    </div>
                ) : (
                    <div className="text-center py-4">
                        <p className="text-sm text-gray-600 mb-4">
                            Basé sur votre journal, je vais calculer les calories et macros manquants pour atteindre vos objectifs.
                        </p>
                        <button
                            onClick={handleSuggest}
                            disabled={isLoading}
                            className="w-full bg-purple-600 text-white py-3 rounded-xl font-bold hover:bg-purple-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 size={20} className="animate-spin" />
                                    Analyse en cours...
                                </>
                            ) : (
                                <>
                                    <Sparkles size={20} />
                                    Générer une suggestion parfaite
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>

            {generatedRecipe && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-in fade-in slide-in-from-bottom-4">
                    <div className="flex items-start justify-between mb-2">
                        <h3 className="text-xl font-bold text-gray-900 flex-1">{generatedRecipe.title}</h3>
                        {generatedRecipe.fromDatabase && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                Base de données
                            </span>
                        )}
                    </div>

                    {generatedRecipe.description && (
                        <p className="text-sm text-gray-600 mb-4">{generatedRecipe.description}</p>
                    )}

                    {/* Image */}
                    {generatedImage && (
                        <div className="relative w-full h-48 rounded-xl overflow-hidden mb-4">
                            <Image src={generatedImage} alt={generatedRecipe.title} fill className="object-cover" />
                        </div>
                    )}

                    {/* Macros */}
                    <div className="grid grid-cols-4 gap-2 mb-4">
                        <div className="text-center p-2 bg-gray-50 rounded-lg">
                            <span className="block text-xs text-gray-500">Calories</span>
                            <span className="font-bold text-gray-900">{generatedRecipe.macros.calories}</span>
                        </div>
                        <div className="text-center p-2 bg-blue-50 rounded-lg">
                            <span className="block text-xs text-blue-500">Prot.</span>
                            <span className="font-bold text-blue-700">{generatedRecipe.macros.proteins}g</span>
                        </div>
                        <div className="text-center p-2 bg-green-50 rounded-lg">
                            <span className="block text-xs text-green-500">Gluc.</span>
                            <span className="font-bold text-green-700">{generatedRecipe.macros.carbs}g</span>
                        </div>
                        <div className="text-center p-2 bg-yellow-50 rounded-lg">
                            <span className="block text-xs text-yellow-500">Lip.</span>
                            <span className="font-bold text-yellow-700">{generatedRecipe.macros.lipides || generatedRecipe.macros.fats}g</span>
                        </div>
                    </div>

                    {/* Recipe Details */}
                    {generatedRecipe.ingredients && generatedRecipe.ingredients.length > 0 && (
                        <div className="mb-4 p-4 bg-gray-50 rounded-xl">
                            <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                                <span>🥘</span> Ingrédients
                            </h4>
                            <ul className="space-y-1">
                                {generatedRecipe.ingredients.map((ingredient: string, index: number) => (
                                    <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                                        <span className="text-emerald-500">•</span>
                                        <span>{ingredient}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {generatedRecipe.instructions && generatedRecipe.instructions.length > 0 && (
                        <div className="mb-4 p-4 bg-gray-50 rounded-xl">
                            <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                                <span>👨‍🍳</span> Instructions
                            </h4>
                            <ol className="space-y-2">
                                {generatedRecipe.instructions.map((instruction: string, index: number) => (
                                    <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                                        <span className="font-bold text-emerald-600 min-w-[20px]">{index + 1}.</span>
                                        <span>{instruction}</span>
                                    </li>
                                ))}
                            </ol>
                        </div>
                    )}

                    {/* Rating & Feedback */}
                    <div className="mb-4">
                        <div className="flex items-center justify-center gap-2 mb-3">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    onClick={() => handleRating(star)}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    className="transition-transform hover:scale-110"
                                >
                                    <Star
                                        size={24}
                                        className={`${star <= (hoverRating || rating)
                                            ? 'fill-yellow-400 text-yellow-400'
                                            : 'text-gray-300'
                                            }`}
                                    />
                                </button>
                            ))}
                        </div>
                        
                        {/* Detailed Feedback Button */}
                        {generatedRecipe.recipeId && (
                            <button
                                onClick={() => setShowFeedbackModal(true)}
                                className="w-full text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center justify-center gap-1"
                            >
                                <MessageCircle size={16} />
                                Donner un avis détaillé
                            </button>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="space-y-3">
                        <button
                            onClick={handleSelect}
                            className={`w-full text-white py-3 rounded-xl font-bold transition-colors ${mode === 'analyze' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-purple-600 hover:bg-purple-700'
                                }`}
                        >
                            Ajouter ce repas
                        </button>

                        {!generatedImage && (
                            <button
                                onClick={handleGenerateImage}
                                disabled={isGeneratingImage}
                                className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                title="Générer une photo du plat"
                            >
                                {isGeneratingImage ? (
                                    <>
                                        <Loader2 size={20} className="animate-spin" />
                                        Génération de l'image...
                                    </>
                                ) : (
                                    <>
                                        <ImageIcon size={20} />
                                        Générer une photo
                                    </>
                                )}
                            </button>
                        )}
                    </div>

                    {imageError && (
                        <p className="text-xs text-red-500 mt-2 text-center">
                            ⚠️ {imageError}
                        </p>
                    )}
                </div>
            )}
            
            {/* Feedback Modal */}
            {generatedRecipe?.recipeId && (
                <RecipeFeedbackModal
                    isOpen={showFeedbackModal}
                    onClose={() => setShowFeedbackModal(false)}
                    recipeId={generatedRecipe.recipeId}
                    recipeName={generatedRecipe.title}
                />
            )}
        </div>
    );
}
