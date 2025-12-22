'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Users,
    ChevronRight,
    Star,
    Clock,
    Flame,
    Youtube,
    Instagram,
    Plus,
    Loader2,
} from 'lucide-react';
import { getTopCommunityRecipes } from '@/app/actions/social-recipe';

interface CommunityRecipe {
    id: string;
    title: string;
    description: string | null;
    imageUrl: string | null;
    calories: number;
    prepTime: number;
    servings: number;
    averageRating: number;
    ratingsCount: number;
    source: string;
    videoPlatform: string | null;
    author: {
        id: string;
        name: string | null;
        image: string | null;
    } | null;
    tags: string[];
}

interface CommunityRecipesWidgetProps {
    onRecipeClick?: (recipeId: string) => void;
    onAddToPlan?: (recipeId: string) => void;
    onRate?: (recipeId: string, title: string) => void;
    onSeeAll?: () => void;
}

export function CommunityRecipesWidget({
    onRecipeClick,
    onAddToPlan,
    onRate,
    onSeeAll,
}: CommunityRecipesWidgetProps) {
    const [recipes, setRecipes] = useState<CommunityRecipe[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadRecipes();
    }, []);

    const loadRecipes = async () => {
        const result = await getTopCommunityRecipes(5);
        if (result.success && result.recipes) {
            setRecipes(result.recipes);
        }
        setIsLoading(false);
    };

    const getPlatformIcon = (platform: string | null) => {
        switch (platform) {
            case 'youtube':
                return <Youtube className="w-4 h-4 text-red-500" />;
            case 'instagram':
                return <Instagram className="w-4 h-4 text-pink-500" />;
            case 'tiktok':
                return (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
                    </svg>
                );
            default:
                return <Users className="w-4 h-4 text-blue-500" />;
        }
    };

    if (isLoading) {
        return (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                </div>
            </div>
        );
    }

    if (recipes.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
            >
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <Users className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">Recettes de la communauté</h3>
                        <p className="text-xs text-gray-500">Les meilleures recettes partagées</p>
                    </div>
                </div>
                <div className="text-center py-8 bg-gray-50 rounded-xl">
                    <Users className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">Aucune recette pour le moment</p>
                    <p className="text-gray-400 text-xs mt-1">
                        Soyez le premier à partager une recette !
                    </p>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
        >
            {/* Header */}
            <div className="p-5 pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                            <Users className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">Vos recettes</h3>
                            <p className="text-xs text-gray-500">
                                Partagées par la communauté
                            </p>
                        </div>
                    </div>
                    {onSeeAll && (
                        <button
                            onClick={onSeeAll}
                            className="text-sm text-primary-600 font-medium flex items-center gap-1 hover:text-primary-700"
                        >
                            Voir tout
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Recipe cards - horizontal scroll */}
            <div className="overflow-x-auto pb-5 px-5 -mx-5">
                <div className="flex gap-4 px-5" style={{ minWidth: 'max-content' }}>
                    {recipes.map((recipe, index) => (
                        <motion.div
                            key={recipe.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="w-64 flex-shrink-0 bg-gray-50 rounded-xl overflow-hidden border border-gray-100"
                        >
                            {/* Image */}
                            <div
                                className="h-36 bg-cover bg-center relative bg-gradient-to-br from-orange-100 to-rose-100"
                                style={{
                                    backgroundImage: recipe.imageUrl
                                        ? `url(${recipe.imageUrl})`
                                        : undefined,
                                }}
                            >
                                {/* Platform badge */}
                                <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1">
                                    {getPlatformIcon(recipe.videoPlatform)}
                                    <span className="text-xs font-medium capitalize">
                                        {recipe.videoPlatform || 'community'}
                                    </span>
                                </div>

                                {/* Rating badge */}
                                {recipe.ratingsCount > 0 && (
                                    <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full flex items-center gap-1">
                                        <Star className="w-3 h-3 fill-current" />
                                        <span className="text-xs font-bold">
                                            {recipe.averageRating.toFixed(1)}
                                        </span>
                                    </div>
                                )}

                                {/* Gradient overlay */}
                                <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/60 to-transparent" />

                                {/* Calories */}
                                <div className="absolute bottom-2 left-2 flex items-center gap-1 text-white text-sm">
                                    <Flame className="w-4 h-4" />
                                    <span className="font-medium">{Math.round(recipe.calories)} kcal</span>
                                </div>

                                {/* Prep time */}
                                <div className="absolute bottom-2 right-2 flex items-center gap-1 text-white text-sm">
                                    <Clock className="w-4 h-4" />
                                    <span>{recipe.prepTime} min</span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-3">
                                <h4 className="font-bold text-gray-900 text-sm line-clamp-2 mb-2">
                                    {recipe.title}
                                </h4>

                                {/* Author */}
                                {recipe.author && (
                                    <div className="flex items-center gap-2 mb-3">
                                        {recipe.author.image ? (
                                            <img
                                                src={recipe.author.image}
                                                alt={recipe.author.name || ''}
                                                className="w-5 h-5 rounded-full"
                                            />
                                        ) : (
                                            <div className="w-5 h-5 rounded-full bg-gray-300" />
                                        )}
                                        <span className="text-xs text-gray-500 truncate">
                                            {recipe.author.name || 'Anonyme'}
                                        </span>
                                    </div>
                                )}

                                {/* Tags */}
                                {recipe.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mb-3">
                                        {recipe.tags.slice(0, 2).map((tag, i) => (
                                            <span
                                                key={i}
                                                className="px-2 py-0.5 bg-gray-200 text-gray-600 text-xs rounded-full"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => onRate?.(recipe.id, recipe.title)}
                                        className="flex-1 py-2 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-1"
                                    >
                                        <Star className="w-3 h-3" />
                                        Noter
                                    </button>
                                    <button
                                        onClick={() => onAddToPlan?.(recipe.id)}
                                        className="flex-1 py-2 text-xs font-medium text-white bg-primary-500 rounded-lg hover:bg-primary-600 transition-colors flex items-center justify-center gap-1"
                                    >
                                        <Plus className="w-3 h-3" />
                                        Ajouter
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}
