'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  Sparkles,
  ChefHat,
  Loader2,
  Clock,
  Flame,
  Plus,
  Check,
  RefreshCw,
  Image as ImageIcon,
  AlertCircle,
} from 'lucide-react';
import { suggestRecipe, generateRecipe, generateFoodImage } from '@/app/actions/ai';
import { useUserStore, useSoloProfile } from '@/store/user-store';
import type { NutritionInfo } from '@/types/meal';

interface AIMealGeneratorProps {
  mealType: 'breakfast' | 'lunch' | 'snack' | 'dinner';
  consumed?: NutritionInfo;
  targets?: NutritionInfo;
  onRecipeGenerated?: (recipe: GeneratedRecipe) => void;
  onAddToMeal?: (recipe: GeneratedRecipe) => void;
  className?: string;
}

interface GeneratedRecipe {
  title: string;
  description: string;
  ingredients: { name: string; quantity: string; unit: string }[];
  instructions: string[];
  nutrition: NutritionInfo;
  prepTime: number;
  cookTime?: number;
  servings?: number;
  difficulty?: string;
  tags?: string[];
  imageUrl?: string;
}

const mealTypeLabels = {
  breakfast: 'Petit-déjeuner',
  lunch: 'Déjeuner',
  snack: 'Collation',
  dinner: 'Dîner',
};

const quickPrompts = [
  { label: 'Rapide', emoji: '⚡', prompt: 'Quelque chose de rapide à préparer' },
  { label: 'Healthy', emoji: '🥗', prompt: 'Quelque chose de sain et équilibré' },
  { label: 'Protéiné', emoji: '💪', prompt: 'Riche en protéines' },
  { label: 'Végétarien', emoji: '🌱', prompt: 'Un plat végétarien' },
  { label: 'Réconfort', emoji: '🍲', prompt: 'Un plat réconfortant' },
  { label: 'Léger', emoji: '🦋', prompt: 'Quelque chose de léger' },
];

export function AIMealGenerator({
  mealType,
  consumed,
  targets,
  onRecipeGenerated,
  onAddToMeal,
  className,
}: AIMealGeneratorProps) {
  const [customPrompt, setCustomPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generatedRecipe, setGeneratedRecipe] = useState<GeneratedRecipe | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const profile = useSoloProfile();

  const handleGenerate = async (prompt?: string) => {
    setIsGenerating(true);
    setError(null);
    setGeneratedRecipe(null);

    try {
      let result;

      if (prompt) {
        // Generate based on specific prompt
        result = await generateRecipe(`${prompt} pour un ${mealTypeLabels[mealType]}`, profile || undefined);
      } else if (consumed && targets) {
        // Suggest based on nutritional context
        result = await suggestRecipe({
          consumed,
          targets,
          mealType,
          userProfile: profile || undefined,
        });
      } else {
        // Default generation
        result = await generateRecipe(`Un ${mealTypeLabels[mealType]} équilibré`, profile || undefined);
      }

      if (result.success && result.recipe) {
        const recipe: GeneratedRecipe = {
          title: result.recipe.title,
          description: result.recipe.description || '',
          ingredients: result.recipe.ingredients || [],
          instructions: result.recipe.instructions || [],
          nutrition: result.recipe.nutrition || result.recipe.macros || {
            calories: 0,
            proteins: 0,
            carbs: 0,
            fats: 0,
            fiber: 0,
            sugar: 0,
            sodium: 0,
          },
          prepTime: result.recipe.prepTime || result.recipe.temps_preparation || 15,
          cookTime: result.recipe.cookTime,
          servings: result.recipe.servings || 1,
          difficulty: result.recipe.difficulty || 'facile',
          tags: result.recipe.tags || [],
        };

        setGeneratedRecipe(recipe);
        onRecipeGenerated?.(recipe);
      } else {
        setError(result.error || 'Erreur lors de la génération');
      }
    } catch (err) {
      console.error('Generation error:', err);
      setError('Une erreur est survenue. Réessayez.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!generatedRecipe) return;

    setIsGeneratingImage(true);
    try {
      const result = await generateFoodImage(generatedRecipe.title);
      if (result.success && result.image) {
        setGeneratedRecipe((prev) =>
          prev ? { ...prev, imageUrl: result.image } : null
        );
      }
    } catch (err) {
      console.error('Image generation error:', err);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleAdd = () => {
    if (generatedRecipe) {
      onAddToMeal?.(generatedRecipe);
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center gap-2 text-purple-600">
        <Sparkles className="w-5 h-5" />
        <h3 className="font-semibold">Génération IA</h3>
      </div>

      {/* Quick prompts */}
      {!generatedRecipe && (
        <div className="space-y-3">
          <p className="text-sm text-stone-500">
            Suggestions rapides pour votre {mealTypeLabels[mealType].toLowerCase()} :
          </p>
          <div className="flex flex-wrap gap-2">
            {quickPrompts.map((qp) => (
              <motion.button
                key={qp.label}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleGenerate(qp.prompt)}
                disabled={isGenerating}
                className={cn(
                  'px-3 py-1.5 rounded-full text-sm font-medium transition-all',
                  'bg-purple-50 text-purple-700 hover:bg-purple-100',
                  'border border-purple-200',
                  isGenerating && 'opacity-50 cursor-not-allowed'
                )}
              >
                {qp.emoji} {qp.label}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Custom prompt input */}
      {!generatedRecipe && (
        <div className="space-y-2">
          <p className="text-sm text-stone-500">Ou décrivez ce que vous voulez :</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Ex: Un plat italien rapide..."
              className="flex-1 px-4 py-2 rounded-xl border border-stone-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none text-sm"
              disabled={isGenerating}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && customPrompt.trim()) {
                  handleGenerate(customPrompt);
                }
              }}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleGenerate(customPrompt || undefined)}
              disabled={isGenerating}
              className={cn(
                'px-4 py-2 rounded-xl font-medium text-sm transition-all',
                'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
                'shadow-md hover:shadow-lg',
                isGenerating && 'opacity-70 cursor-not-allowed'
              )}
            >
              {isGenerating ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Sparkles className="w-5 h-5" />
              )}
            </motion.button>
          </div>
        </div>
      )}

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 p-3 rounded-xl bg-red-50 text-red-700 text-sm"
          >
            <AlertCircle className="w-4 h-4" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading state */}
      <AnimatePresence>
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center justify-center py-12 space-y-4"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center"
            >
              <ChefHat className="w-8 h-8 text-white" />
            </motion.div>
            <p className="text-stone-600 font-medium">Le chef prépare votre recette...</p>
            <p className="text-xs text-stone-400">Cela peut prendre quelques secondes</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Generated recipe */}
      <AnimatePresence>
        {generatedRecipe && !isGenerating && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm"
          >
            {/* Recipe image */}
            <div className="relative h-48 bg-gradient-to-br from-purple-100 to-pink-100">
              {generatedRecipe.imageUrl ? (
                <img
                  src={generatedRecipe.imageUrl}
                  alt={generatedRecipe.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleGenerateImage}
                    disabled={isGeneratingImage}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/80 backdrop-blur-sm text-purple-600 font-medium text-sm shadow-md"
                  >
                    {isGeneratingImage ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Génération...
                      </>
                    ) : (
                      <>
                        <ImageIcon className="w-4 h-4" />
                        Générer une image
                      </>
                    )}
                  </motion.button>
                </div>
              )}

              {/* Badges */}
              <div className="absolute top-3 left-3 flex gap-2">
                <span className="px-2 py-1 rounded-lg bg-white/90 backdrop-blur-sm text-xs font-medium text-purple-700 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {generatedRecipe.prepTime} min
                </span>
                <span className="px-2 py-1 rounded-lg bg-white/90 backdrop-blur-sm text-xs font-medium text-amber-700 flex items-center gap-1">
                  <Flame className="w-3 h-3" />
                  {generatedRecipe.nutrition.calories} kcal
                </span>
              </div>
            </div>

            {/* Recipe content */}
            <div className="p-4 space-y-4">
              <div>
                <h4 className="font-bold text-lg text-stone-800">{generatedRecipe.title}</h4>
                <p className="text-sm text-stone-500 mt-1">{generatedRecipe.description}</p>
              </div>

              {/* Nutrition summary */}
              <div className="grid grid-cols-4 gap-2">
                <div className="text-center p-2 rounded-lg bg-purple-50">
                  <p className="text-xs text-purple-600 font-medium">Calories</p>
                  <p className="text-sm font-bold text-purple-700">{generatedRecipe.nutrition.calories}</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-blue-50">
                  <p className="text-xs text-blue-600 font-medium">Protéines</p>
                  <p className="text-sm font-bold text-blue-700">{generatedRecipe.nutrition.proteins}g</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-amber-50">
                  <p className="text-xs text-amber-600 font-medium">Glucides</p>
                  <p className="text-sm font-bold text-amber-700">{generatedRecipe.nutrition.carbs}g</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-green-50">
                  <p className="text-xs text-green-600 font-medium">Lipides</p>
                  <p className="text-sm font-bold text-green-700">{generatedRecipe.nutrition.fats}g</p>
                </div>
              </div>

              {/* Toggle details */}
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="w-full text-sm text-purple-600 font-medium hover:underline"
              >
                {showDetails ? 'Masquer les détails' : 'Voir les détails'}
              </button>

              {/* Details */}
              <AnimatePresence>
                {showDetails && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4 overflow-hidden"
                  >
                    {/* Ingredients */}
                    {generatedRecipe.ingredients.length > 0 && (
                      <div>
                        <h5 className="font-semibold text-stone-700 mb-2">Ingrédients</h5>
                        <ul className="space-y-1">
                          {generatedRecipe.ingredients.map((ing, idx) => (
                            <li key={idx} className="text-sm text-stone-600 flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                              {typeof ing === 'string' ? ing : `${ing.quantity} ${ing.unit} ${ing.name}`}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Instructions */}
                    {generatedRecipe.instructions.length > 0 && (
                      <div>
                        <h5 className="font-semibold text-stone-700 mb-2">Instructions</h5>
                        <ol className="space-y-2">
                          {generatedRecipe.instructions.map((step, idx) => (
                            <li key={idx} className="text-sm text-stone-600 flex gap-3">
                              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 text-purple-700 font-semibold text-xs flex items-center justify-center">
                                {idx + 1}
                              </span>
                              {step}
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action buttons */}
              <div className="flex gap-3 pt-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setGeneratedRecipe(null);
                    setShowDetails(false);
                  }}
                  className="flex-1 py-2.5 rounded-xl border border-stone-200 text-stone-600 font-medium text-sm flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Régénérer
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAdd}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  Ajouter au repas
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AIMealGenerator;
