'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, ThumbsUp, ThumbsDown, ChefHat, Clock, MessageSquare, Send } from 'lucide-react';
import { submitRecipeFeedback } from '@/app/actions/feedback';
import { cn } from '@/lib/utils';

interface RecipeFeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
    recipeId: string;
    recipeName: string;
}

const FEEDBACK_TAGS = [
    { id: 'delicieux', label: 'Délicieux 😋', positive: true },
    { id: 'equilibre', label: 'Équilibré', positive: true },
    { id: 'rapide', label: 'Rapide à faire', positive: true },
    { id: 'economique', label: 'Économique', positive: true },
    { id: 'rassasiant', label: 'Rassasiant', positive: true },
    { id: 'original', label: 'Original', positive: true },
    { id: 'trop_sale', label: 'Trop salé', positive: false },
    { id: 'trop_sucre', label: 'Trop sucré', positive: false },
    { id: 'fade', label: 'Fade', positive: false },
    { id: 'trop_long', label: 'Trop long', positive: false },
    { id: 'ingredients_rares', label: 'Ingrédients rares', positive: false },
    { id: 'portions_petites', label: 'Portions petites', positive: false },
];

export function RecipeFeedbackModal({ isOpen, onClose, recipeId, recipeName }: RecipeFeedbackModalProps) {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [taste, setTaste] = useState(0);
    const [difficulty, setDifficulty] = useState(0);
    const [wouldMakeAgain, setWouldMakeAgain] = useState<boolean | null>(null);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleTagToggle = (tagId: string) => {
        setSelectedTags(prev => 
            prev.includes(tagId) 
                ? prev.filter(t => t !== tagId)
                : [...prev, tagId]
        );
    };

    const handleSubmit = async () => {
        if (rating === 0) return;
        
        setIsSubmitting(true);
        
        const result = await submitRecipeFeedback({
            recipeId,
            rating,
            taste: taste || undefined,
            difficulty: difficulty || undefined,
            wouldMakeAgain: wouldMakeAgain ?? undefined,
            comment: comment || undefined,
            tags: selectedTags.length > 0 ? selectedTags : undefined,
        });

        setIsSubmitting(false);

        if (result.success) {
            setSubmitted(true);
            setTimeout(() => {
                onClose();
                // Reset state
                setRating(0);
                setTaste(0);
                setDifficulty(0);
                setWouldMakeAgain(null);
                setSelectedTags([]);
                setComment('');
                setSubmitted(false);
            }, 1500);
        }
    };

    const StarRating = ({ value, onChange, onHover, size = 24 }: { value: number; onChange: (v: number) => void; onHover?: (v: number) => void; size?: number }) => (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    onClick={() => onChange(star)}
                    onMouseEnter={() => onHover?.(star)}
                    onMouseLeave={() => onHover?.(0)}
                    className="transition-transform hover:scale-110"
                >
                    <Star
                        size={size}
                        className={cn(
                            "transition-colors",
                            (onHover ? (hoverRating || value) : value) >= star
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                        )}
                    />
                </button>
            ))}
        </div>
    );

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md max-h-[85vh] overflow-y-auto"
                    >
                        {submitted ? (
                            <div className="p-8 text-center">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
                                >
                                    <ThumbsUp className="w-10 h-10 text-green-600" />
                                </motion.div>
                                <h3 className="text-xl font-bold text-gray-900">Merci pour votre avis !</h3>
                                <p className="text-gray-500 mt-2">Votre feedback nous aide à améliorer les suggestions.</p>
                            </div>
                        ) : (
                            <>
                                {/* Header */}
                                <div className="sticky top-0 bg-white p-4 border-b flex items-center justify-between">
                                    <h2 className="text-lg font-bold text-gray-900">Votre avis</h2>
                                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="p-6 space-y-6">
                                    {/* Recipe Name */}
                                    <div className="text-center">
                                        <p className="text-sm text-gray-500">Comment avez-vous trouvé</p>
                                        <p className="font-bold text-gray-900">{recipeName}</p>
                                    </div>

                                    {/* Main Rating */}
                                    <div className="text-center">
                                        <p className="text-sm font-medium text-gray-700 mb-2">Note globale</p>
                                        <div className="flex justify-center">
                                            <StarRating 
                                                value={rating} 
                                                onChange={setRating}
                                                onHover={setHoverRating}
                                                size={32}
                                            />
                                        </div>
                                    </div>

                                    {/* Detailed Ratings */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-gray-50 rounded-xl p-3">
                                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                                <span>😋</span>
                                                <span>Goût</span>
                                            </div>
                                            <StarRating value={taste} onChange={setTaste} size={18} />
                                        </div>
                                        <div className="bg-gray-50 rounded-xl p-3">
                                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                                <ChefHat size={16} />
                                                <span>Difficulté</span>
                                            </div>
                                            <StarRating value={difficulty} onChange={setDifficulty} size={18} />
                                        </div>
                                    </div>

                                    {/* Would Make Again */}
                                    <div>
                                        <p className="text-sm font-medium text-gray-700 mb-2">Referiez-vous cette recette ?</p>
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => setWouldMakeAgain(true)}
                                                className={cn(
                                                    "flex-1 py-3 rounded-xl flex items-center justify-center gap-2 font-medium transition-all",
                                                    wouldMakeAgain === true
                                                        ? "bg-green-100 text-green-700 border-2 border-green-500"
                                                        : "bg-gray-100 text-gray-600 border-2 border-transparent"
                                                )}
                                            >
                                                <ThumbsUp size={18} />
                                                Oui !
                                            </button>
                                            <button
                                                onClick={() => setWouldMakeAgain(false)}
                                                className={cn(
                                                    "flex-1 py-3 rounded-xl flex items-center justify-center gap-2 font-medium transition-all",
                                                    wouldMakeAgain === false
                                                        ? "bg-red-100 text-red-700 border-2 border-red-500"
                                                        : "bg-gray-100 text-gray-600 border-2 border-transparent"
                                                )}
                                            >
                                                <ThumbsDown size={18} />
                                                Non
                                            </button>
                                        </div>
                                    </div>

                                    {/* Tags */}
                                    <div>
                                        <p className="text-sm font-medium text-gray-700 mb-2">Tags (optionnel)</p>
                                        <div className="flex flex-wrap gap-2">
                                            {FEEDBACK_TAGS.map((tag) => (
                                                <button
                                                    key={tag.id}
                                                    onClick={() => handleTagToggle(tag.id)}
                                                    className={cn(
                                                        "px-3 py-1.5 rounded-full text-sm font-medium transition-all",
                                                        selectedTags.includes(tag.id)
                                                            ? tag.positive
                                                                ? "bg-green-100 text-green-700 border-2 border-green-400"
                                                                : "bg-red-100 text-red-700 border-2 border-red-400"
                                                            : "bg-gray-100 text-gray-600 border-2 border-transparent"
                                                    )}
                                                >
                                                    {tag.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Comment */}
                                    <div>
                                        <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                            <MessageSquare size={16} />
                                            Commentaire (optionnel)
                                        </p>
                                        <textarea
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            placeholder="Partagez votre expérience..."
                                            className="w-full p-3 border border-gray-200 rounded-xl resize-none h-24 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        />
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <div className="sticky bottom-0 bg-white p-4 border-t">
                                    <button
                                        onClick={handleSubmit}
                                        disabled={rating === 0 || isSubmitting}
                                        className="w-full bg-primary-600 disabled:bg-gray-300 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all hover:bg-primary-700"
                                    >
                                        {isSubmitting ? (
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                <Send size={18} />
                                                Envoyer mon avis
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




