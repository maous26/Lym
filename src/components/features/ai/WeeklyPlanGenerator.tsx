'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  Calendar,
  Sparkles,
  Loader2,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Check,
  Clock,
  Flame,
  ShoppingCart,
  Download,
  AlertCircle,
  Utensils,
  Cookie,
} from 'lucide-react';
import { generateWeeklyPlanWithDetails, regenerateDayPlan, generateShoppingList } from '@/app/actions/weekly-planner';
import type { WeeklyPlanPreferences, WeeklyPlan, MealPlanDay, MealPlanMeal } from '@/app/actions/weekly-planner';
import { useUserStore, useSoloProfile } from '@/store/user-store';

interface WeeklyPlanGeneratorProps {
  onPlanGenerated?: (plan: WeeklyPlan) => void;
  className?: string;
}

const mealTypeLabels: Record<string, string> = {
  breakfast: 'Petit-déjeuner',
  lunch: 'Déjeuner',
  snack: 'Collation',
  dinner: 'Dîner',
};

const mealTypeEmojis: Record<string, string> = {
  breakfast: '🥐',
  lunch: '🍽️',
  snack: '🍎',
  dinner: '🌙',
};

export function WeeklyPlanGenerator({ onPlanGenerated, className }: WeeklyPlanGeneratorProps) {
  const profile = useSoloProfile();
  const nutritionalNeeds = profile?.nutritionalNeeds;

  const [isGenerating, setIsGenerating] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState<number | null>(null);
  const [isGeneratingShoppingList, setIsGeneratingShoppingList] = useState(false);
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlan | null>(null);
  const [shoppingList, setShoppingList] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const [showShoppingList, setShowShoppingList] = useState(false);

  // Preferences
  const [includeCheatMeal, setIncludeCheatMeal] = useState(true);

  const getPreferences = (): WeeklyPlanPreferences => {
    return {
      dailyCalories: nutritionalNeeds?.calories || 2000,
      proteins: nutritionalNeeds?.proteins || 75,
      carbs: nutritionalNeeds?.carbs || 250,
      fats: nutritionalNeeds?.fats || 65,
      dietType: profile?.dietType,
      allergies: profile?.allergies,
      goals: profile?.goal,
      includeCheatMeal,
      cookingSkillLevel: profile?.cookingSkillLevel,
      cookingTimeWeekday: profile?.cookingTimeWeekday,
      cookingTimeWeekend: profile?.cookingTimeWeekend,
      fastingSchedule: profile?.fastingSchedule,
      weeklyBudget: profile?.weeklyBudget,
      pricePreference: profile?.pricePreference,
    };
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    setWeeklyPlan(null);
    setShoppingList(null);

    try {
      const preferences = getPreferences();
      const result = await generateWeeklyPlanWithDetails(preferences, profile || undefined);

      if (result.success && result.plan) {
        setWeeklyPlan(result.plan);
        onPlanGenerated?.(result.plan);
      } else {
        setError(result.error || 'Erreur lors de la génération');
      }
    } catch (err) {
      console.error('Generation error:', err);
      setError('Une erreur est survenue. Réessayez.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerateDay = async (dayIndex: number) => {
    if (!weeklyPlan) return;

    setIsRegenerating(dayIndex);
    try {
      const preferences = getPreferences();
      const result = await regenerateDayPlan(dayIndex, preferences, weeklyPlan, profile || undefined);

      if (result.success && result.dayPlan) {
        const newPlan = {
          ...weeklyPlan,
          days: weeklyPlan.days.map((d, i) => (i === dayIndex ? result.dayPlan! : d)),
        };
        setWeeklyPlan(newPlan);
        onPlanGenerated?.(newPlan);
      }
    } catch (err) {
      console.error('Regeneration error:', err);
    } finally {
      setIsRegenerating(null);
    }
  };

  const handleGenerateShoppingList = async () => {
    if (!weeklyPlan) return;

    setIsGeneratingShoppingList(true);
    try {
      const result = await generateShoppingList(weeklyPlan, profile?.weeklyBudget);
      if (result.success && result.shoppingList) {
        setShoppingList(result.shoppingList);
        setShowShoppingList(true);
      }
    } catch (err) {
      console.error('Shopping list error:', err);
    } finally {
      setIsGeneratingShoppingList(false);
    }
  };

  const toggleDay = (index: number) => {
    setExpandedDay(expandedDay === index ? null : index);
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
          <Calendar className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-stone-800">Plan Repas 7 Jours</h2>
        <p className="text-sm text-stone-500">
          Génération automatique adaptée à votre profil
        </p>
      </div>

      {/* Options */}
      {!weeklyPlan && !isGenerating && (
        <div className="bg-white rounded-2xl p-4 border border-stone-200 space-y-4">
          <h3 className="font-semibold text-stone-700">Options</h3>

          {/* Cheat meal toggle */}
          <label className="flex items-center justify-between cursor-pointer">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🍔</span>
              <div>
                <p className="font-medium text-stone-700">Cheat Meal</p>
                <p className="text-xs text-stone-500">Un repas plaisir dans la semaine</p>
              </div>
            </div>
            <div
              onClick={() => setIncludeCheatMeal(!includeCheatMeal)}
              className={cn(
                'w-12 h-6 rounded-full transition-colors relative',
                includeCheatMeal ? 'bg-purple-500' : 'bg-stone-300'
              )}
            >
              <motion.div
                animate={{ x: includeCheatMeal ? 24 : 2 }}
                className="absolute top-1 w-4 h-4 rounded-full bg-white shadow"
              />
            </div>
          </label>

          {/* Profile info */}
          <div className="bg-purple-50 rounded-xl p-3 space-y-2">
            <p className="text-xs font-medium text-purple-700">Basé sur votre profil :</p>
            <div className="grid grid-cols-2 gap-2 text-xs text-purple-600">
              <span>Calories : {nutritionalNeeds?.calories || 2000} kcal</span>
              <span>Régime : {profile?.dietType || 'Équilibré'}</span>
              <span>Niveau : {profile?.cookingSkillLevel || 'Intermédiaire'}</span>
              {profile?.fastingSchedule?.type !== 'none' && (
                <span>Jeûne : {profile?.fastingSchedule?.type}</span>
              )}
            </div>
          </div>

          {/* Generate button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold flex items-center justify-center gap-2 shadow-lg"
          >
            <Sparkles className="w-5 h-5" />
            Générer mon plan
          </motion.button>
        </div>
      )}

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 p-4 rounded-xl bg-red-50 text-red-700"
          >
            <AlertCircle className="w-5 h-5" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading state */}
      {isGenerating && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-2xl p-8 border border-stone-200 text-center space-y-4"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto"
          >
            <Utensils className="w-10 h-10 text-white" />
          </motion.div>
          <div>
            <p className="font-semibold text-stone-700">Préparation de vos repas...</p>
            <p className="text-sm text-stone-500">28 repas pour 7 jours</p>
          </div>
          <div className="flex justify-center gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                className="w-2 h-2 rounded-full bg-purple-500"
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* Weekly plan */}
      {weeklyPlan && !isGenerating && (
        <div className="space-y-4">
          {/* Actions */}
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setWeeklyPlan(null);
                setShoppingList(null);
              }}
              className="flex-1 py-2.5 rounded-xl border border-stone-200 text-stone-600 font-medium text-sm flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Nouveau plan
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGenerateShoppingList}
              disabled={isGeneratingShoppingList}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-md"
            >
              {isGeneratingShoppingList ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ShoppingCart className="w-4 h-4" />
              )}
              Liste courses
            </motion.button>
          </div>

          {/* Days */}
          <div className="space-y-3">
            {weeklyPlan.days.map((day, dayIndex) => (
              <motion.div
                key={day.day}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: dayIndex * 0.1 }}
                className="bg-white rounded-2xl border border-stone-200 overflow-hidden"
              >
                {/* Day header */}
                <button
                  onClick={() => toggleDay(dayIndex)}
                  className="w-full p-4 flex items-center justify-between hover:bg-stone-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm',
                        dayIndex >= 5
                          ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white'
                          : 'bg-stone-100 text-stone-700'
                      )}
                    >
                      {day.day.slice(0, 2)}
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-stone-800">{day.day}</p>
                      <p className="text-xs text-stone-500">
                        {day.totalCalories} kcal • {day.meals.length} repas
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {day.meals.some((m) => m.isCheatMeal) && (
                      <span className="px-2 py-1 rounded-lg bg-orange-100 text-orange-600 text-xs font-medium">
                        🍔 Cheat
                      </span>
                    )}
                    {expandedDay === dayIndex ? (
                      <ChevronUp className="w-5 h-5 text-stone-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-stone-400" />
                    )}
                  </div>
                </button>

                {/* Day meals */}
                <AnimatePresence>
                  {expandedDay === dayIndex && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-stone-100 overflow-hidden"
                    >
                      <div className="p-4 space-y-3">
                        {day.meals.map((meal, mealIndex) => (
                          <MealCard key={mealIndex} meal={meal} />
                        ))}

                        {/* Regenerate day button */}
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleRegenerateDay(dayIndex)}
                          disabled={isRegenerating === dayIndex}
                          className="w-full py-2 rounded-xl border border-dashed border-purple-200 text-purple-600 font-medium text-sm flex items-center justify-center gap-2 hover:bg-purple-50 transition-colors"
                        >
                          {isRegenerating === dayIndex ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <RefreshCw className="w-4 h-4" />
                          )}
                          Régénérer ce jour
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Shopping list modal */}
      <AnimatePresence>
        {showShoppingList && shoppingList && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4"
            onClick={() => setShowShoppingList(false)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl w-full max-w-lg max-h-[80vh] overflow-hidden"
            >
              <div className="p-4 border-b border-stone-100 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg text-stone-800">Liste de courses</h3>
                  <p className="text-sm text-stone-500">
                    Estimé : {shoppingList.totalEstimate}€
                  </p>
                </div>
                <button
                  onClick={() => setShowShoppingList(false)}
                  className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-500"
                >
                  ×
                </button>
              </div>

              <div className="p-4 overflow-y-auto max-h-[60vh] space-y-4">
                {shoppingList.categories?.map((cat: any, idx: number) => (
                  <div key={idx}>
                    <h4 className="font-semibold text-stone-700 mb-2 flex items-center justify-between">
                      {cat.name}
                      <span className="text-sm text-stone-400">{cat.subtotal}€</span>
                    </h4>
                    <ul className="space-y-1">
                      {cat.items?.map((item: any, iIdx: number) => (
                        <li key={iIdx} className="text-sm text-stone-600 flex items-center justify-between">
                          <span className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                            {item.name} ({item.quantity})
                          </span>
                          <span className="text-stone-400">{item.priceEstimate}€</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}

                {shoppingList.savingsTips?.length > 0 && (
                  <div className="bg-green-50 rounded-xl p-3">
                    <h5 className="font-medium text-green-700 mb-2">Astuces économies</h5>
                    <ul className="space-y-1">
                      {shoppingList.savingsTips.map((tip: string, idx: number) => (
                        <li key={idx} className="text-sm text-green-600">• {tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Meal card component
function MealCard({ meal }: { meal: MealPlanMeal }) {
  return (
    <div
      className={cn(
        'p-3 rounded-xl border',
        meal.isFasting
          ? 'bg-stone-50 border-stone-200'
          : meal.isCheatMeal
          ? 'bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200'
          : 'bg-white border-stone-100'
      )}
    >
      <div className="flex items-start gap-3">
        <div className="text-2xl">{mealTypeEmojis[meal.type]}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium text-stone-700 text-sm truncate">{meal.name}</p>
            {meal.isCheatMeal && (
              <Cookie className="w-4 h-4 text-orange-500" />
            )}
          </div>
          <p className="text-xs text-stone-400">{mealTypeLabels[meal.type]}</p>
          {meal.description && (
            <p className="text-xs text-stone-500 mt-1 line-clamp-1">{meal.description}</p>
          )}
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-purple-600">{meal.calories} kcal</p>
          {!meal.isFasting && (
            <p className="text-xs text-stone-400 flex items-center gap-1 justify-end">
              <Clock className="w-3 h-3" />
              {meal.prepTime} min
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default WeeklyPlanGenerator;
