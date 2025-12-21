'use client';

import { BottomNav } from '@/components/ui/BottomNav';
import { motion } from 'framer-motion';
import { TrendingDown, Target, Calendar, Flame, Award, Zap } from 'lucide-react';
import { useUserStore, useSoloProfile } from '@/store/user-store';
import { useMealStore } from '@/store/meal-store';

export default function ProgressPage() {
    const profile = useSoloProfile();
    const { meals } = useMealStore();

    // Calculate targets from profile
    const dailyCalorieTarget = profile?.nutritionalNeeds?.calories || 2000;

    // Calculate last 7 days
    const weeklyProgress = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        const dateStr = date.toISOString().split('T')[0];

        // Get daily meals for this date
        const dayMeals = meals[dateStr];
        const dayCalories = dayMeals?.totalNutrition?.calories || 0;

        return {
            day: date.toLocaleDateString('fr-FR', { weekday: 'short' }),
            calories: Math.round(dayCalories),
            target: dailyCalorieTarget,
        };
    });

    // Calculate streak (consecutive days with logged meals)
    let streak = 0;
    for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const dayMeals = meals[dateStr];
        const hasMeals = dayMeals && (dayMeals.breakfast || dayMeals.lunch || dayMeals.snack || dayMeals.dinner);
        if (hasMeals) {
            streak++;
        } else if (i > 0) {
            break;
        }
    }

    // Total meals logged (count all meals across all days)
    const totalMeals = Object.values(meals).reduce((count, dayMeals) => {
        let dayCount = 0;
        if (dayMeals?.breakfast) dayCount++;
        if (dayMeals?.lunch) dayCount++;
        if (dayMeals?.snack) dayCount++;
        if (dayMeals?.dinner) dayCount++;
        return count + dayCount;
    }, 0);

    // Weight progress (mock for now)
    const weightProgress = profile?.weight && profile?.targetWeight
        ? Math.abs(profile.weight - profile.targetWeight)
        : 0;

    const stats = [
        {
            icon: TrendingDown,
            label: 'Objectif poids',
            value: weightProgress.toFixed(1),
            unit: 'kg restants',
            color: 'from-green-400 to-emerald-500',
            bgColor: 'bg-green-50',
        },
        {
            icon: Flame,
            label: 'Serie en cours',
            value: streak.toString(),
            unit: 'jours',
            color: 'from-orange-400 to-red-500',
            bgColor: 'bg-orange-50',
        },
        {
            icon: Award,
            label: 'Repas enregistres',
            value: totalMeals.toString(),
            unit: 'repas',
            color: 'from-blue-400 to-purple-500',
            bgColor: 'bg-blue-50',
        },
    ];

    const maxCalories = Math.max(...weeklyProgress.map(d => Math.max(d.calories, d.target)), 1);

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 pb-32">
            <div className="container mx-auto px-4 max-w-md pt-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Vos Progres</h1>
                    <p className="text-gray-500">Suivez votre evolution au quotidien</p>
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
                    className="bg-white/80 backdrop-blur rounded-3xl p-6 mb-6 border border-stone-100"
                >
                    <h3 className="font-bold text-gray-900 mb-4">Calories cette semaine</h3>
                    <div className="flex items-end justify-between gap-2 h-48">
                        {weeklyProgress.map((day, index) => {
                            const percentage = Math.min((day.calories / maxCalories) * 100, 100);
                            const targetPercentage = (day.target / maxCalories) * 100;
                            const isOverTarget = day.calories > day.target;

                            return (
                                <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
                                    <div className="relative w-full flex-1 flex items-end">
                                        {/* Target line */}
                                        <div
                                            className="absolute w-full border-t-2 border-dashed border-gray-300"
                                            style={{ bottom: `${targetPercentage}%` }}
                                        />
                                        <motion.div
                                            initial={{ height: 0 }}
                                            animate={{ height: `${percentage}%` }}
                                            transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                                            className={`w-full rounded-t-lg ${isOverTarget
                                                ? 'bg-gradient-to-t from-orange-400 to-red-500'
                                                : day.calories > 0
                                                    ? 'bg-gradient-to-t from-primary-400 to-primary-600'
                                                    : 'bg-gray-200'
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
                            <span className="text-gray-600">Depasse</span>
                        </div>
                    </div>
                </motion.div>

                {/* Daily Target */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl p-5 mb-6 text-white"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-white/80 text-sm">Objectif journalier</p>
                            <p className="text-3xl font-bold">{dailyCalorieTarget} kcal</p>
                        </div>
                        <div className="h-14 w-14 bg-white/20 rounded-xl flex items-center justify-center">
                            <Zap className="h-7 w-7 text-white" />
                        </div>
                    </div>
                </motion.div>

                {/* Motivational Message */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="bg-white/80 backdrop-blur rounded-2xl p-6 text-center border border-stone-100"
                >
                    <p className="text-lg font-semibold text-gray-900 mb-2">
                        {streak >= 7 ? 'Incroyable ! Une semaine complete !' :
                         streak >= 3 ? 'Excellent travail !' :
                         'Continuez comme ca !'}
                    </p>
                    <p className="text-gray-600 text-sm">
                        {streak >= 7 ? 'Vous etes sur une lancee fantastique. Gardez le cap !' :
                         streak >= 3 ? 'Vous etes sur la bonne voie. Continuez !' :
                         'Chaque jour compte. Un pas apres l\'autre !'}
                    </p>
                </motion.div>
            </div>

            <BottomNav />
        </div>
    );
}
