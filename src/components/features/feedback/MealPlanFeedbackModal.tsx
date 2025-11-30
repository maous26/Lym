'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Check, Calendar, Utensils, Clock, MessageSquare, Send } from 'lucide-react';
import { submitMealPlanFeedback } from '@/app/actions/feedback';
import { cn } from '@/lib/utils';

interface MealPlanFeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
    mealPlanId: string;
    planDays?: { day: string; meals: { type: string; name: string }[] }[];
}

export function MealPlanFeedbackModal({ isOpen, onClose, mealPlanId, planDays }: MealPlanFeedbackModalProps) {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [variety, setVariety] = useState(0);
    const [practicality, setPracticality] = useState(0);
    const [satisfying, setSatisfying] = useState<boolean | null>(null);
    const [comment, setComment] = useState('');
    const [improvedMeals, setImprovedMeals] = useState<{ day: string; meal: string; reason: string }[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [showMealSelector, setShowMealSelector] = useState(false);

    const handleSubmit = async () => {
        if (rating === 0) return;
        
        setIsSubmitting(true);
        
        const result = await submitMealPlanFeedback({
            mealPlanId,
            rating,
            variety: variety || undefined,
            practicality: practicality || undefined,
            satisfying: satisfying ?? undefined,
            comment: comment || undefined,
            improvedMeals: improvedMeals.length > 0 ? improvedMeals : undefined,
        });

        setIsSubmitting(false);

        if (result.success) {
            setSubmitted(true);
            setTimeout(() => {
                onClose();
                // Reset state
                setRating(0);
                setVariety(0);
                setPracticality(0);
                setSatisfying(null);
                setComment('');
                setImprovedMeals([]);
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

    const toggleMealImprovement = (day: string, meal: string) => {
        const exists = improvedMeals.find(m => m.day === day && m.meal === meal);
        if (exists) {
            setImprovedMeals(prev => prev.filter(m => !(m.day === day && m.meal === meal)));
        } else {
            setImprovedMeals(prev => [...prev, { day, meal, reason: 'À améliorer' }]);
        }
    };

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
                                    <Check className="w-10 h-10 text-green-600" />
                                </motion.div>
                                <h3 className="text-xl font-bold text-gray-900">Merci pour votre avis !</h3>
                                <p className="text-gray-500 mt-2">Vos retours nous aident à créer de meilleurs plans.</p>
                            </div>
                        ) : (
                            <>
                                {/* Header */}
                                <div className="sticky top-0 bg-white p-4 border-b flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="text-primary-600" size={20} />
                                        <h2 className="text-lg font-bold text-gray-900">Avis sur le plan</h2>
                                    </div>
                                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="p-6 space-y-6">
                                    {/* Main Rating */}
                                    <div className="text-center">
                                        <p className="text-sm font-medium text-gray-700 mb-2">Note globale du plan</p>
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
                                                <Utensils size={16} />
                                                <span>Variété</span>
                                            </div>
                                            <StarRating value={variety} onChange={setVariety} size={18} />
                                        </div>
                                        <div className="bg-gray-50 rounded-xl p-3">
                                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                                <Clock size={16} />
                                                <span>Praticité</span>
                                            </div>
                                            <StarRating value={practicality} onChange={setPracticality} size={18} />
                                        </div>
                                    </div>

                                    {/* Satisfying */}
                                    <div>
                                        <p className="text-sm font-medium text-gray-700 mb-2">Le plan était-il rassasiant ?</p>
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => setSatisfying(true)}
                                                className={cn(
                                                    "flex-1 py-3 rounded-xl font-medium transition-all",
                                                    satisfying === true
                                                        ? "bg-green-100 text-green-700 border-2 border-green-500"
                                                        : "bg-gray-100 text-gray-600 border-2 border-transparent"
                                                )}
                                            >
                                                Oui ✓
                                            </button>
                                            <button
                                                onClick={() => setSatisfying(false)}
                                                className={cn(
                                                    "flex-1 py-3 rounded-xl font-medium transition-all",
                                                    satisfying === false
                                                        ? "bg-orange-100 text-orange-700 border-2 border-orange-500"
                                                        : "bg-gray-100 text-gray-600 border-2 border-transparent"
                                                )}
                                            >
                                                Pas assez
                                            </button>
                                        </div>
                                    </div>

                                    {/* Meals to Improve */}
                                    {planDays && planDays.length > 0 && (
                                        <div>
                                            <button
                                                onClick={() => setShowMealSelector(!showMealSelector)}
                                                className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1"
                                            >
                                                <Utensils size={14} />
                                                Signaler des repas à améliorer ({improvedMeals.length})
                                            </button>
                                            
                                            <AnimatePresence>
                                                {showMealSelector && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        className="overflow-hidden mt-3"
                                                    >
                                                        <div className="bg-gray-50 rounded-xl p-3 max-h-48 overflow-y-auto space-y-2">
                                                            {planDays.slice(0, 3).map((day) => (
                                                                <div key={day.day} className="space-y-1">
                                                                    <p className="text-xs font-medium text-gray-500">{day.day}</p>
                                                                    <div className="flex flex-wrap gap-1">
                                                                        {day.meals.map((meal) => {
                                                                            const isSelected = improvedMeals.some(
                                                                                m => m.day === day.day && m.meal === meal.type
                                                                            );
                                                                            return (
                                                                                <button
                                                                                    key={meal.type}
                                                                                    onClick={() => toggleMealImprovement(day.day, meal.type)}
                                                                                    className={cn(
                                                                                        "px-2 py-1 rounded text-xs transition-all",
                                                                                        isSelected
                                                                                            ? "bg-orange-100 text-orange-700 border border-orange-300"
                                                                                            : "bg-white text-gray-600 border border-gray-200"
                                                                                    )}
                                                                                >
                                                                                    {meal.type}
                                                                                </button>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    )}

                                    {/* Comment */}
                                    <div>
                                        <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                            <MessageSquare size={16} />
                                            Suggestions d'amélioration
                                        </p>
                                        <textarea
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            placeholder="Ex: Plus de légumes, moins de viande rouge, recettes plus rapides..."
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

