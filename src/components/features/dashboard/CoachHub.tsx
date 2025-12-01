"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useOnboardingStore } from '@/store/onboarding-store';
import { useMealStore } from '@/store/meal-store';
import { useCoachStore } from '@/store/coach-store';
import { calculateNutritionGoals } from '@/lib/nutrition-calculator';
import { motion } from 'framer-motion';
import { Sparkles, AlertCircle, CheckCircle, Info, TrendingUp, ArrowRight, X } from 'lucide-react';

export const CoachHub = () => {
    const router = useRouter();
    const { profile } = useOnboardingStore();
    const { getDailyNutrition } = useMealStore();
    const { addInsight, getTopInsights, dismissInsight } = useCoachStore();
    const goals = calculateNutritionGoals(profile);

    // Generate insights based on user data
    useEffect(() => {
        const generateInsights = () => {
            // Analyze last 7 days
            const last7Days = Array.from({ length: 7 }, (_, i) => {
                const date = new Date();
                date.setDate(date.getDate() - (6 - i));
                const dateStr = date.toISOString().split('T')[0];
                return getDailyNutrition(dateStr, goals);
            });

            const avgCalories = last7Days.reduce((sum, day) => sum + day.calories, 0) / 7;
            const avgProteins = last7Days.reduce((sum, day) => sum + day.proteins, 0) / 7;
            const avgCarbs = last7Days.reduce((sum, day) => sum + day.carbs, 0) / 7;

            // Only generate insights if we have some data
            if (avgCalories === 0) return;

            // Calorie insight
            if (avgCalories < goals.calories * 0.8) {
                addInsight({
                    type: 'warning',
                    priority: 'high',
                    title: 'Apport calorique insuffisant',
                    message: `Vous consommez en moyenne ${Math.round(avgCalories)} kcal/jour, soit ${Math.round(goals.calories - avgCalories)} kcal de moins que votre objectif.`,
                    action: 'Augmentez vos portions ou ajoutez une collation saine.',
                });
            } else if (avgCalories > goals.calories * 1.15) {
                addInsight({
                    type: 'warning',
                    priority: 'high',
                    title: 'Surplus calorique important',
                    message: `Vous dépassez votre objectif de ${Math.round(avgCalories - goals.calories)} kcal/jour en moyenne.`,
                    action: 'Réduisez les portions ou privilégiez des aliments moins caloriques.',
                });
            } else if (avgCalories > 0) {
                addInsight({
                    type: 'success',
                    priority: 'medium',
                    title: 'Excellent équilibre calorique !',
                    message: `Vous êtes dans votre zone cible avec ${Math.round(avgCalories)} kcal/jour en moyenne.`,
                    action: 'Continuez sur cette lancée !',
                });
            }

            // Protein insight
            if (avgProteins < goals.proteins * 0.8 && avgProteins > 0) {
                addInsight({
                    type: 'info',
                    priority: 'medium',
                    title: 'Augmentez vos protéines',
                    message: `Objectif : ${goals.proteins}g/jour. Actuellement : ${Math.round(avgProteins)}g/jour.`,
                    action: 'Ajoutez des œufs, du poulet, du poisson ou des légumineuses.',
                });
            }

            // Carbs insight for weight loss
            if (profile.primaryGoal === 'weight_loss' && avgCarbs > goals.carbs * 1.2 && avgCarbs > 0) {
                addInsight({
                    type: 'tip',
                    priority: 'low',
                    title: 'Optimisez vos glucides',
                    message: `Pour la perte de poids, visez ${goals.carbs}g de glucides/jour au lieu de ${Math.round(avgCarbs)}g.`,
                    action: 'Remplacez les féculents par des légumes verts.',
                });
            }

            // Sport-specific insights
            if (profile.sportIntensity === 'high') {
                addInsight({
                    type: 'tip',
                    priority: 'medium',
                    title: 'Nutrition pour sport intense',
                    message: 'Avec votre niveau d\'activité élevé, assurez un bon apport en glucides autour des entraînements.',
                    action: 'Prévoyez une collation pré/post-entraînement.',
                });
            }
        };

        // Generate insights once per day
        const today = new Date().toISOString().split('T')[0];
        const lastCheck = localStorage.getItem('lastInsightCheck');

        if (lastCheck !== today) {
            generateInsights();
            localStorage.setItem('lastInsightCheck', today);
        }
    }, [profile, goals, getDailyNutrition, addInsight]);

    const topInsights = getTopInsights(3);

    const typeConfig = {
        success: {
            bg: 'bg-green-50',
            border: 'border-green-200',
            iconColor: 'text-green-600',
            icon: CheckCircle
        },
        warning: {
            bg: 'bg-orange-50',
            border: 'border-orange-200',
            iconColor: 'text-orange-600',
            icon: AlertCircle
        },
        info: {
            bg: 'bg-blue-50',
            border: 'border-blue-200',
            iconColor: 'text-blue-600',
            icon: Info
        },
        tip: {
            bg: 'bg-purple-50',
            border: 'border-purple-200',
            iconColor: 'text-purple-600',
            icon: TrendingUp
        },
    };

    if (topInsights.length === 0) {
        return null;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-6"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-4 px-2">
                <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-purple-600" />
                    <h3 className="text-lg font-bold text-gray-900">Coach Lym – Aujourd'hui pour vous</h3>
                </div>
                <button
                    onClick={() => router.push('/coach')}
                    className="text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center gap-1"
                >
                    Tout voir
                    <ArrowRight size={16} />
                </button>
            </div>

            {/* Insights Cards */}
            <div className="space-y-3">
                {topInsights.map((insight, index) => {
                    const config = typeConfig[insight.type as keyof typeof typeConfig];
                    const Icon = config.icon;

                    return (
                        <motion.div
                            key={insight.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 + index * 0.1 }}
                            className={`${config.bg} ${config.border} border-2 rounded-2xl p-4 relative`}
                        >
                            {/* Dismiss button */}
                            <button
                                onClick={() => dismissInsight(insight.id)}
                                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X size={16} />
                            </button>

                            <div className="flex items-start gap-3 pr-6">
                                <div className={`h-10 w-10 rounded-xl ${config.bg} flex items-center justify-center shrink-0`}>
                                    <Icon className={`h-5 w-5 ${config.iconColor}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-gray-900 mb-1">{insight.title}</h4>
                                    <p className="text-sm text-gray-700 mb-2">{insight.message}</p>
                                    {insight.action && (
                                        <p className="text-xs font-medium text-gray-600 bg-white/50 rounded-lg px-3 py-2">
                                            💡 {insight.action}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* CTA to coach */}
            <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                onClick={() => router.push('/coach')}
                className="w-full mt-4 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-semibold shadow-lg shadow-purple-200 hover:shadow-xl transition-all flex items-center justify-center gap-2"
            >
                <Sparkles size={18} />
                Discuter avec votre coach
            </motion.button>
        </motion.div>
    );
};
