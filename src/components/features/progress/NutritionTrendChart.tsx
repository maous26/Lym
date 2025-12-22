'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { Period } from './PeriodSelector';

interface DayData {
    label: string;
    calories: number;
    proteins: number;
    carbs: number;
    fats: number;
    target: number;
}

interface NutritionTrendChartProps {
    period: Period;
    data: DayData[];
    targetCalories: number;
}

export function NutritionTrendChart({ period, data, targetCalories }: NutritionTrendChartProps) {
    if (data.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-3xl p-5 shadow-sm border border-stone-100"
            >
                <h3 className="font-bold text-stone-900 mb-4">Tendance nutritionnelle</h3>
                <div className="h-48 flex items-center justify-center text-stone-400">
                    Aucune donnée disponible
                </div>
            </motion.div>
        );
    }

    const maxValue = Math.max(
        ...data.map(d => Math.max(d.calories, targetCalories)),
        targetCalories * 1.2
    );

    // Calculate trend
    const recentData = data.slice(-3);
    const olderData = data.slice(0, Math.max(1, data.length - 3));
    const recentAvg = recentData.reduce((sum, d) => sum + d.calories, 0) / recentData.length;
    const olderAvg = olderData.reduce((sum, d) => sum + d.calories, 0) / olderData.length;
    const trendPercentage = olderAvg > 0 ? ((recentAvg - olderAvg) / olderAvg) * 100 : 0;

    const getTrendIcon = () => {
        if (Math.abs(trendPercentage) < 5) return <Minus className="w-4 h-4" />;
        if (trendPercentage > 0) return <TrendingUp className="w-4 h-4" />;
        return <TrendingDown className="w-4 h-4" />;
    };

    const getTrendColor = () => {
        if (Math.abs(trendPercentage) < 5) return 'text-stone-500 bg-stone-100';
        // For calories, trending down is good if over target, bad if under
        const avgVsTarget = recentAvg / targetCalories;
        if (avgVsTarget > 1.1) {
            // Over target - trending down is good
            return trendPercentage < 0 ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100';
        } else if (avgVsTarget < 0.9) {
            // Under target - trending up is good
            return trendPercentage > 0 ? 'text-green-600 bg-green-100' : 'text-amber-600 bg-amber-100';
        }
        return 'text-green-600 bg-green-100';
    };

    const getPeriodTitle = () => {
        switch (period) {
            case 'day': return 'Aujourd\'hui';
            case 'week': return '7 derniers jours';
            case 'month': return '30 derniers jours';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl p-5 shadow-sm border border-stone-100"
        >
            <div className="flex items-center justify-between mb-5">
                <div>
                    <h3 className="font-bold text-stone-900">Tendance calories</h3>
                    <p className="text-sm text-stone-500">{getPeriodTitle()}</p>
                </div>
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${getTrendColor()}`}>
                    {getTrendIcon()}
                    <span>{Math.abs(Math.round(trendPercentage))}%</span>
                </div>
            </div>

            {/* Chart */}
            <div className="relative h-48 mb-4">
                {/* Grid lines */}
                <div className="absolute inset-0 flex flex-col justify-between">
                    {[0, 1, 2, 3].map((i) => (
                        <div key={i} className="border-b border-stone-100 last:border-0" />
                    ))}
                </div>

                {/* Target line */}
                <div
                    className="absolute left-0 right-0 border-t-2 border-dashed border-primary-300 z-10"
                    style={{ bottom: `${(targetCalories / maxValue) * 100}%` }}
                >
                    <span className="absolute right-0 -top-5 text-xs text-primary-500 font-medium">
                        Objectif
                    </span>
                </div>

                {/* Bars */}
                <div className="absolute inset-0 flex items-end gap-1 pt-6">
                    {data.map((day, index) => {
                        const height = (day.calories / maxValue) * 100;
                        const isOverTarget = day.calories > targetCalories;
                        const isNearTarget = day.calories >= targetCalories * 0.9 && day.calories <= targetCalories * 1.1;

                        return (
                            <div
                                key={day.label}
                                className="flex-1 flex flex-col items-center gap-1 h-full"
                            >
                                <div className="flex-1 w-full flex items-end">
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: `${Math.min(height, 100)}%` }}
                                        transition={{ duration: 0.5, delay: index * 0.05 }}
                                        className={`w-full rounded-t-lg ${
                                            isOverTarget
                                                ? 'bg-gradient-to-t from-red-400 to-orange-400'
                                                : isNearTarget
                                                ? 'bg-gradient-to-t from-green-400 to-emerald-400'
                                                : day.calories > 0
                                                ? 'bg-gradient-to-t from-primary-400 to-primary-500'
                                                : 'bg-stone-200'
                                        }`}
                                    >
                                        {/* Tooltip on hover */}
                                        <div className="relative group">
                                            <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-stone-900 text-white text-xs rounded whitespace-nowrap z-20">
                                                {day.calories} kcal
                                            </div>
                                        </div>
                                    </motion.div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* X-axis labels */}
            <div className="flex gap-1">
                {data.map((day) => (
                    <div key={day.label} className="flex-1 text-center">
                        <span className="text-xs text-stone-500">{day.label}</span>
                    </div>
                ))}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-stone-100">
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-400 to-emerald-400" />
                    <span className="text-xs text-stone-600">Objectif atteint</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-primary-400 to-primary-500" />
                    <span className="text-xs text-stone-600">En cours</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-red-400 to-orange-400" />
                    <span className="text-xs text-stone-600">Dépassé</span>
                </div>
            </div>
        </motion.div>
    );
}
