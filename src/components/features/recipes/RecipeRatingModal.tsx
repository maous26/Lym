'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X, ChefHat, MessageSquare, Loader2, Sparkles } from 'lucide-react';
import { rateRecipe } from '@/app/actions/recipe';

interface RecipeRatingModalProps {
    isOpen: boolean;
    onClose: () => void;
    recipeId: string;
    recipeTitle: string;
    existingRating?: {
        rating: number;
        comment: string | null;
        cooked: boolean;
    };
    onSuccess?: (result: {
        xpEarned?: number;
        newBadges?: string[];
        leveledUp?: boolean;
        newLevel?: number;
    }) => void;
}

export function RecipeRatingModal({
    isOpen,
    onClose,
    recipeId,
    recipeTitle,
    existingRating,
    onSuccess,
}: RecipeRatingModalProps) {
    const [rating, setRating] = useState(existingRating?.rating || 0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [comment, setComment] = useState(existingRating?.comment || '');
    const [cooked, setCooked] = useState(existingRating?.cooked || false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [result, setResult] = useState<{
        xpEarned?: number;
        newBadges?: string[];
        leveledUp?: boolean;
        newLevel?: number;
    } | null>(null);

    const handleSubmit = async () => {
        if (rating === 0) return;

        setIsSubmitting(true);
        try {
            const res = await rateRecipe(recipeId, rating, comment || undefined, cooked);
            if (res.success) {
                setResult({
                    xpEarned: res.xpEarned,
                    newBadges: res.newBadges,
                    leveledUp: res.leveledUp,
                    newLevel: res.newLevel,
                });
                setShowSuccess(true);

                // Auto close after showing success
                setTimeout(() => {
                    onSuccess?.(res);
                    onClose();
                }, 2500);
            }
        } catch (error) {
            console.error('Error rating recipe:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const displayRating = hoveredRating || rating;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {showSuccess ? (
                            // Success animation
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="p-8 text-center"
                            >
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', damping: 10 }}
                                    className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center"
                                >
                                    <Sparkles className="w-10 h-10 text-white" />
                                </motion.div>

                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                    Merci pour ton avis !
                                </h3>

                                {result?.xpEarned && result.xpEarned > 0 && (
                                    <motion.div
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.2 }}
                                        className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full font-bold mb-3"
                                    >
                                        <Sparkles className="w-4 h-4" />
                                        +{result.xpEarned} XP
                                    </motion.div>
                                )}

                                {result?.leveledUp && (
                                    <motion.p
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.4 }}
                                        className="text-lg font-bold text-purple-600"
                                    >
                                        Niveau {result.newLevel} atteint !
                                    </motion.p>
                                )}

                                {result?.newBadges && result.newBadges.length > 0 && (
                                    <motion.div
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.6 }}
                                        className="mt-3 text-sm text-gray-600"
                                    >
                                        Nouveaux badges débloqués !
                                    </motion.div>
                                )}
                            </motion.div>
                        ) : (
                            <>
                                {/* Header */}
                                <div className="relative bg-gradient-to-br from-amber-400 to-orange-500 p-6 text-white">
                                    <button
                                        onClick={onClose}
                                        className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                    <h2 className="text-xl font-bold mb-1">Note cette recette</h2>
                                    <p className="text-white/80 text-sm line-clamp-1">{recipeTitle}</p>
                                </div>

                                {/* Rating Stars */}
                                <div className="p-6 border-b border-gray-100">
                                    <p className="text-center text-gray-600 mb-4">
                                        Comment as-tu trouvé cette recette ?
                                    </p>
                                    <div className="flex justify-center gap-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                onMouseEnter={() => setHoveredRating(star)}
                                                onMouseLeave={() => setHoveredRating(0)}
                                                onClick={() => setRating(star)}
                                                className="p-1 transition-transform hover:scale-110"
                                            >
                                                <Star
                                                    className={`w-10 h-10 transition-colors ${
                                                        star <= displayRating
                                                            ? 'fill-yellow-400 text-yellow-400'
                                                            : 'text-gray-300'
                                                    }`}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-center text-sm text-gray-500 mt-2 h-5">
                                        {displayRating === 1 && 'Pas bon'}
                                        {displayRating === 2 && 'Bof'}
                                        {displayRating === 3 && 'Correct'}
                                        {displayRating === 4 && 'Bon'}
                                        {displayRating === 5 && 'Excellent !'}
                                    </p>
                                </div>

                                {/* Cooked toggle */}
                                <div className="px-6 py-4 border-b border-gray-100">
                                    <button
                                        onClick={() => setCooked(!cooked)}
                                        className={`w-full flex items-center justify-between p-4 rounded-xl transition-colors ${
                                            cooked
                                                ? 'bg-green-50 border-2 border-green-500'
                                                : 'bg-gray-50 border-2 border-transparent'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                                    cooked ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
                                                }`}
                                            >
                                                <ChefHat className="w-5 h-5" />
                                            </div>
                                            <div className="text-left">
                                                <p className="font-medium text-gray-900">J'ai cuisiné cette recette</p>
                                                <p className="text-xs text-gray-500">+25 XP bonus</p>
                                            </div>
                                        </div>
                                        <div
                                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                                cooked ? 'border-green-500 bg-green-500' : 'border-gray-300'
                                            }`}
                                        >
                                            {cooked && (
                                                <motion.svg
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    className="w-4 h-4 text-white"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="3"
                                                >
                                                    <path d="M5 13l4 4L19 7" />
                                                </motion.svg>
                                            )}
                                        </div>
                                    </button>
                                </div>

                                {/* Comment */}
                                <div className="p-6">
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                        <MessageSquare className="w-4 h-4" />
                                        Ajouter un commentaire (optionnel)
                                        <span className="text-xs text-purple-500 font-normal">+10 XP</span>
                                    </label>
                                    <textarea
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        placeholder="Partage ton expérience avec cette recette..."
                                        className="w-full p-3 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        rows={3}
                                    />
                                </div>

                                {/* Submit button */}
                                <div className="p-6 pt-0">
                                    <button
                                        onClick={handleSubmit}
                                        disabled={rating === 0 || isSubmitting}
                                        className={`w-full py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                                            rating > 0
                                                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:shadow-lg'
                                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                        }`}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Envoi en cours...
                                            </>
                                        ) : (
                                            <>
                                                <Star className="w-5 h-5" />
                                                {existingRating ? 'Modifier ma note' : 'Envoyer ma note'}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
