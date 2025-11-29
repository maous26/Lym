"use client";

import { motion } from 'framer-motion';
import { ChefHat, Clock, Utensils } from 'lucide-react';

interface MealSuggestion {
    id: string;
    name: string;
    time: string;
    calories: number;
    prepTime: number;
    image: string;
}

const mockMeals: MealSuggestion[] = [
    {
        id: '1',
        name: 'Bowl Quinoa & Avocat',
        time: 'Déjeuner',
        calories: 450,
        prepTime: 15,
        image: '🥗',
    },
    {
        id: '2',
        name: 'Saumon Grillé & Légumes',
        time: 'Dîner',
        calories: 520,
        prepTime: 25,
        image: '🐟',
    },
    {
        id: '3',
        name: 'Smoothie Protéiné',
        time: 'Petit-déjeuner',
        calories: 280,
        prepTime: 5,
        image: '🥤',
    },
];

export const MealSuggestions = () => {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <ChefHat className="h-5 w-5 text-primary-600" />
                    Repas Suggérés
                </h3>
                <button className="text-sm text-primary-600 font-medium hover:text-primary-700">
                    Voir tout
                </button>
            </div>

            <div className="space-y-3">
                {mockMeals.map((meal, index) => (
                    <motion.div
                        key={meal.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="glass rounded-2xl p-4 flex items-center gap-4 hover:scale-[1.02] transition-transform cursor-pointer"
                    >
                        <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center text-3xl shrink-0">
                            {meal.image}
                        </div>

                        <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 truncate">{meal.name}</h4>
                            <p className="text-xs text-gray-500 mb-2">{meal.time}</p>

                            <div className="flex gap-3 text-xs text-gray-600">
                                <span className="flex items-center gap-1">
                                    <Utensils className="h-3 w-3" />
                                    {meal.calories} kcal
                                </span>
                                <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {meal.prepTime} min
                                </span>
                            </div>
                        </div>

                        <button className="h-10 w-10 rounded-full bg-primary-600 text-white flex items-center justify-center hover:bg-primary-700 transition-colors shrink-0">
                            +
                        </button>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};
