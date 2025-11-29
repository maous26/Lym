"use client";

import { BottomNav } from '@/components/ui/BottomNav';
import { motion } from 'framer-motion';
import { TrendingDown, TrendingUp, Target, Calendar } from 'lucide-react';
import { useOnboardingStore } from '@/store/onboarding-store';
import { useMealStore } from '@/store/meal-store';
import { calculateNutritionGoals } from '@/lib/nutrition-calculator';

export default function ProgressPage() {
    const { profile } = useOnboardingStore();
    const { getDailyNutrition } = useMealStore();
    const goals = calculateNutritionGoals(profile);

    // Calculate last 7 days
    const weeklyProgress = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        const dateStr = date.toISOString().split('T')[0];
        const nutrition = getDailyNutrition(dateStr, goals);

        return {
            day: date.toLocaleDateString('fr-FR', { weekday: 'short' }),
            calories: Math.round(nutrition.calories),
            target: goals.calories,
        };
    });

    const stats = [
        {
            icon: TrendingDown,
            label: 'Poids perdu',
            value: '2.5',
            unit: 'kg',
            color: 'from-green-400 to-emerald-500',
            bgColor: 'bg-green-50',
        },
        {
            icon: Target,
            label: 'Objectif restant',
            value: profile.targetWeight && profile.weight
                ? Math.abs(profile.targetWeight - profile.weight).toFixed(1)
                : '0',
            unit: 'kg',
            color: 'from-orange-400 to-red-500',
            bgColor: 'bg-orange-50',
        },
        {
            icon: Calendar,
            label: 'Jours actifs',
            value: '28',
            unit: 'jours',
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
                    className="mb-8"
                >
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Vos Progrès</h1>
                    <p className="text-gray-500">Suivez votre évolution au quotidien</p>
                </motion.div>

                {/* Stats Cards */}
                <div className="grid grid-cols-3 gap-3 mb-8">
                    {stats.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.1 }}
                                className={`${stat.bgColor} rounded-2xl p-4 text-center`}
                            >
                                <div className={`inline-flex h-10 w-10 rounded-full bg-gradient-to-br ${stat.color} items-center justify-center mb-2`}>
                                    <Icon className="h-5 w-5 text-white" />
                                </div>
                                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                                <p className="text-xs text-gray-600 mb-1">{stat.unit}</p>
                                <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Weekly Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="glass rounded-3xl p-6 mb-6"
                >
                    <h3 className="font-bold text-gray-900 mb-4">Calories cette semaine</h3>
                    <div className="flex items-end justify-between gap-2 h-48">
                        {weeklyProgress.map((day, index) => {
                            const percentage = (day.calories / day.target) * 100;
                            const isOverTarget = day.calories > day.target;

                            return (
                                <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
                                    <div className="relative w-full flex-1 flex items-end">
                                        <motion.div
                                            initial={{ height: 0 }}
                                            animate={{ height: `${percentage}%` }}
                                            transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                                            className={`w-full rounded-t-lg ${isOverTarget
                                                ? 'bg-gradient-to-t from-orange-400 to-red-500'
                                                : 'bg-gradient-to-t from-primary-400 to-primary-600'
                                                }`}
                                        />
                                    </div>
                                    <p className="text-xs font-medium text-gray-600">{day.day}</p>
                                </div>
                            );
                        })}
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-center gap-4 text-xs">
                        <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-gradient-to-br from-primary-400 to-primary-600" />
                            <span className="text-gray-600">Objectif atteint</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-gradient-to-br from-orange-400 to-red-500" />
                            <span className="text-gray-600">Dépassé</span>
                        </div>
                    </div>
                </motion.div>

                {/* Motivational Message */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="glass rounded-2xl p-6 text-center"
                >
                    <p className="text-lg font-semibold text-gray-900 mb-2">
                        Excellent travail ! 🎉
                    </p>
                    <p className="text-gray-600 text-sm">
                        Vous êtes sur la bonne voie. Continuez comme ça !
                    </p>
                </motion.div>
            </div>

            <BottomNav />
        </div>
    );
}
