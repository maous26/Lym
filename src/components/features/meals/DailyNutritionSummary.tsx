"use client";

import { useMealStore } from '@/store/meal-store';
import { useOnboardingStore } from '@/store/onboarding-store';
import { calculateNutritionGoals } from '@/lib/nutrition-calculator';
import { motion } from 'framer-motion';
import { Flame, Activity, Wheat, Droplets } from 'lucide-react';

export const DailyNutritionSummary = () => {
    const { selectedDate, getDailyNutrition } = useMealStore();
    const { profile } = useOnboardingStore();

    const goals = calculateNutritionGoals(profile);
    const nutrition = getDailyNutrition(selectedDate, goals);

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
