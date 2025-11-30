'use client';

import { useRouter } from 'next/navigation';
import { Users, Trophy, Plus, ArrowRight, ChefHat, Star, Flame } from 'lucide-react';
import { motion } from 'framer-motion';

export function CommunityWidget() {
    const router = useRouter();

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
        >
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-1 shadow-xl relative overflow-hidden">
                <div className="bg-white rounded-[22px] p-5 relative z-10">
                    {/* Header with Gamification Status */}
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h3 className="font-bold text-xl text-gray-900 flex items-center gap-2">
                                <Trophy className="text-yellow-500 fill-yellow-500" size={24} />
                                Défi Chef Lym
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">Niveau 3 • Expert Culinaire</p>
                        </div>
                        <div className="bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                            <div className="flex items-center gap-1">
                                <Star size={14} className="text-yellow-500 fill-yellow-500" />
                                <span className="font-bold text-indigo-700 text-sm">1,250 pts</span>
                            </div>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-6">
                        <div className="flex justify-between text-xs mb-2">
                            <span className="font-medium text-gray-600">Prochain badge: Master Chef</span>
                            <span className="text-indigo-600 font-bold">75%</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 w-3/4 rounded-full"></div>
                        </div>
                    </div>

                    {/* Main Actions */}
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => router.push('/recipes/create')}
                            className="flex flex-col items-center justify-center p-4 bg-indigo-50 rounded-2xl border-2 border-indigo-100 hover:border-indigo-300 hover:bg-indigo-100 transition-all group"
                        >
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-3 shadow-sm group-hover:scale-110 transition-transform text-indigo-600">
                                <Plus size={24} strokeWidth={3} />
                            </div>
                            <span className="font-bold text-indigo-900">Créer Recette</span>
                            <span className="text-xs text-indigo-600 mt-1">+50 pts</span>
                        </button>

                        <button
                            onClick={() => router.push('/community')}
                            className="flex flex-col items-center justify-center p-4 bg-purple-50 rounded-2xl border-2 border-purple-100 hover:border-purple-300 hover:bg-purple-100 transition-all group"
                        >
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-3 shadow-sm group-hover:scale-110 transition-transform text-purple-600">
                                <Users size={24} strokeWidth={3} />
                            </div>
                            <span className="font-bold text-purple-900">Communauté</span>
                            <span className="text-xs text-purple-600 mt-1">Voir le classement</span>
                        </button>
                    </div>

                    {/* Active Challenge Banner */}
                    <div className="mt-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-3 text-white flex items-center justify-between shadow-md cursor-pointer hover:shadow-lg transition-shadow">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                                <Flame size={20} className="text-white fill-white" />
                            </div>
                            <div>
                                <p className="font-bold text-sm">Défi Hebdo: Zéro Déchet</p>
                                <p className="text-xs text-orange-100">Partagez votre astuce !</p>
                            </div>
                        </div>
                        <ArrowRight size={18} className="text-white/80" />
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
