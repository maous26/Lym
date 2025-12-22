'use client';

import { motion } from 'framer-motion';
import { Flame, Beef, Wheat, Droplet } from 'lucide-react';
import type { Period } from './PeriodSelector';

interface MacroData {
    consumed: number;
    target: number;
    label: string;
    unit: string;
    icon: typeof Flame;
    color: string;
    bgColor: string;
    gradientFrom: string;
    gradientTo: string;
}

interface MacroBalanceWidgetProps {
    period: Period;
    data: {
        calories: { consumed: number; target: number };
        proteins: { consumed: number; target: number };
        carbs: { consumed: number; target: number };
        fats: { consumed: number; target: number };
    };
}

export function MacroBalanceWidget({ period, data }: MacroBalanceWidgetProps) {
    const getPeriodLabel = () => {
        switch (period) {
            case 'day': return "aujourd'hui";
            case 'week': return 'cette semaine';
            case 'month': return 'ce mois';
        }
    };

    const macros: MacroData[] = [
        {
            label: 'Calories',
            consumed: data.calories.consumed,
            target: data.calories.target,
            unit: 'kcal',
            icon: Flame,
            color: 'text-orange-500',
            bgColor: 'bg-orange-50',
            gradientFrom: 'from-orange-400',
            gradientTo: 'to-red-500',
        },
        {
            label: 'Protéines',
            consumed: data.proteins.consumed,
            target: data.proteins.target,
            unit: 'g',
            icon: Beef,
            color: 'text-red-500',
            bgColor: 'bg-red-50',
            gradientFrom: 'from-red-400',
            gradientTo: 'to-rose-500',
        },
        {
            label: 'Glucides',
            consumed: data.carbs.consumed,
            target: data.carbs.target,
            unit: 'g',
            icon: Wheat,
            color: 'text-amber-500',
            bgColor: 'bg-amber-50',
            gradientFrom: 'from-amber-400',
            gradientTo: 'to-yellow-500',
        },
        {
            label: 'Lipides',
            consumed: data.fats.consumed,
            target: data.fats.target,
            unit: 'g',
            icon: Droplet,
            color: 'text-purple-500',
            bgColor: 'bg-purple-50',
            gradientFrom: 'from-purple-400',
            gradientTo: 'to-violet-500',
        },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-5 shadow-sm border border-stone-100"
        >
            <h3 className="font-bold text-stone-900 mb-1">Équilibre macronutriments</h3>
            <p className="text-sm text-stone-500 mb-5">Votre consommation {getPeriodLabel()}</p>

            <div className="space-y-4">
                {macros.map((macro, index) => {
                    const Icon = macro.icon;
                    const percentage = macro.target > 0
                        ? Math.min((macro.consumed / macro.target) * 100, 150)
                        : 0;
                    const isOverTarget = macro.consumed > macro.target;
                    const isNearTarget = percentage >= 85 && percentage <= 115;
                    const isUnderTarget = percentage < 85;

                    return (
                        <motion.div
                            key={macro.label}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <div className={`w-8 h-8 rounded-lg ${macro.bgColor} flex items-center justify-center`}>
                                        <Icon className={`w-4 h-4 ${macro.color}`} />
                                    </div>
                                    <span className="font-medium text-stone-700">{macro.label}</span>
                                </div>
                                <div className="text-right">
                                    <span className="font-bold text-stone-900">
                                        {Math.round(macro.consumed)}
                                    </span>
                                    <span className="text-stone-400 text-sm">
                                        {' '}/ {macro.target} {macro.unit}
                                    </span>
                                </div>
                            </div>

                            {/* Progress bar */}
                            <div className="relative h-3 bg-stone-100 rounded-full overflow-hidden">
                                {/* Target marker */}
                                <div
                                    className="absolute top-0 bottom-0 w-0.5 bg-stone-400 z-10"
                                    style={{ left: `${Math.min(100, (macro.target / macro.target) * 100 * (100 / 150))}%` }}
                                />

                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min(percentage, 100) * (100 / 150)}%` }}
                                    transition={{ duration: 0.8, delay: index * 0.1 }}
                                    className={`h-full rounded-full bg-gradient-to-r ${
                                        isOverTarget
                                            ? 'from-orange-400 to-red-500'
                                            : isNearTarget
                                            ? 'from-green-400 to-emerald-500'
                                            : `${macro.gradientFrom} ${macro.gradientTo}`
                                    }`}
                                />
                            </div>

                            {/* Status indicator */}
                            <div className="flex justify-between items-center mt-1.5">
                                <span className={`text-xs font-medium ${
                                    isOverTarget
                                        ? 'text-red-500'
                                        : isNearTarget
                                        ? 'text-green-500'
                                        : 'text-stone-400'
                                }`}>
                                    {isOverTarget
                                        ? `+${Math.round(macro.consumed - macro.target)} ${macro.unit} (dépassé)`
                                        : isNearTarget
                                        ? 'Objectif atteint ✓'
                                        : `${Math.round(macro.target - macro.consumed)} ${macro.unit} restants`
                                    }
                                </span>
                                <span className="text-xs text-stone-400">
                                    {Math.round(percentage)}%
                                </span>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </motion.div>
    );
}
