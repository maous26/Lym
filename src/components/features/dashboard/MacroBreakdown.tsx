"use client";

import { useMealStore } from '@/store/meal-store';
import { useOnboardingStore } from '@/store/onboarding-store';
import { calculateNutritionGoals } from '@/lib/nutrition-calculator';
import { motion } from 'framer-motion';
import { Apple, Drumstick, Wheat, Droplets } from 'lucide-react';

export const MacroBreakdown = () => {
    const { getDailyNutrition } = useMealStore();
    const { profile } = useOnboardingStore();
    const goals = calculateNutritionGoals(profile);

    // Calculate weekly average
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        const dateStr = date.toISOString().split('T')[0];
        return getDailyNutrition(dateStr, goals);
    });

    const avgProteins = Math.round(last7Days.reduce((sum, day) => sum + day.proteins, 0) / 7);
    const avgCarbs = Math.round(last7Days.reduce((sum, day) => sum + day.carbs, 0) / 7);
    const avgFats = Math.round(last7Days.reduce((sum, day) => sum + day.fats, 0) / 7);

    const macros = [
        {
            icon: Drumstick,
            label: 'Protéines',
            value: avgProteins,
            target: goals.proteins,
            unit: 'g',
            color: 'from-blue-400 to-blue-600',
            bgColor: 'bg-blue-50',
        },
        {
            icon: Wheat,
            label: 'Glucides',
            value: avgCarbs,
            target: goals.carbs,
            unit: 'g',
            color: 'from-green-400 to-green-600',
            bgColor: 'bg-green-50',
        },
        {
            icon: Droplets,
            label: 'Lipides',
            value: avgFats,
            target: goals.fats,
            unit: 'g',
            color: 'from-yellow-400 to-yellow-600',
            bgColor: 'bg-yellow-50',
        },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass rounded-3xl p-6 mb-6"
        >
            <h3 className="text-lg font-bold text-gray-900 mb-4">Répartition Macros (7j)</h3>

            <div className="space-y-4">
                {macros.map((macro, index) => {
                    const Icon = macro.icon;
                    const percentage = (macro.value / macro.target) * 100;

                    return (
                        <motion.div
                            key={macro.label}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 + index * 0.1 }}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <div className={`h-8 w-8 rounded-lg bg-gradient-to-br ${macro.color} flex items-center justify-center`}>
                                        <Icon className="h-4 w-4 text-white" />
                                    </div>
                                    <span className="font-semibold text-gray-900">{macro.label}</span>
                                </div>
                                <div className="text-right">
                                    <span className="font-bold text-gray-900">{macro.value}</span>
                                    <span className="text-sm text-gray-500">/{macro.target}{macro.unit}</span>
                                </div>
                            </div>

                            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min(percentage, 100)}%` }}
                                    transition={{ duration: 0.8, delay: 0.5 + index * 0.1 }}
                                    className={`h-full bg-gradient-to-r ${macro.color} rounded-full`}
                                />
                            </div>

                            <p className="text-xs text-gray-500 mt-1">
                                {percentage > 100
                                    ? `+${Math.round(percentage - 100)}% au-dessus`
                                    : percentage < 80
                                        ? `${Math.round(100 - percentage)}% en-dessous`
                                        : 'Dans la cible ✓'}
                            </p>
                        </motion.div>
                    );
                })}
            </div>
        </motion.div>
    );
};
