'use client';

import { useState } from 'react';
import { ThumbsUp, ThumbsDown, MessageCircle } from 'lucide-react';
import { quickMealFeedback } from '@/app/actions/feedback';
import { cn } from '@/lib/utils';

interface QuickFeedbackButtonsProps {
    recipeId: string;
    onOpenDetailedFeedback?: () => void;
    size?: 'sm' | 'md';
}

export function QuickFeedbackButtons({ recipeId, onOpenDetailedFeedback, size = 'md' }: QuickFeedbackButtonsProps) {
    const [feedback, setFeedback] = useState<'liked' | 'disliked' | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleQuickFeedback = async (liked: boolean) => {
        if (isSubmitting) return;
        
        setIsSubmitting(true);
        const result = await quickMealFeedback({ recipeId, liked });
        
        if (result.success) {
            setFeedback(liked ? 'liked' : 'disliked');
        }
        setIsSubmitting(false);
    };

    const iconSize = size === 'sm' ? 16 : 20;
    const buttonClass = size === 'sm' 
        ? 'p-1.5 rounded-lg' 
        : 'p-2 rounded-xl';

    if (feedback) {
        return (
            <div className={cn(
                "flex items-center gap-1 text-xs font-medium",
                feedback === 'liked' ? 'text-green-600' : 'text-red-600'
            )}>
                {feedback === 'liked' ? (
                    <>
                        <ThumbsUp size={14} className="fill-green-600" />
                        <span>Aimé</span>
                    </>
                ) : (
                    <>
                        <ThumbsDown size={14} className="fill-red-600" />
                        <span>Pas aimé</span>
                    </>
                )}
            </div>
        );
    }

    return (
        <div className="flex items-center gap-1">
            <button
                onClick={() => handleQuickFeedback(true)}
                disabled={isSubmitting}
                className={cn(
                    buttonClass,
                    "bg-gray-100 hover:bg-green-100 text-gray-600 hover:text-green-600 transition-all",
                    isSubmitting && "opacity-50 cursor-not-allowed"
                )}
                title="J'aime"
            >
                <ThumbsUp size={iconSize} />
            </button>
            <button
                onClick={() => handleQuickFeedback(false)}
                disabled={isSubmitting}
                className={cn(
                    buttonClass,
                    "bg-gray-100 hover:bg-red-100 text-gray-600 hover:text-red-600 transition-all",
                    isSubmitting && "opacity-50 cursor-not-allowed"
                )}
                title="Je n'aime pas"
            >
                <ThumbsDown size={iconSize} />
            </button>
            {onOpenDetailedFeedback && (
                <button
                    onClick={onOpenDetailedFeedback}
                    className={cn(
                        buttonClass,
                        "bg-gray-100 hover:bg-primary-100 text-gray-600 hover:text-primary-600 transition-all"
                    )}
                    title="Donner un avis détaillé"
                >
                    <MessageCircle size={iconSize} />
                </button>
            )}
        </div>
    );
}




