"use client";

import { useMealStore } from '@/store/meal-store';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Flame, Activity, Wheat, Droplets } from 'lucide-react'; // Re-adding these imports as they are used later

export function DailyNutritionSummary() {
    const [mounted, setMounted] = useState(false);
    const { selectedDate, getDailyNutrition } = useMealStore();

    // Default targets - TODO: Get from user profile
    const targets = {
        calories: 2000,
        proteins: 150,
        carbs: 250,
        fats: 70,
    };

    const nutrition = getDailyNutrition(selectedDate, targets);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass rounded-3xl p-6 mb-6 shadow-lg"
            >
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <p className="text-sm text-gray-500 mb-1">Calories consommées</p>
                        <p className="text-4xl font-bold text-gray-900">
                            0
                            <span className="text-lg text-gray-400 ml-2">/ {targets.calories}</span>
                        </p>
                    </div>
                    <div className="relative w-24 h-24">
                        <svg className="transform -rotate-90 w-24 h-24">
                            <circle
                                cx="48"
                                cy="48"
                                r="40"
                                stroke="currentColor"
                                strokeWidth="8"
                                fill="transparent"
                                className="text-gray-200"
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xl font-bold text-gray-900">0%</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-xl">
                        <p className="text-xs text-blue-600 mb-1">Protéines</p>
                        <p className="text-lg font-bold text-blue-700">0g</p>
                        <p className="text-xs text-blue-400">/ {targets.proteins}g</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-xl">
                        <p className="text-xs text-green-600 mb-1">Glucides</p>
                        <p className="text-lg font-bold text-green-700">0g</p>
                        <p className="text-xs text-green-400">/ {targets.carbs}g</p>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded-xl">
                        <p className="text-xs text-yellow-600 mb-1">Lipides</p>
                        <p className="text-lg font-bold text-yellow-700">0g</p>
                        <p className="text-xs text-yellow-400">/ {targets.fats}g</p>
                    </div>
                </div>
            </motion.div>
        );
    }

    const macros = [
        {
            icon: Flame,
            label: 'Calories',
            value: Math.round(nutrition.calories),
            target: nutrition.targetCalories,
            unit: 'kcal',
            color: 'from-orange-400 to-red-500',
            bgColor: 'bg-orange-50',
        },
        {
            icon: Activity,
            label: 'Protéines',
            value: Math.round(nutrition.proteins),
            target: nutrition.targetProteins,
            unit: 'g',
            color: 'from-blue-400 to-blue-600',
            bgColor: 'bg-blue-50',
        },
        {
            icon: Wheat,
            label: 'Glucides',
            value: Math.round(nutrition.carbs),
            target: nutrition.targetCarbs,
            unit: 'g',
            color: 'from-green-400 to-green-600',
            bgColor: 'bg-green-50',
        },
        {
            icon: Droplets,
            label: 'Lipides',
            value: Math.round(nutrition.fats),
            target: nutrition.targetFats,
            unit: 'g',
            color: 'from-yellow-400 to-yellow-600',
            bgColor: 'bg-yellow-50',
        },
    ];

    return (
        <div className="space-y-4 mb-6">
            {/* Main Calories Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass rounded-3xl p-6"
            >
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <p className="text-sm text-gray-500 mb-1">Calories consommées</p>
                        <p className="text-4xl font-bold text-gray-900">
                            {Math.round(nutrition.calories || 0)}
                            <span className="text-lg text-gray-400 ml-2">/ {nutrition.targetCalories}</span>
                        </p>
                    </div>
                    <div className="h-20 w-20 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                        <Flame className="h-10 w-10 text-white" />
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(((nutrition.calories || 0) / nutrition.targetCalories) * 100, 100)}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className={`h-full rounded-full ${nutrition.calories > nutrition.targetCalories
                            ? 'bg-gradient-to-r from-red-400 to-red-600'
                            : 'bg-gradient-to-r from-orange-400 to-red-500'
                            }`}
                    />
                </div>

                <p className="text-xs text-gray-500 mt-2 text-center">
                    {nutrition.calories > nutrition.targetCalories
                        ? `+${Math.round((nutrition.calories || 0) - nutrition.targetCalories)} kcal au-dessus de l'objectif`
                        : `${Math.round(nutrition.targetCalories - (nutrition.calories || 0))} kcal restantes`}
                </p>
            </motion.div>

            {/* Macros Grid */}
            <div className="grid grid-cols-3 gap-3">
                {macros.slice(1).map((macro, index) => {
                    const Icon = macro.icon;
                    const percentage = (macro.value / macro.target) * 100;
                    const safeValue = isNaN(macro.value) ? 0 : Math.round(macro.value);
                    const safePercentage = isNaN(percentage) ? 0 : Math.min(percentage, 100);

                    return (
                        <motion.div
                            key={macro.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`${macro.bgColor} rounded-2xl p-4`}
                        >
                            <div className={`inline-flex h-10 w-10 rounded-full bg-gradient-to-br ${macro.color} items-center justify-center mb-2`}>
                                <Icon className="h-5 w-5 text-white" />
                            </div>
                            <p className="text-xl font-bold text-gray-900">{safeValue}</p>
                            <p className="text-xs text-gray-500 mb-2">/ {macro.target}{macro.unit}</p>

                            {/* Mini Progress */}
                            <div className="h-1.5 bg-white rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${safePercentage}%` }}
                                    transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                                    className={`h-full bg-gradient-to-r ${macro.color}`}
                                />
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};
