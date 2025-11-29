"use client";

import { useOnboardingStore } from '@/store/onboarding-store';
import { calculateNutritionGoals, calculateBMI, getBMICategory } from '@/lib/nutrition-calculator';
import { motion } from 'framer-motion';
import { Flame, Droplet, Activity } from 'lucide-react';

export const StatsOverview = () => {
    const { profile } = useOnboardingStore();
    const goals = calculateNutritionGoals(profile);

    const bmi = profile.weight && profile.height
        ? calculateBMI(profile.weight, profile.height)
        : 0;

    const stats = [
        {
            icon: Flame,
            label: 'Calories',
            value: goals.calories,
            unit: 'kcal',
            color: 'from-orange-400 to-red-500',
            bgColor: 'bg-orange-50',
            textColor: 'text-orange-700',
        },
        {
            icon: Activity,
            label: 'Protéines',
            value: goals.proteins,
            unit: 'g',
            color: 'from-blue-400 to-blue-600',
            bgColor: 'bg-blue-50',
            textColor: 'text-blue-700',
        },
        {
            icon: Droplet,
            label: 'Eau',
            value: Math.round(goals.water / 1000),
            unit: 'L',
            color: 'from-cyan-400 to-blue-500',
            bgColor: 'bg-cyan-50',
            textColor: 'text-cyan-700',
        },
    ];

    return (
        <div className="space-y-4">
            {/* BMI Card */}
            {bmi > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass rounded-2xl p-4"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Indice de Masse Corporelle</p>
                            <p className="text-2xl font-bold text-gray-900">{bmi.toFixed(1)}</p>
                            <p className="text-xs text-gray-600 mt-1">{getBMICategory(bmi)}</p>
                        </div>
                        <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-white font-bold text-lg">
                            {bmi.toFixed(0)}
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`${stat.bgColor} rounded-xl p-3 text-center`}
                        >
                            <div className={`inline-flex h-10 w-10 rounded-full bg-gradient-to-br ${stat.color} items-center justify-center mb-2`}>
                                <Icon className="h-5 w-5 text-white" />
                            </div>
                            <p className={`text-xl font-bold ${stat.textColor}`}>
                                {stat.value}
                            </p>
                            <p className="text-xs text-gray-600">{stat.label}</p>
                            <p className="text-xs text-gray-500">{stat.unit}/jour</p>
                        </motion.div>
                    );
                })}
            </div>

            {/* Macros Breakdown */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass rounded-2xl p-4"
            >
                <h3 className="font-semibold text-gray-800 mb-3">Répartition Macros</h3>
                <div className="space-y-2">
                    <MacroBar label="Protéines" value={goals.proteins} max={goals.proteins} color="bg-blue-500" unit="g" />
                    <MacroBar label="Glucides" value={goals.carbs} max={goals.carbs} color="bg-green-500" unit="g" />
                    <MacroBar label="Lipides" value={goals.fats} max={goals.fats} color="bg-yellow-500" unit="g" />
                </div>
            </motion.div>
        </div>
    );
};

const MacroBar = ({ label, value, max, color, unit }: any) => (
    <div>
        <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-600">{label}</span>
            <span className="font-semibold text-gray-800">{value}{unit}</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 1, delay: 0.5 }}
                className={`h-full ${color} rounded-full`}
            />
        </div>
    </div>
);
