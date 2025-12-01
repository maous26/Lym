'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Send, Check } from 'lucide-react';
import { rateRecipe } from '@/app/actions/recipes';
import { updateUserRankingStats } from '@/app/actions/ranking';
import { cn } from '@/lib/utils';

interface RecipeRatingModalProps {
    isOpen: boolean;
    onClose: () => void;
    recipeId: string;
    recipeTitle: string;
    creatorId?: string;
    onRated?: () => void;
}

export function RecipeRatingModal({
    isOpen,
    onClose,
    recipeId,
    recipeTitle,
    creatorId,
    onRated,
}: RecipeRatingModalProps) {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async () => {
        if (rating === 0) return;

        setIsSubmitting(true);

        try {
            const result = await rateRecipe(recipeId, rating, comment || undefined);

            if (result.success) {
                // Update creator's ranking if available
                if (creatorId) {
                    await updateUserRankingStats(creatorId);
                }

                setSubmitted(true);
                
                setTimeout(() => {
                    onClose();
                    onRated?.();
                    // Reset state
                    setRating(0);
                    setComment('');
                    setSubmitted(false);
                }, 1500);
            }
        } catch (error) {
            console.error('Error rating recipe:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden"
                    >
                        {submitted ? (
                            <div className="p-8 text-center">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
                                >
                                    <Check className="w-10 h-10 text-green-600" />
                                </motion.div>
                                <h3 className="text-xl font-bold text-gray-900">Merci pour votre avis !</h3>
                                <p className="text-gray-500 mt-2">Votre note a été enregistrée.</p>
                            </div>
                        ) : (
                            <>
                                {/* Header */}
                                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white">
                                    <div className="flex justify-between items-start mb-4">
                                        <h2 className="text-xl font-bold">Noter la recette</h2>
                                        <button
                                            onClick={onClose}
                                            className="p-2 hover:bg-white/20 rounded-full transition-colors"
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>
                                    <p className="text-white/90 text-sm">{recipeTitle}</p>
                                </div>

                                <div className="p-6 space-y-6">
                                    {/* Star Rating */}
                                    <div className="text-center">
                                        <p className="text-sm font-medium text-gray-700 mb-4">
                                            Quelle note donnez-vous ?
                                        </p>
                                        <div className="flex justify-center gap-2">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    onClick={() => setRating(star)}
                                                    onMouseEnter={() => setHoverRating(star)}
                                                    onMouseLeave={() => setHoverRating(0)}
                                                    className="transition-transform hover:scale-110 focus:outline-none"
                                                >
                                                    <Star
                                                        size={40}
                                                        className={cn(
                                                            'transition-all',
                                                            (hoverRating || rating) >= star
                                                                ? 'fill-yellow-400 text-yellow-400'
                                                                : 'text-gray-300'
                                                        )}
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                        {rating > 0 && (
                                            <motion.p
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="text-lg font-bold text-indigo-600 mt-3"
                                            >
                                                {rating === 1 && 'Pas terrible 😕'}
                                                {rating === 2 && 'Bof 😐'}
                                                {rating === 3 && 'Correct 🙂'}
                                                {rating === 4 && 'Très bien ! 😊'}
                                                {rating === 5 && 'Excellent ! 🤩'}
                                            </motion.p>
                                        )}
                                    </div>

                                    {/* Comment */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Commentaire (optionnel)
                                        </label>
                                        <textarea
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            placeholder="Partagez votre expérience avec cette recette..."
                                            className="w-full p-3 border border-gray-200 rounded-xl resize-none h-24 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900"
                                            maxLength={300}
                                        />
                                        <p className="text-xs text-gray-500 mt-1 text-right">
                                            {comment.length}/300
                                        </p>
                                    </div>

                                    {/* Submit Button */}
                                    <button
                                        onClick={handleSubmit}
                                        disabled={rating === 0 || isSubmitting}
                                        className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 disabled:from-gray-300 disabled:to-gray-300 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all hover:shadow-lg disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? (
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                <Send size={18} />
                                                Envoyer ma note
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

