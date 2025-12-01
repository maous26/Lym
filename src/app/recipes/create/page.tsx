'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { saveRecipe } from '@/app/actions/recipes';
import { generateFoodImage } from '@/app/actions/ai';
import { Camera, Loader2, Sparkles, Save, Plus, Trash2 } from 'lucide-react';
import Image from 'next/image';

export default function CreateRecipePage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);

    const [recipe, setRecipe] = useState({
        title: '',
        description: '',
        prepTime: 30,
        calories: 500,
        proteins: 30,
        carbs: 50,
        fats: 20,
        ingredients: [''],
        instructions: [''],
        imageUrl: '',
    });

    const handleIngredientChange = (index: number, value: string) => {
        const newIngredients = [...recipe.ingredients];
        newIngredients[index] = value;
        setRecipe({ ...recipe, ingredients: newIngredients });
    };

    const addIngredient = () => {
        setRecipe({ ...recipe, ingredients: [...recipe.ingredients, ''] });
    };

    const removeIngredient = (index: number) => {
        const newIngredients = recipe.ingredients.filter((_, i) => i !== index);
        setRecipe({ ...recipe, ingredients: newIngredients });
    };

    const handleInstructionChange = (index: number, value: string) => {
        const newInstructions = [...recipe.instructions];
        newInstructions[index] = value;
        setRecipe({ ...recipe, instructions: newInstructions });
    };

    const addInstruction = () => {
        setRecipe({ ...recipe, instructions: [...recipe.instructions, ''] });
    };

    const removeInstruction = (index: number) => {
        const newInstructions = recipe.instructions.filter((_, i) => i !== index);
        setRecipe({ ...recipe, instructions: newInstructions });
    };

    const handleGenerateImage = async () => {
        if (!recipe.title) return;
        setIsGeneratingImage(true);
        try {
            const result = await generateFoodImage(recipe.title + (recipe.description ? `, ${recipe.description}` : ''));
            if (result.success && result.image) {
                setRecipe({ ...recipe, imageUrl: result.image });
            }
        } catch (error) {
            console.error('Error generating image:', error);
        } finally {
            setIsGeneratingImage(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Filter out empty ingredients/instructions
            const cleanRecipe = {
                ...recipe,
                ingredients: recipe.ingredients.filter(i => i.trim()),
                instructions: recipe.instructions.filter(i => i.trim()),
                source: 'USER'
            };

            const result = await saveRecipe(cleanRecipe);

            if (result.success) {
                router.push('/meals/plan'); // Redirect to meal planner or recipe list
            } else {
                alert('Erreur lors de la sauvegarde de la recette');
            }
        } catch (error) {
            console.error('Error saving recipe:', error);
            alert('Une erreur est survenue');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <div className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-2xl mx-auto px-4 py-4 flex justify-between items-center">
                    <h1 className="text-xl font-bold text-gray-900">Créer une Recette</h1>
                    <button
                        onClick={() => router.back()}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        Annuler
                    </button>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 py-6">
                {/* Quick Share Banner */}
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-4 mb-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-bold mb-1">Partage rapide depuis Instagram/TikTok</h3>
                            <p className="text-sm text-white/90">L'IA extrait et génère tout automatiquement !</p>
                        </div>
                        <button
                            onClick={() => router.push('/recipes/share')}
                            className="bg-white text-purple-600 px-4 py-2 rounded-xl font-semibold hover:shadow-lg transition-all shrink-0"
                        >
                            Essayer →
                        </button>
                    </div>
                </div>
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Basic Info */}
                    <div className="bg-white p-6 rounded-xl shadow-sm space-y-4">
                        <h2 className="text-lg font-semibold text-gray-800">Informations Générales</h2>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Titre de la recette</label>
                            <input
                                type="text"
                                value={recipe.title}
                                onChange={(e) => setRecipe({ ...recipe, title: e.target.value })}
                                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                placeholder="Ex: Poulet Basquaise"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                                value={recipe.description}
                                onChange={(e) => setRecipe({ ...recipe, description: e.target.value })}
                                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                placeholder="Une brève description de votre plat..."
                                rows={3}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Temps (min)</label>
                                <input
                                    type="number"
                                    value={recipe.prepTime}
                                    onChange={(e) => setRecipe({ ...recipe, prepTime: parseInt(e.target.value) })}
                                    className="w-full p-3 border border-gray-200 rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Calories (kcal)</label>
                                <input
                                    type="number"
                                    value={recipe.calories}
                                    onChange={(e) => setRecipe({ ...recipe, calories: parseInt(e.target.value) })}
                                    className="w-full p-3 border border-gray-200 rounded-lg"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Image Section */}
                    <div className="bg-white p-6 rounded-xl shadow-sm space-y-4">
                        <h2 className="text-lg font-semibold text-gray-800">Photo du Plat</h2>

                        <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-8 bg-gray-50">
                            {recipe.imageUrl ? (
                                <div className="relative w-full h-64 rounded-lg overflow-hidden mb-4">
                                    <Image
                                        src={recipe.imageUrl}
                                        alt="Recipe preview"
                                        fill
                                        className="object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setRecipe({ ...recipe, imageUrl: '' })}
                                        className="absolute top-2 right-2 p-2 bg-white/80 rounded-full text-red-500 hover:bg-white"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            ) : (
                                <div className="text-center space-y-4">
                                    <div className="flex justify-center space-x-4">
                                        <button
                                            type="button"
                                            onClick={handleGenerateImage}
                                            disabled={!recipe.title || isGeneratingImage}
                                            className="flex items-center space-x-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 disabled:opacity-50"
                                        >
                                            {isGeneratingImage ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
                                            <span>Générer avec l'IA</span>
                                        </button>
                                        <button
                                            type="button"
                                            className="flex items-center space-x-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                                            onClick={() => alert("Fonctionnalité d'upload à venir !")}
                                        >
                                            <Camera size={20} />
                                            <span>Prendre une photo</span>
                                        </button>
                                    </div>
                                    <p className="text-sm text-gray-500">Entrez un titre pour générer une image IA</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Macros */}
                    <div className="bg-white p-6 rounded-xl shadow-sm space-y-4">
                        <h2 className="text-lg font-semibold text-gray-800">Macronutriments</h2>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Protéines (g)</label>
                                <input
                                    type="number"
                                    value={recipe.proteins}
                                    onChange={(e) => setRecipe({ ...recipe, proteins: parseInt(e.target.value) })}
                                    className="w-full p-3 border border-gray-200 rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Glucides (g)</label>
                                <input
                                    type="number"
                                    value={recipe.carbs}
                                    onChange={(e) => setRecipe({ ...recipe, carbs: parseInt(e.target.value) })}
                                    className="w-full p-3 border border-gray-200 rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Lipides (g)</label>
                                <input
                                    type="number"
                                    value={recipe.fats}
                                    onChange={(e) => setRecipe({ ...recipe, fats: parseInt(e.target.value) })}
                                    className="w-full p-3 border border-gray-200 rounded-lg"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Ingredients */}
                    <div className="bg-white p-6 rounded-xl shadow-sm space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-semibold text-gray-800">Ingrédients</h2>
                            <button
                                type="button"
                                onClick={addIngredient}
                                className="text-emerald-600 hover:text-emerald-700 flex items-center text-sm font-medium"
                            >
                                <Plus size={16} className="mr-1" /> Ajouter
                            </button>
                        </div>
                        <div className="space-y-2">
                            {recipe.ingredients.map((ingredient, index) => (
                                <div key={index} className="flex gap-2">
                                    <input
                                        type="text"
                                        value={ingredient}
                                        onChange={(e) => handleIngredientChange(index, e.target.value)}
                                        className="flex-1 p-3 border border-gray-200 rounded-lg"
                                        placeholder={`Ingrédient ${index + 1}`}
                                    />
                                    {recipe.ingredients.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeIngredient(index)}
                                            className="p-3 text-red-500 hover:bg-red-50 rounded-lg"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Instructions */}
                    <div className="bg-white p-6 rounded-xl shadow-sm space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-semibold text-gray-800">Instructions</h2>
                            <button
                                type="button"
                                onClick={addInstruction}
                                className="text-emerald-600 hover:text-emerald-700 flex items-center text-sm font-medium"
                            >
                                <Plus size={16} className="mr-1" /> Ajouter
                            </button>
                        </div>
                        <div className="space-y-2">
                            {recipe.instructions.map((instruction, index) => (
                                <div key={index} className="flex gap-2">
                                    <span className="py-3 text-gray-400 font-medium w-6">{index + 1}.</span>
                                    <textarea
                                        value={instruction}
                                        onChange={(e) => handleInstructionChange(index, e.target.value)}
                                        className="flex-1 p-3 border border-gray-200 rounded-lg"
                                        placeholder={`Étape ${index + 1}`}
                                        rows={2}
                                    />
                                    {recipe.instructions.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeInstruction(index)}
                                            className="p-3 text-red-500 hover:bg-red-50 rounded-lg self-start"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-4 bg-emerald-600 text-white rounded-xl font-semibold text-lg hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center space-x-2 shadow-lg shadow-emerald-200"
                    >
                        {isLoading ? (
                            <Loader2 className="animate-spin" />
                        ) : (
                            <>
                                <Save size={20} />
                                <span>Enregistrer la Recette</span>
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
