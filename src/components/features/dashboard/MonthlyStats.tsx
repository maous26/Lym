"use client";

import { useMealStore } from '@/store/meal-store';
import { useOnboardingStore } from '@/store/onboarding-store';
import { calculateNutritionGoals } from '@/lib/nutrition-calculator';
import { motion } from 'framer-motion';
import { Calendar, Flame, TrendingUp } from 'lucide-react';

export const MonthlyStats = () => {
    const { getDailyNutrition } = useMealStore();
    const { profile } = useOnboardingStore();
    const goals = calculateNutritionGoals(profile);

    // Calculate last 30 days
    const last30Days = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (29 - i));
        const dateStr = date.toISOString().split('T')[0];
        const nutrition = getDailyNutrition(dateStr, goals);

        return {
            date: dateStr,
            calories: Math.round(nutrition.calories),
            proteins: Math.round(nutrition.proteins),
        };
    });

    const monthlyTotal = last30Days.reduce((sum, day) => sum + day.calories, 0);
    const monthlyAverage = Math.round(monthlyTotal / 30);
    const daysTracked = last30Days.filter(day => day.calories > 0).length;
    const trackingRate = Math.round((daysTracked / 30) * 100);

    const totalProteins = last30Days.reduce((sum, day) => sum + day.proteins, 0);
    const avgProteins = Math.round(totalProteins / 30);

    const stats = [
        {
            icon: Flame,
            label: 'Moyenne/jour',
            value: monthlyAverage,
            unit: 'kcal',
            color: 'from-orange-400 to-red-500',
            bgColor: 'bg-orange-50',
        },
        {
            icon: Calendar,
            label: 'Jours suivis',
            value: daysTracked,
            unit: '/30',
            color: 'from-green-400 to-emerald-500',
            bgColor: 'bg-green-50',
        },
        {
            icon: TrendingUp,
            label: 'Protéines moy.',
            value: avgProteins,
            unit: 'g/j',
            color: 'from-blue-400 to-blue-600',
            bgColor: 'bg-blue-50',
        },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass rounded-3xl p-6 mb-6"
        >
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-bold text-gray-900">Ce mois-ci</h3>
                    <p className="text-sm text-gray-500">30 derniers jours</p>
                </div>
                <div className="bg-primary-100 text-primary-700 px-3 py-1.5 rounded-full">
                    <span className="text-sm font-semibold">{trackingRate}% suivi</span>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 + index * 0.1 }}
                            className={`${stat.bgColor} rounded-2xl p-4 text-center`}
                        >
                            <div className={`inline-flex h-10 w-10 rounded-full bg-gradient-to-br ${stat.color} items-center justify-center mb-2`}>
                                <Icon className="h-5 w-5 text-white" />
                            </div>
                            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                            <p className="text-xs text-gray-500 mb-1">{stat.unit}</p>
                            <p className="text-xs text-gray-600 font-medium">{stat.label}</p>
                        </motion.div>
                    );
                })}
            </div>
        </motion.div>
    );
};
