'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, TrendingDown, Flame, Award } from 'lucide-react';
import { PeriodSelector, type Period } from './PeriodSelector';
import { MacroBalanceWidget } from './MacroBalanceWidget';
import { CoachInsightsWidget } from './CoachInsightsWidget';
import { NutritionTrendChart } from './NutritionTrendChart';

interface ProgressCollapsibleWidgetProps {
    meals: Record<string, any>;
    targets: {
        calories: number;
        proteins: number;
        carbs: number;
        fats: number;
    };
    weightProgress: number;
}

export function ProgressCollapsibleWidget({ meals, targets, weightProgress }: ProgressCollapsibleWidgetProps) {
    const [period, setPeriod] = useState<Period>('week');
    const [isExpanded, setIsExpanded] = useState(false);

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
            }

            let label = '';
            if (period === 'day') {
                label = 'Auj.';
            } else if (period === 'week') {
                label = date.toLocaleDateString('fr-FR', { weekday: 'short' });
            } else {
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

        const targetMultiplier = period === 'day' ? 1 : dates.length;

        return {
            chartData,
            macroData: {
                calories: { consumed: Math.round(totalCalories), target: targets.calories * targetMultiplier },
                proteins: { consumed: Math.round(totalProteins), target: targets.proteins * targetMultiplier },
                carbs: { consumed: Math.round(totalCarbs), target: targets.carbs * targetMultiplier },
                fats: { consumed: Math.round(totalFats), target: targets.fats * targetMultiplier },
            },
        };
    }, [period, meals, targets]);

    // Calculate streak
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
        return Object.values(meals).reduce((count: number, dayMeals: any) => {
            let dayCount = 0;
            if (dayMeals?.breakfast) dayCount++;
            if (dayMeals?.lunch) dayCount++;
            if (dayMeals?.snack) dayCount++;
            if (dayMeals?.dinner) dayCount++;
            return count + dayCount;
        }, 0);
    }, [meals]);

    const stats = [
        {
            icon: TrendingDown,
            value: weightProgress.toFixed(1),
            unit: 'kg',
            color: 'from-green-400 to-emerald-500',
            bgColor: 'bg-green-50',
        },
        {
            icon: Flame,
            value: streak.toString(),
            unit: 'jours',
            color: 'from-orange-400 to-red-500',
            bgColor: 'bg-orange-50',
        },
        {
            icon: Award,
            value: totalMeals.toString(),
            unit: 'repas',
            color: 'from-blue-400 to-purple-500',
            bgColor: 'bg-blue-50',
        },
    ];

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Always visible: Period Selector + Stats */}
            <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900">Progression</h3>
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="flex items-center gap-1 text-sm text-primary-600 font-medium"
                    >
                        {isExpanded ? 'Réduire' : 'Détails'}
                        {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                        ) : (
                            <ChevronDown className="h-4 w-4" />
                        )}
                    </button>
                </div>

                {/* Period Selector */}
                <PeriodSelector selected={period} onChange={setPeriod} />

                {/* Stats - Always visible */}
                <div className="grid grid-cols-3 gap-3 mt-4">
                    {stats.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.05 }}
                                className={`${stat.bgColor} rounded-xl p-3 text-center`}
                            >
                                <div className={`inline-flex h-8 w-8 rounded-full bg-gradient-to-br ${stat.color} items-center justify-center mb-1`}>
                                    <Icon className="h-4 w-4 text-white" />
                                </div>
                                <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                                <p className="text-xs text-gray-500">{stat.unit}</p>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Collapsible: Detailed widgets */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden border-t border-gray-100"
                    >
                        <div className="p-4 space-y-4 bg-stone-50">
                            {/* Macro Balance */}
                            <MacroBalanceWidget
                                period={period}
                                data={periodData.macroData}
                            />

                            {/* Trend Chart */}
                            <NutritionTrendChart
                                period={period}
                                data={periodData.chartData}
                                targetCalories={targets.calories}
                            />

                            {/* Coach Insights */}
                            <CoachInsightsWidget
                                period={period}
                                data={periodData.macroData}
                                streak={streak}
                                mealsLogged={totalMeals}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
