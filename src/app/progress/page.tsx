'use client';

import { useState, useMemo } from 'react';
import { BottomNav } from '@/components/ui/BottomNav';
import { motion } from 'framer-motion';
import { TrendingDown, Flame, Award, Calendar } from 'lucide-react';
import { useUserStore, useSoloProfile } from '@/store/user-store';
import { useMealStore } from '@/store/meal-store';
import {
    PeriodSelector,
    MacroBalanceWidget,
    CoachInsightsWidget,
    NutritionTrendChart,
    type Period,
} from '@/components/features/progress';

export default function ProgressPage() {
    const [period, setPeriod] = useState<Period>('week');
    const profile = useSoloProfile();
    const { soloNutritionalNeeds } = useUserStore();
    const { meals } = useMealStore();

    // Calculate targets from profile
    const targets = useMemo(() => ({
        calories: soloNutritionalNeeds?.calories || profile?.nutritionalNeeds?.calories || 2000,
        proteins: soloNutritionalNeeds?.proteins || profile?.nutritionalNeeds?.proteins || 150,
        carbs: soloNutritionalNeeds?.carbs || profile?.nutritionalNeeds?.carbs || 250,
        fats: soloNutritionalNeeds?.fats || profile?.nutritionalNeeds?.fats || 65,
    }), [soloNutritionalNeeds, profile]);

    // Get date range based on period
    const getDateRange = (p: Period): Date[] => {
        const dates: Date[] = [];
        const today = new Date();
        let daysBack = 0;

        switch (p) {
            case 'day':
                daysBack = 1;
                break;
            case 'week':
                daysBack = 7;
                break;
            case 'month':
                daysBack = 30;
                break;
        }

        for (let i = daysBack - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            dates.push(date);
        }

        return dates;
    };

    // Calculate data for the selected period
    const periodData = useMemo(() => {
        const dates = getDateRange(period);
        let totalCalories = 0;
        let totalProteins = 0;
        let totalCarbs = 0;
        let totalFats = 0;
        let daysWithData = 0;

        const chartData = dates.map((date) => {
            const dateStr = date.toISOString().split('T')[0];
            const dayMeals = meals[dateStr];
            const dayCalories = dayMeals?.totalNutrition?.calories || 0;
            const dayProteins = dayMeals?.totalNutrition?.proteins || 0;
            const dayCarbs = dayMeals?.totalNutrition?.carbs || 0;
            const dayFats = dayMeals?.totalNutrition?.fats || 0;

            if (dayCalories > 0) {
                totalCalories += dayCalories;
                totalProteins += dayProteins;
                totalCarbs += dayCarbs;
                totalFats += dayFats;
                daysWithData++;
            }

            // Format label based on period
            let label = '';
            if (period === 'day') {
                label = 'Auj.';
            } else if (period === 'week') {
                label = date.toLocaleDateString('fr-FR', { weekday: 'short' });
            } else {
                // For month, show day number, but only for every 5th day to avoid clutter
                const dayNum = date.getDate();
                label = dayNum % 5 === 0 || dayNum === 1 ? `${dayNum}` : '';
            }

            return {
                label,
                calories: Math.round(dayCalories),
                proteins: Math.round(dayProteins),
                carbs: Math.round(dayCarbs),
                fats: Math.round(dayFats),
                target: targets.calories,
            };
        });

        // For day period, show daily values; for week/month, show totals
        const multiplier = period === 'day' ? 1 : daysWithData > 0 ? daysWithData : 1;
        const targetMultiplier = period === 'day' ? 1 : dates.length;

        return {
            chartData,
            macroData: {
                calories: {
                    consumed: Math.round(totalCalories),
                    target: targets.calories * targetMultiplier,
                },
                proteins: {
                    consumed: Math.round(totalProteins),
                    target: targets.proteins * targetMultiplier,
                },
                carbs: {
                    consumed: Math.round(totalCarbs),
                    target: targets.carbs * targetMultiplier,
                },
                fats: {
                    consumed: Math.round(totalFats),
                    target: targets.fats * targetMultiplier,
                },
            },
            daysWithData,
        };
    }, [period, meals, targets]);

    // Calculate streak (consecutive days with logged meals)
    const streak = useMemo(() => {
        let count = 0;
        for (let i = 0; i < 30; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const dayMeals = meals[dateStr];
            const hasMeals = dayMeals && (dayMeals.breakfast || dayMeals.lunch || dayMeals.snack || dayMeals.dinner);
            if (hasMeals) {
                count++;
            } else if (i > 0) {
                break;
            }
        }
        return count;
    }, [meals]);

    // Total meals logged
    const totalMeals = useMemo(() => {
        return Object.values(meals).reduce((count, dayMeals) => {
            let dayCount = 0;
            if (dayMeals?.breakfast) dayCount++;
            if (dayMeals?.lunch) dayCount++;
            if (dayMeals?.snack) dayCount++;
            if (dayMeals?.dinner) dayCount++;
            return count + dayCount;
        }, 0);
    }, [meals]);

    // Weight progress
    const weightProgress = profile?.weight && profile?.targetWeight
        ? Math.abs(profile.weight - profile.targetWeight)
        : 0;

    const stats = [
        {
            icon: TrendingDown,
            label: 'Objectif poids',
            value: weightProgress.toFixed(1),
            unit: 'kg',
            color: 'from-green-400 to-emerald-500',
            bgColor: 'bg-green-50',
        },
        {
            icon: Flame,
            label: 'Serie',
            value: streak.toString(),
            unit: 'jours',
            color: 'from-orange-400 to-red-500',
            bgColor: 'bg-orange-50',
        },
        {
            icon: Award,
            label: 'Repas',
            value: totalMeals.toString(),
            unit: 'total',
            color: 'from-blue-400 to-purple-500',
            bgColor: 'bg-blue-50',
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 pb-32">
            <div className="container mx-auto px-4 max-w-md pt-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6"
                >
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Vos Progres</h1>
                    <p className="text-gray-500">Suivez votre evolution au quotidien</p>
                </motion.div>

                {/* Period Selector */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-6"
                >
                    <PeriodSelector selected={period} onChange={setPeriod} />
                </motion.div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                    {stats.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.15 + index * 0.05 }}
                                className={`${stat.bgColor} rounded-2xl p-3 text-center`}
                            >
                                <div className={`inline-flex h-9 w-9 rounded-full bg-gradient-to-br ${stat.color} items-center justify-center mb-1.5`}>
                                    <Icon className="h-4 w-4 text-white" />
                                </div>
                                <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                                <p className="text-xs text-gray-500">{stat.unit}</p>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Macro Balance Widget */}
                <div className="mb-6">
                    <MacroBalanceWidget
                        period={period}
                        data={periodData.macroData}
                    />
                </div>

                {/* Nutrition Trend Chart */}
                <div className="mb-6">
                    <NutritionTrendChart
                        period={period}
                        data={periodData.chartData}
                        targetCalories={targets.calories}
                    />
                </div>

                {/* Coach Insights Widget */}
                <div className="mb-6">
                    <CoachInsightsWidget
                        period={period}
                        data={periodData.macroData}
                        streak={streak}
                        mealsLogged={totalMeals}
                    />
                </div>

                {/* Daily Target Summary */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl p-5 text-white"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-white/80 text-sm">Objectif journalier</p>
                            <p className="text-3xl font-bold">{targets.calories} kcal</p>
                            <div className="flex gap-3 mt-2 text-xs text-white/70">
                                <span>P: {targets.proteins}g</span>
                                <span>G: {targets.carbs}g</span>
                                <span>L: {targets.fats}g</span>
                            </div>
                        </div>
                        <div className="h-14 w-14 bg-white/20 rounded-xl flex items-center justify-center">
                            <Calendar className="h-7 w-7 text-white" />
                        </div>
                    </div>
                </motion.div>
            </div>

            <BottomNav />
        </div>
    );
}
