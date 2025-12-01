'use client';

import { useState, useEffect } from 'react';
import { getCommunityRecipes } from '@/app/actions/recipes';
import { getLeaderboard, getDishOfTheWeek, type UserRankingData } from '@/app/actions/ranking';
import { Star, User, Trophy, Heart, ChefHat, Users, Crown, Medal, Camera, Award, ArrowLeft, Plus, Link2 } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { BottomNav } from '@/components/ui/BottomNav';
import { RecipeRatingModal } from '@/components/features/community/RecipeRatingModal';

const LEVEL_BADGES: Record<number, { name: string; color: string; bgColor: string; borderColor: string }> = {
    1: { name: 'Apprenti', color: 'text-blue-700', bgColor: 'bg-blue-100', borderColor: 'border-blue-200' },
    2: { name: 'Confirmé', color: 'text-purple-700', bgColor: 'bg-purple-100', borderColor: 'border-purple-200' },
    3: { name: 'Expert', color: 'text-yellow-700', bgColor: 'bg-yellow-100', borderColor: 'border-yellow-200' },
};

const RANK_STYLES: Record<number, { bg: string; text: string; icon: any }> = {
    1: { bg: 'bg-gradient-to-br from-yellow-400 to-amber-500', text: 'text-white', icon: Crown },
    2: { bg: 'bg-gradient-to-br from-gray-300 to-gray-400', text: 'text-white', icon: Medal },
    3: { bg: 'bg-gradient-to-br from-orange-400 to-orange-500', text: 'text-white', icon: Medal },
};

export default function CommunityPage() {
    const router = useRouter();
    const [recipes, setRecipes] = useState<any[]>([]);
    const [leaderboard, setLeaderboard] = useState<UserRankingData[]>([]);
    const [dishOfTheWeek, setDishOfTheWeek] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'recipes' | 'leaderboard'>('leaderboard');
    const [ratingModalOpen, setRatingModalOpen] = useState(false);
    const [selectedRecipe, setSelectedRecipe] = useState<any>(null);

    const fetchData = async () => {
        try {
            const [recipesResult, leaderboardData, dotw] = await Promise.all([
                getCommunityRecipes(),
                getLeaderboard(10),
                getDishOfTheWeek(),
            ]);
            
            if (recipesResult.success && recipesResult.recipes) {
                setRecipes(recipesResult.recipes);
            }
            setLeaderboard(leaderboardData);
            setDishOfTheWeek(dotw);
            } catch (error) {
            console.error('Error fetching data:', error);
            } finally {
                setIsLoading(false);
            }
        };

    useEffect(() => {
        fetchData();
    }, []);

    const handleOpenRatingModal = (recipe: any) => {
        setSelectedRecipe(recipe);
        setRatingModalOpen(true);
    };

    const handleRatingSubmitted = () => {
        fetchData(); // Refresh recipes to show updated ratings
    };

    const renderLeaderboardItem = (user: UserRankingData, index: number) => {
        const rank = index + 1;
        const rankStyle = RANK_STYLES[rank] || { bg: 'bg-gray-100', text: 'text-gray-700', icon: null };
        const levelBadge = LEVEL_BADGES[user.level];
        const RankIcon = rankStyle.icon;

        return (
            <motion.div
                key={user.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`flex items-center gap-4 p-4 rounded-2xl ${
                    rank <= 3 ? 'bg-white shadow-md border border-gray-100' : 'bg-gray-50'
                } mb-3`}
            >
                {/* Rang */}
                <div className={`w-10 h-10 flex items-center justify-center rounded-xl font-bold ${
                    rank <= 3 ? rankStyle.bg + ' ' + rankStyle.text : 'bg-gray-200 text-gray-600'
                }`}>
                    {RankIcon ? <RankIcon size={20} /> : rank}
                </div>

                {/* Avatar */}
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                    {user.userName.charAt(0).toUpperCase()}
                </div>

                {/* Infos */}
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <p className="font-bold text-gray-900">{user.userName}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${levelBadge.bgColor} ${levelBadge.color} ${levelBadge.borderColor} border`}>
                            Niv. {user.level}
                        </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                        <span className="flex items-center gap-1">
                            <ChefHat size={12} />
                            {user.recipesCount} recettes
                        </span>
                        {user.recipesWithPhotos > 0 && (
                            <span className="flex items-center gap-1">
                                <Camera size={12} />
                                {user.recipesWithPhotos}
                            </span>
                        )}
                        {user.dishOfTheWeekCount > 0 && (
                            <span className="flex items-center gap-1 text-yellow-600">
                                <Award size={12} />
                                {user.dishOfTheWeekCount}×
                            </span>
                        )}
                    </div>
                </div>

                {/* Points & Note */}
                <div className="text-right">
                    <p className="font-bold text-indigo-600">{user.totalPoints} pts</p>
                    {user.averageRating > 0 && (
                        <div className="flex items-center gap-1 justify-end text-xs text-gray-500">
                            <Star size={12} className="text-yellow-500 fill-yellow-500" />
                            {user.averageRating.toFixed(1)}
                        </div>
                    )}
                </div>
            </motion.div>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 pb-32">
            {/* Header */}
            <div className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-md mx-auto px-4 py-4">
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => router.back()}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <Users size={24} className="text-indigo-600" />
                        Communauté Lym
                    </h1>
                            <p className="text-gray-500 text-xs">Classement des chefs</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-md mx-auto px-4 py-6">
                {/* Dish of the Week */}
                {dishOfTheWeek && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6"
                    >
                        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-1 shadow-lg">
                            <div className="bg-white rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <Trophy className="text-yellow-500 fill-yellow-500" size={20} />
                                    <span className="font-bold text-gray-900">Plat de la Semaine</span>
                                </div>
                                <div className="flex gap-4">
                                    {dishOfTheWeek.imageUrl && (
                                        <div className="w-20 h-20 rounded-xl overflow-hidden relative shrink-0">
                                            <Image
                                                src={dishOfTheWeek.imageUrl}
                                                alt={dishOfTheWeek.title}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <h3 className="font-bold text-gray-900">{dishOfTheWeek.title}</h3>
                                        <p className="text-sm text-gray-500 line-clamp-2">{dishOfTheWeek.description}</p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <div className="flex items-center gap-1 text-sm text-yellow-600">
                                                <Star size={14} className="fill-yellow-500" />
                                                {dishOfTheWeek.avgRating?.toFixed(1) || '-'}
                                            </div>
                                            <span className="text-gray-300">•</span>
                                            <span className="text-xs text-gray-500">
                                                par {dishOfTheWeek.creatorName || 'Chef Anonyme'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Tabs */}
                <div className="flex bg-white rounded-xl p-1 shadow-sm mb-6">
                    <button
                        onClick={() => setActiveTab('leaderboard')}
                        className={`flex-1 py-2.5 rounded-lg font-medium text-sm transition-all ${
                            activeTab === 'leaderboard'
                                ? 'bg-indigo-500 text-white shadow-md'
                                : 'text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                        <Trophy size={16} className="inline mr-2" />
                        Classement
                    </button>
                    <button
                        onClick={() => setActiveTab('recipes')}
                        className={`flex-1 py-2.5 rounded-lg font-medium text-sm transition-all ${
                            activeTab === 'recipes'
                                ? 'bg-indigo-500 text-white shadow-md'
                                : 'text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                        <ChefHat size={16} className="inline mr-2" />
                        Recettes
                    </button>
                </div>

                    {isLoading ? (
                        <div className="text-center py-12">
                        <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                        <p className="text-gray-500">Chargement...</p>
                    </div>
                ) : activeTab === 'leaderboard' ? (
                    /* Leaderboard */
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-bold text-gray-900">Top 10 des Chefs</h2>
                            <span className="text-xs text-gray-500">{leaderboard.length} participants</span>
                        </div>

                        {leaderboard.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-2xl shadow-sm">
                                <Trophy size={48} className="mx-auto text-gray-300 mb-4" />
                                <p className="text-gray-500">Aucun chef dans le classement.</p>
                                <p className="text-sm text-gray-400">Créez une recette pour apparaître ici !</p>
                            </div>
                        ) : (
                            <div>
                                {leaderboard.map((user, index) => renderLeaderboardItem(user, index))}
                            </div>
                        )}

                        {/* Points Explanation */}
                        <div className="mt-6 bg-white rounded-2xl p-5 shadow-sm">
                            <h3 className="font-bold text-gray-900 mb-3">Comment gagner des points ?</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Créer une recette</span>
                                    <span className="font-bold text-indigo-600">+50 pts</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Ajouter une photo</span>
                                    <span className="font-bold text-indigo-600">+20 pts</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Recevoir une note</span>
                                    <span className="font-bold text-indigo-600">+10 pts</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Note ≥ 4 étoiles</span>
                                    <span className="font-bold text-indigo-600">+15 pts</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Plat de la semaine</span>
                                    <span className="font-bold text-yellow-600">+100 pts</span>
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <h4 className="font-medium text-gray-900 mb-2">Niveaux</h4>
                                <div className="space-y-1 text-sm">
                                    <div className="flex items-center gap-2">
                                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">Niv. 1</span>
                                        <span className="text-gray-500">0 - 299 pts</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">Niv. 2</span>
                                        <span className="text-gray-500">300 - 999 pts</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded text-xs">Niv. 3</span>
                                        <span className="text-gray-500">1000+ pts</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Recipes Feed */
                    <div className="space-y-4">
                        {recipes.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-2xl shadow-sm">
                            <ChefHat size={48} className="mx-auto text-gray-300 mb-4" />
                            <p className="text-gray-500">Aucune recette communautaire pour le moment.</p>
                            <p className="text-sm text-gray-400">Soyez le premier à partager !</p>
                        </div>
                    ) : (
                        recipes.map((recipe) => (
                                <motion.div 
                                    key={recipe.id} 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                                >
                                {/* Header */}
                                <div className="p-4 flex items-center justify-between border-b border-gray-50">
                                    <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                                                {(recipe.creatorName || 'U').charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                                <p className="font-medium text-gray-900">{recipe.creatorName || 'Chef Anonyme'}</p>
                                                <p className="text-xs text-gray-500">{new Date(recipe.createdAt).toLocaleDateString('fr-FR')}</p>
                                            </div>
                                    </div>
                                    <button className="text-gray-400 hover:text-red-500 transition-colors">
                                        <Heart size={20} />
                                    </button>
                                </div>

                                {/* Image */}
                                {recipe.imageUrl && (
                                        <div className="relative w-full h-48">
                                        <Image
                                            src={recipe.imageUrl}
                                            alt={recipe.title}
                                            fill
                                            className="object-cover"
                                        />
                                            {recipe.isDishOfTheWeek && (
                                                <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
                                                    <Trophy size={12} />
                                                    Plat de la semaine
                                                </div>
                                            )}
                                    </div>
                                )}

                                    {/* Content */}
                                    <div className="p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <h2 className="text-lg font-bold text-gray-900">{recipe.title}</h2>
                                            <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg">
                                                <Star size={14} className="text-yellow-500 fill-yellow-500" />
                                                <span className="font-bold text-yellow-700 text-sm">
                                                    {recipe.avgRating ? recipe.avgRating.toFixed(1) : '-'}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    ({recipe.ratingsCount || 0})
                                                </span>
                                            </div>
                                        </div>

                                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{recipe.description}</p>

                                        {/* Stats */}
                                        <div className="flex gap-4 text-sm text-gray-500 mb-3">
                                            <span>{recipe.calories} kcal</span>
                                            <span>{recipe.prepTime} min</span>
                                            <span>
                                                {recipe.ingredients ? JSON.parse(recipe.ingredients).length : 0} ingr.
                                            </span>
                                        </div>

                                        {/* Action Button */}
                                        <button
                                            onClick={() => handleOpenRatingModal(recipe)}
                                            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-all"
                                        >
                                            <Star size={16} />
                                            Noter cette recette
                                        </button>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* Floating Share Button */}
            <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/recipes/share')}
                className="fixed bottom-24 right-6 w-14 h-14 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-full shadow-xl flex items-center justify-center z-40 hover:shadow-2xl transition-shadow"
            >
                <Link2 size={24} />
            </motion.button>

            {/* Rating Modal */}
            {selectedRecipe && (
                <RecipeRatingModal
                    isOpen={ratingModalOpen}
                    onClose={() => {
                        setRatingModalOpen(false);
                        setSelectedRecipe(null);
                    }}
                    recipeId={selectedRecipe.id}
                    recipeTitle={selectedRecipe.title}
                    creatorId={selectedRecipe.creatorId}
                    onRated={handleRatingSubmitted}
                />
            )}

            <BottomNav />
        </div>
    );
}
