'use client';

import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Plus, ChevronRight, Sparkles, Users, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { Header } from '@/core/components/layout';
import { Button, Card, Badge } from '@/core/components/ui';
import { CalorieCircle, MacroBar } from '@/modules/meals/components';
import { useMealsStore } from '@/modules/meals/store';
import { cn } from '@/core/lib/cn';

// Helper function to get greeting based on time
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bonjour';
  if (hour < 18) return 'Bon après-midi';
  return 'Bonsoir';
}

// Helper to get first name
function getFirstName(name: string | null | undefined): string {
  if (!name) return '';
  return name.split(' ')[0];
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const { targets, getDailyNutrition, selectedDate } = useMealsStore();
  const dailyData = getDailyNutrition(selectedDate);

  const greeting = getGreeting();
  const firstName = getFirstName(session?.user?.name);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header showNotifications />

      <div className="px-4 py-6 max-w-lg mx-auto space-y-6">
        {/* Greeting */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold text-gray-900">
            {greeting}, {firstName || 'Chef'} !
          </h1>
          <p className="text-gray-500 mt-1">
            Voici votre résumé nutritionnel du jour
          </p>
        </motion.div>

        {/* Main Calorie Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card variant="elevated" padding="lg">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-500 mb-1">Calories du jour</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-gray-900">
                    {dailyData.totals.calories}
                  </span>
                  <span className="text-gray-400">/ {targets.calories} kcal</span>
                </div>
                <p className="text-sm text-emerald-600 mt-2 flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  En bonne voie !
                </p>
              </div>
              <CalorieCircle
                consumed={dailyData.totals.calories}
                target={targets.calories}
                size="md"
              />
            </div>
          </Card>
        </motion.div>

        {/* Macros */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card variant="elevated" padding="md">
            <h3 className="font-semibold text-gray-900 mb-4">Macronutriments</h3>
            <div className="space-y-4">
              <MacroBar
                label="Protéines"
                value={dailyData.totals.protein}
                max={targets.protein}
                color="protein"
              />
              <MacroBar
                label="Glucides"
                value={dailyData.totals.carbs}
                max={targets.carbs}
                color="carbs"
              />
              <MacroBar
                label="Lipides"
                value={dailyData.totals.fat}
                max={targets.fat}
                color="fat"
              />
            </div>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 gap-3"
        >
          <Link href="/meals">
            <Card
              variant="outlined"
              padding="md"
              hover
              className="h-full"
            >
              <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center mb-3">
                <Plus className="w-5 h-5 text-orange-600" />
              </div>
              <h4 className="font-semibold text-gray-900">Ajouter un repas</h4>
              <p className="text-xs text-gray-500 mt-1">
                Enregistrez ce que vous mangez
              </p>
            </Card>
          </Link>

          <Link href="/coach">
            <Card
              variant="outlined"
              padding="md"
              hover
              className="h-full"
            >
              <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center mb-3">
                <Sparkles className="w-5 h-5 text-violet-600" />
              </div>
              <h4 className="font-semibold text-gray-900">Coach IA</h4>
              <p className="text-xs text-gray-500 mt-1">
                Demandez des conseils
              </p>
            </Card>
          </Link>
        </motion.div>

        {/* Today's Meals Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card variant="elevated" padding="md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Repas du jour</h3>
              <Link
                href="/meals"
                className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                Voir tout
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {dailyData.meals.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                  <span className="text-3xl">🍽️</span>
                </div>
                <p className="text-gray-500">Aucun repas enregistré</p>
                <Link href="/meals">
                  <Button variant="outline" size="sm" className="mt-3">
                    Ajouter un repas
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {dailyData.meals.slice(0, 3).map((meal) => (
                  <div
                    key={meal.id}
                    className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">
                        {meal.mealType === 'BREAKFAST'
                          ? '🌅'
                          : meal.mealType === 'LUNCH'
                          ? '☀️'
                          : meal.mealType === 'DINNER'
                          ? '🌙'
                          : '🍎'}
                      </span>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">
                          {meal.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {meal.calories} kcal
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {dailyData.meals.length > 3 && (
                  <p className="text-sm text-gray-500 text-center pt-2">
                    +{dailyData.meals.length - 3} autres repas
                  </p>
                )}
              </div>
            )}
          </Card>
        </motion.div>

        {/* AI Insight Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card
            variant="flat"
            padding="md"
            className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">
                  Conseil du jour
                </h4>
                <p className="text-sm text-gray-600">
                  {dailyData.totals.protein < targets.protein * 0.5
                    ? 'Pensez à ajouter des protéines à vos repas pour atteindre votre objectif. Des œufs, du poulet ou des légumineuses sont d\'excellentes options !'
                    : dailyData.totals.calories < targets.calories * 0.3
                    ? 'N\'oubliez pas de prendre un bon petit-déjeuner pour bien démarrer la journée !'
                    : 'Vous êtes sur la bonne voie ! Continuez comme ça et restez hydraté.'}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Family Mode Promo (if applicable) */}
        {session?.user?.subscriptionPlan !== 'FAMILY' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card
              variant="outlined"
              padding="md"
              className="border-dashed border-violet-300 bg-violet-50/50"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-violet-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">Mode Famille</h4>
                  <p className="text-sm text-gray-500">
                    Gérez les repas de toute la famille
                  </p>
                </div>
                <Badge variant="premium">Premium</Badge>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
