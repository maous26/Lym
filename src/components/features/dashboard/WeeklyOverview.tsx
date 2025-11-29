"use client";

import { useMealStore } from '@/store/meal-store';
import { useOnboardingStore } from '@/store/onboarding-store';
import { calculateNutritionGoals } from '@/lib/nutrition-calculator';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export const WeeklyOverview = () => {
    const { getDailyNutrition } = useMealStore();
    const { profile } = useOnboardingStore();
    const goals = calculateNutritionGoals(profile);

    // Calculate last 7 days
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        const dateStr = date.toISOString().split('T')[0];
        const nutrition = getDailyNutrition(dateStr, goals);

        return {
            date: dateStr,
            day: date.toLocaleDateString('fr-FR', { weekday: 'short' }),
            calories: Math.round(nutrition.calories),
            target: goals.calories,
        };
    });

    const weeklyAverage = Math.round(
        last7Days.reduce((sum, day) => sum + day.calories, 0) / 7
    );

    const weeklyTotal = last7Days.reduce((sum, day) => sum + day.calories, 0);
    const targetTotal = goals.calories * 7;
    const difference = weeklyTotal - targetTotal;
    const percentageDiff = ((difference / targetTotal) * 100).toFixed(1);

    const getTrend = () => {
        if (Math.abs(difference) < targetTotal * 0.05) {
            return { icon: Minus, color: 'text-green-600', bg: 'bg-green-50', label: 'Stable' };
        }
        if (difference > 0) {
            return { icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-50', label: 'Au-dessus' };
        }
        return { icon: TrendingDown, color: 'text-blue-600', bg: 'bg-blue-50', label: 'En-dessous' };
    };

    const trend = getTrend();
    const TrendIcon = trend.icon;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-3xl p-6 mb-6"
        >
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-bold text-gray-900">Cette semaine</h3>
                    <p className="text-sm text-gray-500">Moyenne quotidienne</p>
                </div>
                <div className={`${trend.bg} ${trend.color} px-3 py-1.5 rounded-full flex items-center gap-1.5`}>
                    <TrendIcon className="h-4 w-4" />
                    <span className="text-sm font-semibold">{percentageDiff}%</span>
                </div>
            </div>

            {/* Average Display */}
            <div className="mb-6">
                <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-4xl font-bold text-gray-900">{weeklyAverage}</span>
                    <span className="text-lg text-gray-500">kcal/jour</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((weeklyAverage / goals.calories) * 100, 100)}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className={`h-full rounded-full ${weeklyAverage > goals.calories * 1.1
                                ? 'bg-gradient-to-r from-orange-400 to-red-500'
                                : weeklyAverage < goals.calories * 0.9
                                    ? 'bg-gradient-to-r from-blue-400 to-blue-600'
                                    : 'bg-gradient-to-r from-green-400 to-emerald-500'
                            }`}
                    />
                </div>
                <p className="text-xs text-gray-500 mt-1">Objectif : {goals.calories} kcal/jour</p>
            </div>

            {/* Weekly Chart */}
            <div className="flex items-end justify-between gap-1.5 h-24">
                {last7Days.map((day, index) => {
                    const percentage = (day.calories / day.target) * 100;
                    const isToday = day.date === new Date().toISOString().split('T')[0];

                    return (
                        <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                            <div className="relative w-full flex-1 flex items-end">
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: `${Math.min(percentage, 100)}%` }}
                                    transition={{ delay: 0.1 + index * 0.05, duration: 0.5 }}
                                    className={`w-full rounded-t-md ${isToday
                                            ? 'bg-gradient-to-t from-primary-500 to-primary-600 ring-2 ring-primary-300'
                                            : percentage > 110
                                                ? 'bg-gradient-to-t from-orange-300 to-orange-400'
                                                : percentage < 90
                                                    ? 'bg-gradient-to-t from-blue-300 to-blue-400'
                                                    : 'bg-gradient-to-t from-gray-200 to-gray-300'
                                        }`}
                                />
                            </div>
                            <p className={`text-xs font-medium ${isToday ? 'text-primary-700' : 'text-gray-500'}`}>
                                {day.day}
                            </p>
                        </div>
                    );
                })}
            </div>
        </motion.div>
    );
};
