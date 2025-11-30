'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChefHat, ChevronRight, Clock, Flame, Heart, Star, MessageSquare, ImageIcon, Loader2, Check, X, CalendarDays, MoreVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { rateRecipe } from '@/app/actions/ratings';
import { generateFoodImage } from '@/app/actions/ai';
import { updateRecipeImage, getRecipeDetails } from '@/app/actions/recipes';
import { validateMeal, skipMeal, moveMeal } from '@/app/actions/meal-actions';

export interface MealData {
    type: string;
    name: string;
    description: string;
    ingredients?: string[];
    instructions?: string[];
    calories: number;
    proteins: number;
    carbs: number;
    fats: number;
    prepTime: number;
    imageUrl?: string | null;
    isCheatMeal?: boolean;
    recipeId?: string;
    isFasting?: boolean;
}

interface MealProps {
    meal: MealData;
    showImages?: boolean;
    showActions?: boolean;
    mealDate?: Date;
    dayIndex?: number;
    mealPlanId?: string;
    onMealStatusChange?: (status: 'validated' | 'skipped' | 'moved', mealId: string) => void;
}

export function MealCard({ 
    meal, 
    showImages = false,
    showActions = false,
    mealDate,
    dayIndex,
    mealPlanId,
    onMealStatusChange,
}: MealProps) {
    // Safety check
    if (!meal) {
        return null;
    }

    const [isExpanded, setIsExpanded] = useState(false);
    const [showRating, setShowRating] = useState(false);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [localImageUrl, setLocalImageUrl] = useState(meal?.imageUrl);
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);
    
    // États pour les actions
    const [showActionsMenu, setShowActionsMenu] = useState(false);
    const [mealStatus, setMealStatus] = useState<'pending' | 'validated' | 'skipped' | 'moved'>('pending');
    const [isProcessingAction, setIsProcessingAction] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    
    // État pour les détails chargés à la demande
    const [recipeDetails, setRecipeDetails] = useState<{ ingredients: string[]; instructions: string[] } | null>(
        meal && meal.ingredients && Array.isArray(meal.ingredients) && meal.instructions && Array.isArray(meal.instructions)
            ? { ingredients: meal.ingredients, instructions: meal.instructions }
            : null
    );
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);

    const getMealLabel = (type: string) => {
        switch (type) {
            case 'breakfast': return 'Petit-déjeuner';
            case 'lunch': return 'Déjeuner';
            case 'snack': return 'Collation';
            case 'dinner': return 'Dîner';
            default: return type;
        }
    };

    const handleRatingSubmit = async () => {
        if (!meal.recipeId || rating === 0) return;

        setIsSubmitting(true);
        try {
            await rateRecipe(meal.recipeId, rating, comment || undefined);
            setShowRating(false);
            setRating(0);
            setComment('');
        } catch (error) {
            console.error('Error submitting rating:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGenerateImage = async () => {
        if (!meal.recipeId || isGeneratingImage) return;

        setIsGeneratingImage(true);
        try {
            const imageResult = await generateFoodImage(
                meal.name + (meal.isCheatMeal ? ", food porn, delicious, gourmet, indulgent" : "")
            );

            if (imageResult.success && imageResult.image) {
                setLocalImageUrl(imageResult.image);
                await updateRecipeImage(meal.recipeId, imageResult.image);
            }
        } catch (error) {
            console.error('Error generating image:', error);
        } finally {
            setIsGeneratingImage(false);
        }
    };

    // Handlers pour les actions de repas
    const handleValidateMeal = async () => {
        if (isProcessingAction) return;
        setIsProcessingAction(true);
        
        try {
            const mealData = {
                mealName: meal.name,
                mealType: meal.type,
                description: meal.description,
                calories: meal.calories,
                proteins: meal.proteins,
                carbs: meal.carbs,
                fats: meal.fats,
                prepTime: meal.prepTime,
                recipeId: meal.recipeId,
            };
            
            const result = await validateMeal(
                mealData,
                mealDate || new Date(),
                mealPlanId,
                dayIndex
            );
            
            if (result.success) {
                setMealStatus('validated');
                setShowActionsMenu(false);
                onMealStatusChange?.('validated', result.mealId!);
            }
        } catch (error) {
            console.error('Error validating meal:', error);
        } finally {
            setIsProcessingAction(false);
        }
    };

    const handleSkipMeal = async () => {
        if (isProcessingAction) return;
        setIsProcessingAction(true);
        
        try {
            const mealData = {
                mealName: meal.name,
                mealType: meal.type,
                description: meal.description,
                calories: meal.calories,
                proteins: meal.proteins,
                carbs: meal.carbs,
                fats: meal.fats,
                prepTime: meal.prepTime,
                recipeId: meal.recipeId,
            };
            
            const result = await skipMeal(
                mealData,
                mealDate || new Date(),
                mealPlanId,
                dayIndex
            );
            
            if (result.success) {
                setMealStatus('skipped');
                setShowActionsMenu(false);
                onMealStatusChange?.('skipped', result.mealId!);
            }
        } catch (error) {
            console.error('Error skipping meal:', error);
        } finally {
            setIsProcessingAction(false);
        }
    };

    const handleMoveMeal = async (newDate: Date) => {
        if (isProcessingAction) return;
        setIsProcessingAction(true);
        
        try {
            const mealData = {
                mealName: meal.name,
                mealType: meal.type,
                description: meal.description,
                calories: meal.calories,
                proteins: meal.proteins,
                carbs: meal.carbs,
                fats: meal.fats,
                prepTime: meal.prepTime,
                recipeId: meal.recipeId,
            };
            
            const result = await moveMeal(
                mealData,
                mealDate || new Date(),
                newDate,
                mealPlanId,
                dayIndex
            );
            
            if (result.success) {
                setMealStatus('moved');
                setShowActionsMenu(false);
                setShowDatePicker(false);
                onMealStatusChange?.('moved', result.mealId!);
            }
        } catch (error) {
            console.error('Error moving meal:', error);
        } finally {
            setIsProcessingAction(false);
        }
    };

    // Statut du repas pour le style
    const getStatusStyle = () => {
        switch (mealStatus) {
            case 'validated':
                return 'ring-2 ring-green-500 bg-green-50';
            case 'skipped':
                return 'opacity-50 bg-gray-100';
            case 'moved':
                return 'ring-2 ring-blue-500 bg-blue-50';
            default:
                return '';
        }
    };

    // Cheat Meal Styling
    const cardStyle = meal.isCheatMeal
        ? 'bg-gradient-to-br from-orange-50 to-red-50 border-orange-200 relative overflow-hidden'
        : 'bg-white border-gray-100';

    const typeColor = meal.isCheatMeal ? 'text-orange-600' : 'text-emerald-600';

    return (
        <div className={`rounded-2xl p-4 shadow-sm border transition-all hover:shadow-md ${cardStyle} ${getStatusStyle()}`}>
            {/* Status Badge */}
            {mealStatus !== 'pending' && (
                <div className={`absolute top-0 left-0 text-white text-[10px] font-bold px-2 py-1 rounded-br-xl z-10 ${
                    mealStatus === 'validated' ? 'bg-green-500' :
                    mealStatus === 'skipped' ? 'bg-gray-500' :
                    'bg-blue-500'
                }`}>
                    {mealStatus === 'validated' ? '✓ VALIDÉ' :
                     mealStatus === 'skipped' ? '✗ SAUTÉ' :
                     '📅 DÉPLACÉ'}
                </div>
            )}
            
            {meal.isCheatMeal && (
                <div className="absolute top-0 right-0 bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-xl z-10">
                    CHEAT MEAL
                </div>
            )}

            <div className="flex gap-4">
                {/* Image - Conditionally rendered */}
                {showImages && (
                    <div className="w-24 h-24 rounded-xl bg-gray-100 relative overflow-hidden shrink-0">
                        {localImageUrl ? (
                            <Image
                                src={localImageUrl}
                                alt={meal.name}
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <button
                                onClick={handleGenerateImage}
                                disabled={isGeneratingImage}
                                className="w-full h-full flex flex-col items-center justify-center text-gray-400 hover:text-emerald-600 hover:bg-gray-50 transition-colors"
                            >
                                {isGeneratingImage ? (
                                    <Loader2 size={20} className="animate-spin" />
                                ) : (
                                    <>
                                        <ImageIcon size={20} />
                                        <span className="text-[10px] mt-1">Générer</span>
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                        <div>
                            <span className={`text-xs font-bold uppercase tracking-wider ${typeColor}`}>
                                {getMealLabel(meal.type)}
                            </span>
                            <h3 className="font-bold text-gray-900 truncate">{meal.name}</h3>
                        </div>
                        {!meal.isCheatMeal && (
                            <div className="flex items-center gap-1 text-xs font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded-lg">
                                <Flame size={12} className="text-orange-500" />
                                {meal.calories}
                            </div>
                        )}
                    </div>

                    <p className="text-sm text-gray-500 line-clamp-2 mt-1 mb-2">{meal.description}</p>

                    {meal.isCheatMeal ? (
                        <div className="flex items-center gap-2 text-xs font-bold text-orange-600 bg-white/50 px-2 py-1 rounded-lg w-fit">
                            <Heart size={12} className="fill-orange-600" />
                            Plaisir sans culpabilité !
                        </div>
                    ) : (
                        <div className="flex items-center gap-4 text-xs text-gray-400">
                            <div className="flex items-center gap-1">
                                <Clock size={12} />
                                {meal.prepTime || 20} min
                            </div>
                            <div className="flex gap-2">
                                <span className="text-blue-400 font-medium">{meal.proteins}g P</span>
                                <span className="text-green-400 font-medium">{meal.carbs}g G</span>
                                <span className="text-yellow-400 font-medium">{meal.fats}g L</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 mt-3 flex-wrap">
                {/* Meal Actions (Validate/Skip/Move) */}
                {showActions && mealStatus === 'pending' && !meal.isFasting && (
                    <>
                        <button
                            onClick={handleValidateMeal}
                            disabled={isProcessingAction}
                            className="flex items-center gap-1 text-xs font-medium text-white bg-green-500 hover:bg-green-600 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                        >
                            {isProcessingAction ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                            Valider
                        </button>
                        <button
                            onClick={handleSkipMeal}
                            disabled={isProcessingAction}
                            className="flex items-center gap-1 text-xs font-medium text-white bg-gray-400 hover:bg-gray-500 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                        >
                            <X size={14} />
                            Sauter
                        </button>
                        <button
                            onClick={() => setShowDatePicker(!showDatePicker)}
                            disabled={isProcessingAction}
                            className="flex items-center gap-1 text-xs font-medium text-white bg-blue-500 hover:bg-blue-600 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                        >
                            <CalendarDays size={14} />
                            Déplacer
                        </button>
                    </>
                )}
                
                {/* Rating Button */}
                <button
                    onClick={() => setShowRating(!showRating)}
                    className="flex items-center gap-1 text-xs font-medium text-gray-600 hover:text-emerald-600 bg-gray-50 hover:bg-emerald-50 px-3 py-1.5 rounded-lg transition-colors"
                >
                    <Star size={14} />
                    Noter
                </button>
            </div>

            {/* Date Picker for Moving Meal */}
            <AnimatePresence>
                {showDatePicker && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="mt-3 p-3 bg-blue-50 rounded-xl">
                            <label className="text-xs font-medium text-blue-700 mb-2 block">
                                Déplacer ce repas vers :
                            </label>
                            <div className="flex gap-2 flex-wrap">
                                {[...Array(7)].map((_, i) => {
                                    const date = new Date();
                                    date.setDate(date.getDate() + i);
                                    const dayName = date.toLocaleDateString('fr-FR', { weekday: 'short' });
                                    const dayNum = date.getDate();
                                    
                                    return (
                                        <button
                                            key={i}
                                            onClick={() => handleMoveMeal(date)}
                                            disabled={isProcessingAction}
                                            className="flex flex-col items-center px-3 py-2 bg-white hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors disabled:opacity-50"
                                        >
                                            <span className="text-xs text-blue-600 capitalize">{dayName}</span>
                                            <span className="text-sm font-bold text-blue-800">{dayNum}</span>
                                        </button>
                                    );
                                })}
                            </div>
                            <button
                                onClick={() => setShowDatePicker(false)}
                                className="mt-2 text-xs text-blue-600 hover:underline"
                            >
                                Annuler
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Rating Section */}
            <AnimatePresence>
                {showRating && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="mt-3 p-3 bg-gray-50 rounded-xl space-y-3">
                            <div>
                                <label className="text-xs font-medium text-gray-700 mb-2 block">Note</label>
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            onClick={() => setRating(star)}
                                            className="transition-transform hover:scale-110"
                                        >
                                            <Star
                                                size={24}
                                                className={star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-700 mb-1 block">
                                    Commentaire (optionnel)
                                </label>
                                <textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="Qu'avez-vous pensé de ce repas ?"
                                    className="w-full p-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                                    rows={2}
                                />
                            </div>
                            <button
                                onClick={handleRatingSubmit}
                                disabled={rating === 0 || isSubmitting}
                                className="w-full py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {isSubmitting ? 'Envoi...' : 'Envoyer'}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Expandable Recipe Details */}
            {!meal.isFasting && (
                <div className="mt-3 pt-3 border-t border-gray-50">
                    <button
                        onClick={async () => {
                            if (!isExpanded && !recipeDetails && meal.recipeId) {
                                // Charger les détails à la demande
                                setIsLoadingDetails(true);
                                try {
                                    const result = await getRecipeDetails(meal.recipeId);
                                    if (result.success && 'ingredients' in result && 'instructions' in result) {
                                        setRecipeDetails({
                                            ingredients: result.ingredients as string[],
                                            instructions: result.instructions as string[],
                                        });
                                    }
                                } catch (error) {
                                    console.error('Error loading recipe details:', error);
                                } finally {
                                    setIsLoadingDetails(false);
                                }
                            }
                            setIsExpanded(!isExpanded);
                        }}
                        disabled={isLoadingDetails}
                        className="text-sm font-medium text-emerald-600 cursor-pointer hover:text-emerald-700 flex items-center gap-1 w-full disabled:opacity-50"
                    >
                        {isLoadingDetails ? (
                            <>
                                <Loader2 size={14} className="animate-spin" />
                                Chargement...
                            </>
                        ) : (
                            <>
                                {isExpanded ? 'Masquer la recette' : 'Voir la recette'}
                                <ChevronRight size={16} className={`transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                            </>
                        )}
                    </button>

                    <AnimatePresence>
                        {isExpanded && recipeDetails && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="mt-3 grid md:grid-cols-2 gap-4 text-sm pb-2">
                                    <div>
                                        <h4 className="font-bold text-gray-900 mb-2">Ingrédients</h4>
                                        <ul className="space-y-1 text-gray-600">
                                            {recipeDetails.ingredients.map((ing, i) => (
                                                <li key={i} className="flex items-start gap-2">
                                                    <span className="text-emerald-500">•</span> {ing}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 mb-2">Instructions</h4>
                                        <ol className="space-y-2 text-gray-600">
                                            {recipeDetails.instructions.map((inst, i) => (
                                                <li key={i} className="flex gap-2">
                                                    <span className="font-bold text-emerald-600 shrink-0">{i + 1}.</span>
                                                    {inst}
                                                </li>
                                            ))}
                                        </ol>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}
