'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronDown,
    ChevronUp,
    Youtube,
    Instagram,
    Link,
    Loader2,
    Check,
    Sparkles,
    Clock,
    Users,
    Flame,
    X,
} from 'lucide-react';
import { submitVideoRecipe } from '@/app/actions/social-recipe';

interface SubmitRecipeWidgetProps {
    onSuccess?: (recipe: any, xpEarned: number) => void;
}

export function SubmitRecipeWidget({ onSuccess }: SubmitRecipeWidgetProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [url, setUrl] = useState('');
    const [description, setDescription] = useState('');
    const [showDescriptionField, setShowDescriptionField] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<{ recipe: any; xpEarned: number } | null>(null);

    const detectPlatform = (url: string): 'youtube' | 'instagram' | 'tiktok' | null => {
        if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
        if (url.includes('instagram.com')) return 'instagram';
        if (url.includes('tiktok.com')) return 'tiktok';
        return null;
    };

    const platform = detectPlatform(url);

    const handleSubmit = async () => {
        if (!url.trim()) return;

        setIsLoading(true);
        setError(null);

        const result = await submitVideoRecipe(url, description || undefined);

        if (result.success && result.recipe) {
            setSuccess({ recipe: result.recipe, xpEarned: result.xpEarned || 50 });
            onSuccess?.(result.recipe, result.xpEarned || 50);
            // Reset after 5 seconds
            setTimeout(() => {
                setSuccess(null);
                setUrl('');
                setDescription('');
                setIsExpanded(false);
            }, 5000);
        } else {
            // Check if we need description for Instagram/TikTok
            if (result.error?.includes('description')) {
                setShowDescriptionField(true);
            }
            setError(result.error || 'Erreur inconnue');
        }

        setIsLoading(false);
    };

    const handleClose = () => {
        setIsExpanded(false);
        setUrl('');
        setDescription('');
        setError(null);
        setShowDescriptionField(false);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-rose-500 to-orange-500 rounded-2xl shadow-lg overflow-hidden"
        >
            {/* Header - Always visible */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full p-5 text-left text-white"
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                            <Link className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">Proposez vos recettes</h3>
                            <p className="text-white/80 text-sm">
                                YouTube, Instagram, TikTok
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                            +50 XP
                        </span>
                        {isExpanded ? (
                            <ChevronUp className="w-5 h-5" />
                        ) : (
                            <ChevronDown className="w-5 h-5" />
                        )}
                    </div>
                </div>
            </button>

            {/* Expandable content */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                    >
                        <div className="px-5 pb-5">
                            {success ? (
                                // Success state
                                <motion.div
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="bg-white rounded-xl p-5 text-center"
                                >
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: 'spring', damping: 10 }}
                                        className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500 flex items-center justify-center"
                                    >
                                        <Check className="w-8 h-8 text-white" />
                                    </motion.div>
                                    <h4 className="font-bold text-gray-900 text-lg mb-2">
                                        Recette ajoutée !
                                    </h4>
                                    <p className="text-gray-600 mb-3">{success.recipe.title}</p>
                                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full font-bold">
                                        <Sparkles className="w-4 h-4" />
                                        +{success.xpEarned} XP
                                    </div>

                                    {/* Recipe preview */}
                                    <div className="mt-4 p-4 bg-gray-50 rounded-xl text-left">
                                        <div className="flex items-center gap-4 text-sm text-gray-600">
                                            <span className="flex items-center gap-1">
                                                <Flame className="w-4 h-4 text-orange-500" />
                                                {Math.round(success.recipe.calories)} kcal
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-4 h-4 text-blue-500" />
                                                {success.recipe.prepTime} min
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Users className="w-4 h-4 text-green-500" />
                                                {success.recipe.servings} pers.
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            ) : (
                                // Input form
                                <div className="bg-white rounded-xl p-5">
                                    {/* Instructions */}
                                    <p className="text-gray-600 text-sm mb-4">
                                        Partagez une recette vidéo et notre IA l'analysera pour extraire
                                        les ingrédients, les étapes et calculer les calories !
                                    </p>

                                    {/* Platform icons */}
                                    <div className="flex items-center gap-3 mb-4">
                                        <div
                                            className={`p-2 rounded-lg transition-colors ${
                                                platform === 'youtube'
                                                    ? 'bg-red-100 text-red-600'
                                                    : 'bg-gray-100 text-gray-400'
                                            }`}
                                        >
                                            <Youtube className="w-5 h-5" />
                                        </div>
                                        <div
                                            className={`p-2 rounded-lg transition-colors ${
                                                platform === 'instagram'
                                                    ? 'bg-pink-100 text-pink-600'
                                                    : 'bg-gray-100 text-gray-400'
                                            }`}
                                        >
                                            <Instagram className="w-5 h-5" />
                                        </div>
                                        <div
                                            className={`p-2 rounded-lg transition-colors ${
                                                platform === 'tiktok'
                                                    ? 'bg-gray-900 text-white'
                                                    : 'bg-gray-100 text-gray-400'
                                            }`}
                                        >
                                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
                                            </svg>
                                        </div>
                                    </div>

                                    {/* URL input */}
                                    <div className="relative mb-4">
                                        <input
                                            type="url"
                                            value={url}
                                            onChange={(e) => {
                                                setUrl(e.target.value);
                                                setError(null);
                                            }}
                                            placeholder="Collez le lien de la vidéo..."
                                            className="w-full px-4 py-3 pr-10 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                                        />
                                        {url && (
                                            <button
                                                onClick={() => setUrl('')}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        )}
                                    </div>

                                    {/* Description field for Instagram/TikTok */}
                                    {showDescriptionField && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            className="mb-4"
                                        >
                                            <label className="text-sm text-gray-600 mb-2 block">
                                                Description de la recette (pour Instagram/TikTok)
                                            </label>
                                            <textarea
                                                value={description}
                                                onChange={(e) => setDescription(e.target.value)}
                                                placeholder="Copiez la description de la vidéo ou décrivez la recette..."
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent resize-none"
                                                rows={4}
                                            />
                                        </motion.div>
                                    )}

                                    {/* Error message */}
                                    {error && (
                                        <motion.p
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="text-red-500 text-sm mb-4"
                                        >
                                            {error}
                                        </motion.p>
                                    )}

                                    {/* Submit button */}
                                    <button
                                        onClick={handleSubmit}
                                        disabled={!url.trim() || isLoading}
                                        className="w-full py-3 bg-gradient-to-r from-rose-500 to-orange-500 text-white font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:shadow-lg transition-shadow"
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Analyse en cours...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="w-5 h-5" />
                                                Extraire la recette
                                            </>
                                        )}
                                    </button>

                                    {/* Cancel button */}
                                    <button
                                        onClick={handleClose}
                                        className="w-full mt-2 py-2 text-gray-500 text-sm hover:text-gray-700"
                                    >
                                        Annuler
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
