'use client';

import { Star } from 'lucide-react';

interface StarRatingProps {
    rating: number;
    count?: number;
    size?: 'sm' | 'md' | 'lg';
    showCount?: boolean;
}

export function StarRating({ rating, count, size = 'md', showCount = true }: StarRatingProps) {
    const sizes = {
        sm: 'w-3 h-3',
        md: 'w-4 h-4',
        lg: 'w-5 h-5',
    };

    const textSizes = {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base',
    };

    return (
        <div className="flex items-center gap-1">
            <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => {
                    const filled = star <= Math.round(rating);
                    const partial = !filled && star === Math.ceil(rating) && rating % 1 !== 0;

                    return (
                        <Star
                            key={star}
                            className={`${sizes[size]} ${
                                filled
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : partial
                                    ? 'fill-yellow-400/50 text-yellow-400'
                                    : 'text-gray-300'
                            }`}
                        />
                    );
                })}
            </div>
            {showCount && count !== undefined && count > 0 && (
                <span className={`${textSizes[size]} text-gray-500`}>({count})</span>
            )}
            {showCount && (count === undefined || count === 0) && rating > 0 && (
                <span className={`${textSizes[size]} text-gray-700 font-medium`}>
                    {rating.toFixed(1)}
                </span>
            )}
        </div>
    );
}

interface InteractiveStarRatingProps {
    value: number;
    onChange: (value: number) => void;
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
}

export function InteractiveStarRating({
    value,
    onChange,
    size = 'lg',
    disabled = false,
}: InteractiveStarRatingProps) {
    const sizes = {
        sm: 'w-6 h-6',
        md: 'w-8 h-8',
        lg: 'w-10 h-10',
    };

    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    onClick={() => !disabled && onChange(star)}
                    disabled={disabled}
                    className={`p-0.5 transition-transform ${
                        disabled ? 'cursor-not-allowed opacity-50' : 'hover:scale-110 cursor-pointer'
                    }`}
                >
                    <Star
                        className={`${sizes[size]} transition-colors ${
                            star <= value
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300 hover:text-yellow-200'
                        }`}
                    />
                </button>
            ))}
        </div>
    );
}
