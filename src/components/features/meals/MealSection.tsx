"use client";

import { useMealStore } from '@/store/meal-store';
import { MealType } from '@/types/meal';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2 } from 'lucide-react';
import { formatQuantity } from '@/lib/unit-utils';
import { useRouter } from 'next/navigation';

const mealTypeConfig = {
    breakfast: { label: 'Petit-déjeuner', emoji: '🌅', color: 'from-yellow-400 to-orange-400' },
    lunch: { label: 'Déjeuner', emoji: '☀️', color: 'from-orange-400 to-red-400' },
    snack: { label: 'Collation', emoji: '🍎', color: 'from-green-400 to-emerald-400' },
    dinner: { label: 'Dîner', emoji: '🌙', color: 'from-blue-400 to-purple-400' },
};

interface MealSectionProps {
    mealType: MealType;
}

export const MealSection = ({ mealType }: MealSectionProps) => {
    const router = useRouter();
    const { selectedDate, getMealsByDateAndType, removeMeal } = useMealStore();
    const meals = getMealsByDateAndType(selectedDate, mealType);
    const config = mealTypeConfig[mealType];

    const totalCalories = meals.reduce((sum, meal) => {
        return sum + (meal.product.calories * meal.equivalentGrams) / 100;
    }, 0);

    const totalProteins = meals.reduce((sum, meal) => {
        return sum + (meal.product.proteins * meal.equivalentGrams) / 100;
    }, 0);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-4 mb-4"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${config.color} flex items-center justify-center text-2xl`}>
                        {config.emoji}
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">{config.label}</h3>
                        {meals.length > 0 && (
                            <p className="text-xs text-gray-500">
                                {Math.round(totalCalories)} kcal • {Math.round(totalProteins)}g protéines
                            </p>
                        )}
                    </div>
                </div>

                <button
                    onClick={() => router.push(`/meals/add?type=${mealType}&date=${selectedDate}`)}
                    className="h-10 w-10 rounded-full bg-primary-600 text-white flex items-center justify-center hover:bg-primary-700 transition-colors"
                >
                    <Plus className="h-5 w-5" />
                </button>
            </div>

            {/* Meal Items */}
            <AnimatePresence mode="popLayout">
                {meals.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-center py-6 text-gray-400 text-sm"
                    >
                        Aucun aliment ajouté
                    </motion.div>
                ) : (
                    <div className="space-y-2">
                        {meals.map((meal) => {
                            const itemCalories = (meal.product.calories * meal.equivalentGrams) / 100;

                            return (
                                <motion.div
                                    key={meal.id}
                                    layout
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="bg-white/50 rounded-xl p-3 flex items-center gap-3"
                                >
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-gray-900 text-sm truncate">
                                            {meal.product.name}
                                        </h4>
                                        <p className="text-xs text-gray-500">
                                            {formatQuantity(meal.quantity, meal.unit)} • {Math.round(itemCalories)} kcal
                                        </p>
                                    </div>

                                    <button
                                        onClick={() => removeMeal(meal.id)}
                                        className="h-8 w-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100 transition-colors shrink-0"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};
