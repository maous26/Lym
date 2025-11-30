'use client';

import { useState, useEffect } from 'react';
import { getCommunityRecipes } from '@/app/actions/recipes';
import { Star, User, Trophy, Heart, ChefHat, Users } from 'lucide-react';
import Image from 'next/image';

export default function CommunityPage() {
    const [recipes, setRecipes] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchRecipes = async () => {
            try {
                const result = await getCommunityRecipes();
                if (result.success && result.recipes) {
                    setRecipes(result.recipes);
                }
            } catch (error) {
                console.error('Error fetching recipes:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRecipes();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Users size={28} className="text-blue-600" />
                        Communauté Lym
                    </h1>
                    <p className="text-gray-500 text-sm">Découvrez les créations de la communauté</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Feed */}
                <div className="lg:col-span-2 space-y-6">
                    {isLoading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                            <p className="text-gray-500">Chargement des recettes...</p>
                        </div>
                    ) : recipes.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-2xl shadow-sm">
                            <ChefHat size={48} className="mx-auto text-gray-300 mb-4" />
                            <p className="text-gray-500">Aucune recette communautaire pour le moment.</p>
                            <p className="text-sm text-gray-400">Soyez le premier à partager !</p>
                        </div>
                    ) : (
                        recipes.map((recipe) => (
                            <div key={recipe.id} className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                                {/* Header */}
                                <div className="p-4 flex items-center justify-between border-b border-gray-50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                                            {recipe.userId ? recipe.userId[0].toUpperCase() : 'U'}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">Utilisateur {recipe.userId || 'Anonyme'}</p>
                                            <p className="text-xs text-gray-500">{new Date(recipe.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <button className="text-gray-400 hover:text-red-500 transition-colors">
                                        <Heart size={20} />
                                    </button>
                                </div>

                                {/* Image */}
                                {recipe.imageUrl && (
                                    <div className="relative w-full h-64">
                                        <Image
                                            src={recipe.imageUrl}
                                            alt={recipe.title}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                )}

                                {/* Content */}
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-2">
                                        <h2 className="text-xl font-bold text-gray-900">{recipe.title}</h2>
                                        <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg">
                                            <Star size={16} className="text-yellow-500 fill-yellow-500" />
                                            <span className="font-bold text-yellow-700">{recipe.avgRating ? recipe.avgRating.toFixed(1) : 'N/A'}</span>
                                        </div>
                                    </div>

                                    <p className="text-gray-600 mb-4 line-clamp-2">{recipe.description}</p>

                                    {/* Stats */}
                                    <div className="grid grid-cols-3 gap-4 mb-4 text-center text-sm">
                                        <div className="bg-gray-50 p-2 rounded-lg">
                                            <span className="block font-bold text-gray-900">{recipe.calories}</span>
                                            <span className="text-gray-500">kcal</span>
                                        </div>
                                        <div className="bg-gray-50 p-2 rounded-lg">
                                            <span className="block font-bold text-gray-900">{recipe.prepTime}</span>
                                            <span className="text-gray-500">min</span>
                                        </div>
                                        <div className="bg-gray-50 p-2 rounded-lg">
                                            <span className="block font-bold text-gray-900">{recipe.ingredients ? JSON.parse(recipe.ingredients).length : 0}</span>
                                            <span className="text-gray-500">ingr.</span>
                                        </div>
                                    </div>

                                    <button className="w-full py-2 border border-blue-600 text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors">
                                        Voir la recette
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Sidebar - Leaderboard */}
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
                        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Trophy className="text-yellow-500" />
                            Top Chefs
                        </h2>

                        <div className="space-y-4">
                            {[1, 2, 3].map((rank) => (
                                <div key={rank} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
                                    <div className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-white
                                        ${rank === 1 ? 'bg-yellow-400' : rank === 2 ? 'bg-gray-400' : 'bg-orange-400'}
                                    `}>
                                        {rank}
                                    </div>
                                    <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden">
                                        {/* Avatar placeholder */}
                                        <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500"></div>
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900">Chef {rank}</p>
                                        <p className="text-xs text-gray-500">{100 - rank * 15} recettes partagées</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 pt-6 border-t border-gray-100">
                            <h3 className="font-medium text-gray-900 mb-3">Tendances</h3>
                            <div className="flex flex-wrap gap-2">
                                {['#Végétarien', '#Rapide', '#Protéiné', '#Dessert', '#SansGluten'].map(tag => (
                                    <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full hover:bg-gray-200 cursor-pointer">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
