"use client";

import { useOnboardingStore } from '@/store/onboarding-store';
import { useMealStore } from '@/store/meal-store';
import { calculateNutritionGoals } from '@/lib/nutrition-calculator';
import { motion } from 'framer-motion';
import { Sparkles, AlertCircle, CheckCircle, Info } from 'lucide-react';

export const AIInsights = () => {
    const { profile } = useOnboardingStore();
    const { getDailyNutrition } = useMealStore();
    const goals = calculateNutritionGoals(profile);

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

    // Generate insights based on data
    const insights = [];

    // Calorie insight
    if (avgCalories < goals.calories * 0.8) {
        insights.push({
            type: 'warning',
            icon: AlertCircle,
            title: 'Apport calorique insuffisant',
            message: `Vous consommez en moyenne ${Math.round(avgCalories)} kcal/jour, soit ${Math.round(goals.calories - avgCalories)} kcal de moins que votre objectif. Cela pourrait ralentir votre métabolisme.`,
            action: 'Augmentez vos portions ou ajoutez une collation saine.',
        });
    } else if (avgCalories > goals.calories * 1.15) {
        insights.push({
            type: 'warning',
            icon: AlertCircle,
            title: 'Surplus calorique important',
            message: `Vous dépassez votre objectif de ${Math.round(avgCalories - goals.calories)} kcal/jour en moyenne.`,
            action: 'Réduisez les portions ou privilégiez des aliments moins caloriques.',
        });
    } else {
        insights.push({
            type: 'success',
            icon: CheckCircle,
            title: 'Excellent équilibre calorique !',
            message: `Vous êtes dans votre zone cible avec ${Math.round(avgCalories)} kcal/jour en moyenne.`,
            action: 'Continuez sur cette lancée !',
        });
    }

    // Protein insight
    if (avgProteins < goals.proteins * 0.8) {
        insights.push({
            type: 'info',
            icon: Info,
            title: 'Augmentez vos protéines',
            message: `Objectif : ${goals.proteins}g/jour. Actuellement : ${Math.round(avgProteins)}g/jour.`,
            action: 'Ajoutez des œufs, du poulet, du poisson ou des légumineuses à vos repas.',
        });
    }

    // Carbs insight based on goal
    if (profile.primaryGoal === 'weight_loss' && avgCarbs > goals.carbs * 1.2) {
        insights.push({
            type: 'info',
            icon: Info,
            title: 'Réduisez les glucides',
            message: `Pour optimiser la perte de poids, visez ${goals.carbs}g de glucides/jour au lieu de ${Math.round(avgCarbs)}g.`,
            action: 'Remplacez les féculents par des légumes verts.',
        });
    }

    // Hydration reminder (mock)
    insights.push({
        type: 'info',
        icon: Sparkles,
        title: 'Hydratation',
        message: `N'oubliez pas de boire ${Math.round(goals.water / 1000)}L d'eau par jour.`,
        action: 'Gardez une bouteille d\'eau à portée de main.',
    });

    const typeConfig = {
        success: { bg: 'bg-green-50', border: 'border-green-200', iconColor: 'text-green-600' },
        warning: { bg: 'bg-orange-50', border: 'border-orange-200', iconColor: 'text-orange-600' },
        info: { bg: 'bg-blue-50', border: 'border-blue-200', iconColor: 'text-blue-600' },
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-6"
        >
            <div className="flex items-center gap-2 mb-4 px-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                <h3 className="text-lg font-bold text-gray-900">Conseils Personnalisés</h3>
            </div>

            <div className="space-y-3">
                {insights.slice(0, 3).map((insight, index) => {
                    const Icon = insight.icon;
                    const config = typeConfig[insight.type as keyof typeof typeConfig];

                    return (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 + index * 0.1 }}
                            className={`${config.bg} ${config.border} border-2 rounded-2xl p-4`}
                        >
                            <div className="flex items-start gap-3">
                                <div className={`h-10 w-10 rounded-xl ${config.bg} flex items-center justify-center shrink-0`}>
                                    <Icon className={`h-5 w-5 ${config.iconColor}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-gray-900 mb-1">{insight.title}</h4>
                                    <p className="text-sm text-gray-700 mb-2">{insight.message}</p>
                                    <p className="text-xs font-medium text-gray-600 bg-white/50 rounded-lg px-3 py-2">
                                        💡 {insight.action}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </motion.div>
    );
};
