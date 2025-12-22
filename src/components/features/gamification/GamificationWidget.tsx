'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Trophy, Flame, Star, ChevronRight, Medal } from 'lucide-react';
import { getUserGamification } from '@/app/actions/gamification';

interface GamificationData {
    totalXp: number;
    level: number;
    currentXp: number;
    nextLevelXp: number;
    progress: number;
    currentStreak: number;
    longestStreak: number;
    recipesRated: number;
    recipesCooked: number;
    mealsLogged: number;
    badges: Array<{
        type: string;
        name: string;
        icon: string | null;
        description: string | null;
        earnedAt: Date;
    }>;
    recentXp: Array<{
        amount: number;
        reason: string;
        createdAt: Date;
    }>;
}

interface GamificationWidgetProps {
    compact?: boolean;
    onViewDetails?: () => void;
}

export function GamificationWidget({ compact = false, onViewDetails }: GamificationWidgetProps) {
    const [data, setData] = useState<GamificationData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const result = await getUserGamification();
        if (result.success && result.data) {
            setData(result.data as GamificationData);
        }
        setIsLoading(false);
    };

    if (isLoading) {
        return (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-4" />
                <div className="h-16 bg-gray-100 rounded" />
            </div>
        );
    }

    if (!data) {
        return null;
    }

    if (compact) {
        return (
            <motion.button
                onClick={onViewDetails}
                className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-4 shadow-lg w-full text-left"
                whileTap={{ scale: 0.98 }}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                            <span className="text-2xl font-bold text-white">{data.level}</span>
                        </div>
                        <div>
                            <p className="text-white/70 text-xs">Niveau</p>
                            <p className="text-white font-bold">{data.totalXp} XP</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {data.currentStreak > 0 && (
                            <div className="flex items-center gap-1 bg-orange-500 px-2 py-1 rounded-full">
                                <Flame className="w-4 h-4 text-white" />
                                <span className="text-white text-sm font-bold">{data.currentStreak}</span>
                            </div>
                        )}
                        <ChevronRight className="w-5 h-5 text-white/70" />
                    </div>
                </div>
                {/* Progress bar */}
                <div className="mt-3 h-2 bg-white/20 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${data.progress}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full"
                    />
                </div>
                <p className="text-white/60 text-xs mt-1 text-right">
                    {data.currentXp}/{data.nextLevelXp} XP
                </p>
            </motion.button>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
        >
            {/* Header with level */}
            <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-5 text-white">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
                            <span className="text-3xl font-bold">{data.level}</span>
                        </div>
                        <div>
                            <p className="text-white/70 text-sm">Niveau</p>
                            <p className="text-xl font-bold">{data.totalXp} XP total</p>
                        </div>
                    </div>
                    {data.currentStreak > 0 && (
                        <div className="flex flex-col items-center bg-orange-500/90 px-3 py-2 rounded-xl">
                            <Flame className="w-6 h-6" />
                            <span className="font-bold">{data.currentStreak}j</span>
                        </div>
                    )}
                </div>

                {/* XP Progress */}
                <div>
                    <div className="flex justify-between text-sm mb-1">
                        <span className="text-white/70">Progression niveau {data.level + 1}</span>
                        <span className="font-medium">{data.progress}%</span>
                    </div>
                    <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${data.progress}%` }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                            className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full"
                        />
                    </div>
                    <p className="text-white/60 text-xs mt-1 text-right">
                        {data.currentXp}/{data.nextLevelXp} XP pour le niveau suivant
                    </p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="p-5 grid grid-cols-3 gap-4">
                <div className="text-center">
                    <div className="w-12 h-12 mx-auto rounded-xl bg-amber-100 flex items-center justify-center mb-2">
                        <Star className="w-6 h-6 text-amber-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{data.recipesRated}</p>
                    <p className="text-xs text-gray-500">Notées</p>
                </div>
                <div className="text-center">
                    <div className="w-12 h-12 mx-auto rounded-xl bg-green-100 flex items-center justify-center mb-2">
                        <Trophy className="w-6 h-6 text-green-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{data.recipesCooked}</p>
                    <p className="text-xs text-gray-500">Cuisinées</p>
                </div>
                <div className="text-center">
                    <div className="w-12 h-12 mx-auto rounded-xl bg-orange-100 flex items-center justify-center mb-2">
                        <Flame className="w-6 h-6 text-orange-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{data.longestStreak}</p>
                    <p className="text-xs text-gray-500">Meilleur streak</p>
                </div>
            </div>

            {/* Badges */}
            {data.badges.length > 0 && (
                <div className="px-5 pb-5">
                    <div className="flex items-center gap-2 mb-3">
                        <Medal className="w-5 h-5 text-purple-500" />
                        <h4 className="font-bold text-gray-900">Badges obtenus</h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {data.badges.slice(0, 6).map((badge) => (
                            <div
                                key={badge.type}
                                className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-full"
                                title={badge.description || ''}
                            >
                                <span className="text-lg">{badge.icon}</span>
                                <span className="text-sm font-medium text-gray-700">{badge.name}</span>
                            </div>
                        ))}
                        {data.badges.length > 6 && (
                            <div className="flex items-center gap-1 bg-purple-100 px-3 py-2 rounded-full">
                                <span className="text-sm font-medium text-purple-700">
                                    +{data.badges.length - 6}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Recent XP */}
            {data.recentXp.length > 0 && (
                <div className="px-5 pb-5 pt-2 border-t border-gray-100">
                    <p className="text-xs text-gray-500 mb-2">XP récents</p>
                    <div className="space-y-2">
                        {data.recentXp.slice(0, 3).map((xp, index) => (
                            <div key={index} className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">{formatReason(xp.reason)}</span>
                                <span className="text-green-600 font-medium">+{xp.amount} XP</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </motion.div>
    );
}

function formatReason(reason: string): string {
    const labels: Record<string, string> = {
        rate_recipe: 'Note recette',
        rate_recipe_with_comment: 'Note + commentaire',
        mark_recipe_cooked: 'Recette cuisinée',
        first_rating: 'Première note',
        log_meal: 'Repas logué',
        log_weight: 'Pesée enregistrée',
        streak_3_days: 'Streak 3 jours',
        streak_7_days: 'Streak 7 jours',
        streak_14_days: 'Streak 14 jours',
        streak_30_days: 'Streak 30 jours',
        recipes_rated_5: '5 recettes notées',
        recipes_rated_10: '10 recettes notées',
        recipes_rated_25: '25 recettes notées',
        first_meal: 'Premier repas',
        meals_logged_10: '10 repas logués',
        meals_logged_50: '50 repas logués',
        meals_logged_100: '100 repas logués',
    };
    return labels[reason] || reason;
}
