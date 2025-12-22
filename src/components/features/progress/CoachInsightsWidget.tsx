'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
    Lightbulb,
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    CheckCircle2,
    Sparkles,
    ChefHat,
    Target,
    Zap
} from 'lucide-react';
import type { Period } from './PeriodSelector';

interface NutritionData {
    calories: { consumed: number; target: number };
    proteins: { consumed: number; target: number };
    carbs: { consumed: number; target: number };
    fats: { consumed: number; target: number };
}

interface Insight {
    type: 'success' | 'warning' | 'tip' | 'suggestion';
    icon: typeof Lightbulb;
    title: string;
    message: string;
    priority: number;
}

interface CoachInsightsWidgetProps {
    period: Period;
    data: NutritionData;
    streak: number;
    mealsLogged: number;
}

export function CoachInsightsWidget({ period, data, streak, mealsLogged }: CoachInsightsWidgetProps) {
    // Generate insights based on data
    const generateInsights = (): Insight[] => {
        const insights: Insight[] = [];

        const caloriePercent = data.calories.target > 0
            ? (data.calories.consumed / data.calories.target) * 100
            : 0;
        const proteinPercent = data.proteins.target > 0
            ? (data.proteins.consumed / data.proteins.target) * 100
            : 0;
        const carbsPercent = data.carbs.target > 0
            ? (data.carbs.consumed / data.carbs.target) * 100
            : 0;
        const fatsPercent = data.fats.target > 0
            ? (data.fats.consumed / data.fats.target) * 100
            : 0;

        // Proactive suggestions based on patterns
        if (proteinPercent < 70) {
            insights.push({
                type: 'suggestion',
                icon: Zap,
                title: 'Augmentez vos protéines',
                message: `Essayez d'ajouter une source de protéines à votre prochain repas : poulet, poisson, oeufs, légumineuses ou tofu.`,
                priority: 1,
            });
        }

        if (fatsPercent > 120) {
            insights.push({
                type: 'warning',
                icon: AlertTriangle,
                title: 'Lipides élevés',
                message: `Vos apports en lipides dépassent l'objectif. Privilégiez les cuissons vapeur ou grillées pour les prochains repas.`,
                priority: 2,
            });
        }

        if (carbsPercent > 130) {
            insights.push({
                type: 'warning',
                icon: AlertTriangle,
                title: 'Glucides en excès',
                message: `Réduisez légèrement les féculents au prochain repas et ajoutez plus de légumes verts.`,
                priority: 2,
            });
        }

        if (caloriePercent >= 90 && caloriePercent <= 110 && proteinPercent >= 85 && proteinPercent <= 115) {
            insights.push({
                type: 'success',
                icon: CheckCircle2,
                title: 'Excellent équilibre !',
                message: `Vos macros sont bien équilibrés ${period === 'day' ? "aujourd'hui" : period === 'week' ? 'cette semaine' : 'ce mois'}. Continuez ainsi !`,
                priority: 3,
            });
        }

        // Streak-based motivation
        if (streak >= 7) {
            insights.push({
                type: 'success',
                icon: Sparkles,
                title: `${streak} jours de suite !`,
                message: `Incroyable ! Vous êtes sur une lancée de ${streak} jours. Votre régularité paie !`,
                priority: 4,
            });
        } else if (streak >= 3) {
            insights.push({
                type: 'tip',
                icon: TrendingUp,
                title: 'Belle progression',
                message: `${streak} jours consécutifs ! Encore quelques jours pour atteindre une semaine complète.`,
                priority: 5,
            });
        }

        // Reactive tips based on low intake
        if (caloriePercent < 50 && period === 'day') {
            insights.push({
                type: 'tip',
                icon: ChefHat,
                title: 'N\'oubliez pas de manger',
                message: `Vous n'avez consommé que ${Math.round(caloriePercent)}% de vos calories. Pensez à prendre un repas équilibré.`,
                priority: 1,
            });
        }

        // General tips
        if (insights.length < 2) {
            if (proteinPercent >= 80 && proteinPercent <= 100) {
                insights.push({
                    type: 'tip',
                    icon: Target,
                    title: 'Protéines au point',
                    message: 'Vos apports en protéines sont optimaux pour maintenir votre masse musculaire.',
                    priority: 6,
                });
            }
        }

        // Sort by priority and take top 3
        return insights.sort((a, b) => a.priority - b.priority).slice(0, 3);
    };

    const insights = generateInsights();

    const getIconBgColor = (type: Insight['type']) => {
        switch (type) {
            case 'success': return 'bg-green-100';
            case 'warning': return 'bg-amber-100';
            case 'tip': return 'bg-blue-100';
            case 'suggestion': return 'bg-purple-100';
        }
    };

    const getIconColor = (type: Insight['type']) => {
        switch (type) {
            case 'success': return 'text-green-600';
            case 'warning': return 'text-amber-600';
            case 'tip': return 'text-blue-600';
            case 'suggestion': return 'text-purple-600';
        }
    };

    const getBorderColor = (type: Insight['type']) => {
        switch (type) {
            case 'success': return 'border-green-200';
            case 'warning': return 'border-amber-200';
            case 'tip': return 'border-blue-200';
            case 'suggestion': return 'border-purple-200';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl p-5 shadow-sm border border-stone-100"
        >
            <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                    <Lightbulb className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h3 className="font-bold text-stone-900">Conseils du coach</h3>
                    <p className="text-xs text-stone-500">Suggestions personnalisées</p>
                </div>
            </div>

            <AnimatePresence mode="wait">
                <div className="space-y-3">
                    {insights.length > 0 ? (
                        insights.map((insight, index) => {
                            const Icon = insight.icon;
                            return (
                                <motion.div
                                    key={insight.title}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ delay: index * 0.1 }}
                                    className={`p-4 rounded-2xl border ${getBorderColor(insight.type)} bg-gradient-to-r from-white to-stone-50`}
                                >
                                    <div className="flex gap-3">
                                        <div className={`flex-shrink-0 w-10 h-10 rounded-xl ${getIconBgColor(insight.type)} flex items-center justify-center`}>
                                            <Icon className={`w-5 h-5 ${getIconColor(insight.type)}`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-semibold text-stone-900 text-sm mb-0.5">
                                                {insight.title}
                                            </h4>
                                            <p className="text-sm text-stone-600 leading-relaxed">
                                                {insight.message}
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-6 text-stone-500"
                        >
                            <ChefHat className="w-10 h-10 mx-auto mb-2 text-stone-300" />
                            <p className="text-sm">Enregistrez vos repas pour obtenir des conseils personnalisés</p>
                        </motion.div>
                    )}
                </div>
            </AnimatePresence>
        </motion.div>
    );
}
