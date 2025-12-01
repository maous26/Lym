'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Trophy, ArrowRight, ChefHat, Star, Crown, Medal, Link2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useOnboardingStore } from '@/store/onboarding-store';
import { getOrCreateUserRanking, getUserRank, type UserRankingData } from '@/app/actions/ranking';

const LEVEL_INFO: Record<number, { name: string; color: string; bgColor: string; icon: any }> = {
    1: { name: 'Apprenti Chef', color: 'text-blue-700', bgColor: 'bg-blue-50', icon: ChefHat },
    2: { name: 'Chef Confirmé', color: 'text-purple-700', bgColor: 'bg-purple-50', icon: Medal },
    3: { name: 'Chef Expert', color: 'text-yellow-700', bgColor: 'bg-yellow-50', icon: Crown },
};

const LEVEL_THRESHOLDS = {
    1: 0,
    2: 300,
    3: 1000,
};

export function CommunityWidget() {
    const router = useRouter();
    const { profile } = useOnboardingStore();
    const [ranking, setRanking] = useState<UserRankingData | null>(null);
    const [userRank, setUserRank] = useState<{ rank: number; total: number } | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadRankingData();
    }, [profile.name]);

    const loadRankingData = async () => {
        try {
            const userId = 'default'; // Pour l'instant, on utilise l'utilisateur par défaut
            const rankingData = await getOrCreateUserRanking(userId, profile.name || 'Chef Anonyme');
            setRanking(rankingData);

            const rankData = await getUserRank(userId);
            setUserRank(rankData);
        } catch (error) {
            console.error('Error loading ranking:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const currentLevel = ranking?.level || 1;
    const levelInfo = LEVEL_INFO[currentLevel];
    const LevelIcon = levelInfo.icon;
    
    // Calculer la progression vers le niveau suivant
    const currentPoints = ranking?.totalPoints || 0;
    const nextLevelThreshold = currentLevel < 3 ? LEVEL_THRESHOLDS[(currentLevel + 1) as keyof typeof LEVEL_THRESHOLDS] : LEVEL_THRESHOLDS[3];
    const currentLevelThreshold = LEVEL_THRESHOLDS[currentLevel as keyof typeof LEVEL_THRESHOLDS];
    const progressToNext = currentLevel < 3
        ? ((currentPoints - currentLevelThreshold) / (nextLevelThreshold - currentLevelThreshold)) * 100
        : 100;

    if (isLoading) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="h-20 bg-gray-100 rounded"></div>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
        >
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-1 shadow-xl relative overflow-hidden">
                <div className="bg-white rounded-[22px] p-5 relative z-10">
                    {/* Header with Level Status */}
                    <div className="flex justify-between items-start mb-5">
                        <div>
                            <h3 className="font-bold text-xl text-gray-900 flex items-center gap-2">
                                <Trophy className="text-yellow-500 fill-yellow-500" size={24} />
                                Classement Chef
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`text-sm font-medium ${levelInfo.color}`}>
                                    Niveau {currentLevel}
                                </span>
                                <span className="text-gray-300">•</span>
                                <span className="text-sm text-gray-500">{levelInfo.name}</span>
                            </div>
                        </div>
                        <div className={`${levelInfo.bgColor} px-3 py-2 rounded-xl border border-opacity-20`}>
                            <div className="flex items-center gap-2">
                                <LevelIcon size={18} className={levelInfo.color} />
                                <span className={`font-bold text-sm ${levelInfo.color}`}>
                                    {currentPoints} pts
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Progress Bar to Next Level */}
                    {currentLevel < 3 && (
                        <div className="mb-5">
                            <div className="flex justify-between text-xs mb-2">
                                <span className="font-medium text-gray-600">
                                    Prochain niveau: {LEVEL_INFO[currentLevel + 1].name}
                                </span>
                                <span className="text-indigo-600 font-bold">
                                    {Math.round(progressToNext)}%
                                </span>
                            </div>
                            <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min(progressToNext, 100)}%` }}
                                    transition={{ duration: 0.8, ease: "easeOut" }}
                                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                                />
                            </div>
                            <p className="text-xs text-gray-400 mt-1">
                                {nextLevelThreshold - currentPoints} points restants
                            </p>
                        </div>
                    )}

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-3 mb-5">
                        <div className="bg-gray-50 rounded-xl p-3 text-center">
                            <p className="text-xl font-bold text-gray-900">{ranking?.recipesCount || 0}</p>
                            <p className="text-xs text-gray-500">Recettes</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                                <Star size={14} className="text-yellow-500 fill-yellow-500" />
                                <span className="text-xl font-bold text-gray-900">
                                    {ranking?.averageRating ? ranking.averageRating.toFixed(1) : '-'}
                                </span>
                            </div>
                            <p className="text-xs text-gray-500">Note moy.</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-3 text-center">
                            <p className="text-xl font-bold text-gray-900">
                                {userRank ? `#${userRank.rank}` : '-'}
                            </p>
                            <p className="text-xs text-gray-500">Classement</p>
                        </div>
                    </div>

                    {/* Main Actions */}
                    <div className="space-y-3">
                        {/* Classement Button */}
                        <button
                            onClick={() => router.push('/community')}
                            className="w-full flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border-2 border-purple-100 hover:border-purple-300 hover:shadow-md transition-all group"
                        >
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                <Users size={24} className="text-purple-600" />
                            </div>
                            <div className="text-left flex-1">
                                <span className="font-bold text-base text-gray-900 block">Voir le Classement</span>
                                <span className="text-xs text-purple-600">Top 10 des Chefs</span>
                            </div>
                            <ArrowRight size={20} className="text-purple-600" />
                        </button>

                        {/* Share from Link Button */}
                        <button
                            onClick={() => router.push('/recipes/share')}
                            className="w-full flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-orange-50 to-pink-50 rounded-xl border-2 border-orange-100 hover:border-orange-300 hover:shadow-md transition-all group"
                        >
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                <Link2 size={24} className="text-orange-600" />
                            </div>
                            <div className="text-left flex-1">
                                <span className="font-bold text-base text-gray-900 block">Partager une Recette</span>
                                <span className="text-xs text-orange-600">Instagram, TikTok, YouTube</span>
                            </div>
                            <ArrowRight size={20} className="text-orange-600" />
                        </button>
                    </div>

                    {/* Points Info */}
                    <div className="mt-4 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
                        <p className="text-xs text-gray-600">
                            <span className="font-medium">Comment gagner des points ?</span>
                            <br />
                            🔗 +50 pts par recette partagée • 📸 +20 pts avec photo IA • ⭐ +10 pts par note reçue • 🏆 +100 pts plat de la semaine
                        </p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
