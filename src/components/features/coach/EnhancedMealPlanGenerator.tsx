'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { generateWeeklyPlanWithDetails, generateShoppingList, regenerateDayPlan } from '@/app/actions/weekly-planner';
import { saveMealPlan } from '@/app/actions/feedback';
import { Loader2, ChefHat, ShoppingCart, Download, Calendar, Flame, RefreshCw, Star, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MealCard } from './MealCard';
import { useOnboardingStore } from '@/store/onboarding-store';
import { MealPlanFeedbackModal } from '@/components/features/feedback/MealPlanFeedbackModal';
import { exportWeeklyPlanToPDF } from '@/lib/pdf-export';

export function EnhancedMealPlanGenerator() {
    const router = useRouter();
    const { profile } = useOnboardingStore();
    const [isGenerating, setIsGenerating] = useState(false);
    const [weeklyPlan, setWeeklyPlan] = useState<any>(null);
    const [mealPlanId, setMealPlanId] = useState<string | null>(null);
    const [shoppingList, setShoppingList] = useState<any>(null);
    const [isGeneratingList, setIsGeneratingList] = useState(false);
    const [activeDay, setActiveDay] = useState(0);
    const [regeneratingDay, setRegeneratingDay] = useState<number | null>(null);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [planStartDate] = useState(() => new Date()); // Date de début du plan
    const [mealStatuses, setMealStatuses] = useState<Record<string, 'validated' | 'skipped' | 'moved'>>({});

    // Filters
    const [dietType, setDietType] = useState<string>(profile.dietaryPreferences || 'balanced');
    const [dailyCalories, setDailyCalories] = useState(2000);
    const [allergies, setAllergies] = useState<string[]>(profile.allergies || []);
    const [showFilters, setShowFilters] = useState(false);
    const [includeCheatMeal, setIncludeCheatMeal] = useState(false);
    const [showImages] = useState(false); // Images désactivées pour le plan 7 jours (économie de coûts)

    const handleGeneratePlan = async () => {
        setIsGenerating(true);
        setWeeklyPlan(null);
        setShoppingList(null);
        setMealPlanId(null);

        try {
            const preferences = {
                dailyCalories,
                proteins: Math.round(dailyCalories * 0.3 / 4),
                carbs: Math.round(dailyCalories * 0.4 / 4),
                fats: Math.round(dailyCalories * 0.3 / 9),
                dietType,
                allergies,
                includeCheatMeal,
                cookingSkillLevel: profile.cookingSkillLevel,
                cookingTimeWeekday: profile.cookingTimeWeekday,
                cookingTimeWeekend: profile.cookingTimeWeekend,
                // Jeûne intermittent depuis le profil
                fastingSchedule: profile.fastingSchedule,
            };

            const result = await generateWeeklyPlanWithDetails(preferences);

            if (result.success && result.plan) {
                setWeeklyPlan(result.plan);

                // Sauvegarder une version légère du plan pour le feedback ML
                // (sans les instructions et ingrédients détaillés pour éviter de dépasser la limite)
                const today = new Date();
                const endDate = new Date(today);
                endDate.setDate(endDate.getDate() + 7);

                // Créer une version simplifiée du plan
                const lightPlanData = {
                    days: result.plan.days.map((day: any) => ({
                        day: day.day,
                        totalCalories: day.totalCalories,
                        meals: day.meals.map((meal: any) => ({
                            type: meal.type,
                            name: meal.name,
                            calories: meal.calories,
                            proteins: meal.proteins,
                            recipeId: meal.recipeId,
                        })),
                    })),
                };

                const saveResult = await saveMealPlan({
                    startDate: today,
                    endDate: endDate,
                    planData: lightPlanData,
                    userGoal: profile.primaryGoal || undefined,
                    targetCalories: dailyCalories,
                    dietType: dietType,
                });

                if (saveResult.success && saveResult.mealPlanId) {
                    setMealPlanId(saveResult.mealPlanId);
                }
            }
        } catch (error) {
            console.error("Error generating plan:", error);
        } finally {
            setIsGenerating(false);
        }
    };

    // Régénérer un jour spécifique
    const handleRegenerateDay = async (dayIndex: number) => {
        if (!weeklyPlan) return;
        setRegeneratingDay(dayIndex);

        try {
            const preferences = {
                dailyCalories,
                proteins: Math.round(dailyCalories * 0.3 / 4),
                carbs: Math.round(dailyCalories * 0.4 / 4),
                fats: Math.round(dailyCalories * 0.3 / 9),
                dietType,
                allergies,
                cookingSkillLevel: profile.cookingSkillLevel,
                cookingTimeWeekday: profile.cookingTimeWeekday,
                cookingTimeWeekend: profile.cookingTimeWeekend,
                fastingSchedule: profile.fastingSchedule,
            };

            const result = await regenerateDayPlan(dayIndex, preferences, weeklyPlan);

            if (result.success && result.dayPlan) {
                // Mettre à jour le plan avec le nouveau jour
                const updatedPlan = { ...weeklyPlan };
                updatedPlan.days[dayIndex] = result.dayPlan;
                setWeeklyPlan(updatedPlan);
            }
        } catch (error) {
            console.error("Error regenerating day:", error);
        } finally {
            setRegeneratingDay(null);
        }
    };

    const handleGenerateShoppingList = async () => {
        if (!weeklyPlan) return;
        setIsGeneratingList(true);
        try {
            const result = await generateShoppingList(weeklyPlan);
            if (result.success && result.shoppingList) {
                setShoppingList(result.shoppingList);
            }
        } catch (error) {
            console.error("Error generating shopping list:", error);
        } finally {
            setIsGeneratingList(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-4 py-4">
                    <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <ChefHat className="text-emerald-600" />
                        Planificateur
                    </h1>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 py-6">
                {!weeklyPlan ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center space-y-8 py-12"
                    >
                        <div className="relative w-32 h-32 mx-auto mb-6">
                            <div className="absolute inset-0 bg-emerald-100 rounded-full animate-pulse"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Calendar className="w-16 h-16 text-emerald-600" />
                            </div>
                        </div>

                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">Votre plan 7 jours</h2>
                            <p className="text-gray-500 max-w-md mx-auto">
                                Générez un plan de repas équilibré sur 7 jours, à commencer quand vous voulez.
                            </p>
                        </div>

                        <div className="max-w-md mx-auto bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-semibold text-gray-900">Préférences</h3>
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className="text-emerald-600 text-sm font-medium"
                                >
                                    {showFilters ? 'Masquer' : 'Modifier'}
                                </button>
                            </div>

                            <AnimatePresence>
                                {showFilters && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="space-y-4 mb-6 overflow-hidden"
                                    >
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Calories: {dailyCalories} kcal</label>
                                            <input
                                                type="range"
                                                min="1200"
                                                max="3500"
                                                step="100"
                                                value={dailyCalories}
                                                onChange={(e) => setDailyCalories(parseInt(e.target.value))}
                                                className="w-full accent-emerald-600"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Régime</label>
                                            <select
                                                value={dietType}
                                                onChange={(e) => setDietType(e.target.value)}
                                                className="w-full p-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                                            >
                                                <option value="balanced">Équilibré</option>
                                                <option value="vegetarian">Végétarien</option>
                                                <option value="vegan">Végétalien</option>
                                                <option value="keto">Keto</option>
                                            </select>
                                        </div>

                                        {/* Cheat Meal Toggle */}
                                        <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl border border-orange-100">
                                            <div className="bg-white p-2 rounded-lg shadow-sm">
                                                <Flame className="text-orange-500" size={20} />
                                            </div>
                                            <div className="flex-1 text-left">
                                                <label htmlFor="cheat-meal" className="font-bold text-gray-900 text-sm cursor-pointer block">
                                                    Cheat Meal Hebdo
                                                </label>
                                                <p className="text-xs text-orange-700">Un repas plaisir sans culpabilité !</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    id="cheat-meal"
                                                    checked={includeCheatMeal}
                                                    onChange={(e) => setIncludeCheatMeal(e.target.checked)}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                                            </label>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <button
                                onClick={handleGeneratePlan}
                                disabled={isGenerating}
                                className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold text-lg hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-lg shadow-emerald-200 flex items-center justify-center gap-2"
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 className="animate-spin" />
                                        Génération en cours...
                                    </>
                                ) : (
                                    <>
                                        <ChefHat />
                                        Générer mon plan 7 jours
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                ) : (
                    <div className="space-y-6">
                        {/* Actions Bar */}
                        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                            <button
                                onClick={handleGenerateShoppingList}
                                disabled={isGeneratingList}
                                className="whitespace-nowrap bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-full font-medium hover:bg-gray-50 flex items-center gap-2"
                            >
                                {isGeneratingList ? <Loader2 size={16} className="animate-spin" /> : <ShoppingCart size={16} />}
                                Liste de courses
                            </button>
                            <button
                                onClick={() => {
                                    try {
                                        if (!weeklyPlan) {
                                            alert('Aucun plan disponible pour l\'export');
                                            return;
                                        }
                                        exportWeeklyPlanToPDF(weeklyPlan, shoppingList);
                                    } catch (error) {
                                        console.error('Erreur lors de l\'export PDF:', error);
                                        alert('Erreur lors de l\'export PDF. Veuillez réessayer.');
                                    }
                                }}
                                disabled={!weeklyPlan}
                                className="whitespace-nowrap bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-full font-medium hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Download size={16} />
                                PDF
                            </button>
                            <button
                                onClick={handleGeneratePlan}
                                className="whitespace-nowrap bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-full font-medium hover:bg-gray-50 flex items-center gap-2"
                            >
                                <ChefHat size={16} />
                                Régénérer
                            </button>
                        </div>

                        {/* Shopping List Modal/Overlay */}
                        {shoppingList && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                            >
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-bold text-lg">Liste de courses</h3>
                                    <button onClick={() => setShoppingList(null)} className="text-gray-400 hover:text-gray-600">Fermer</button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {shoppingList.categories.map((category: any, idx: number) => (
                                        <div key={idx}>
                                            <h4 className="font-medium text-emerald-600 mb-2">{category.name}</h4>
                                            <ul className="space-y-1 text-sm text-gray-600">
                                                {category.items.map((item: string, i: number) => (
                                                    <li key={i} className="flex items-start gap-2">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-gray-300 mt-1.5 shrink-0"></span>
                                                        {item}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* Days Navigation */}
                        <div className="flex overflow-x-auto gap-2 pb-2 no-scrollbar">
                            {weeklyPlan.days.map((day: any, idx: number) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveDay(idx)}
                                    className={`flex-shrink-0 px-4 py-2 rounded-full font-medium transition-all ${activeDay === idx
                                        ? 'bg-emerald-600 text-white shadow-md'
                                        : 'bg-white text-gray-500 hover:bg-gray-50'
                                        }`}
                                >
                                    {day.day}
                                </button>
                            ))}
                        </div>

                        {/* Active Day Content */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeDay}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                                className="space-y-4"
                            >
                                <div className="flex justify-between items-center px-2">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900">{weeklyPlan.days[activeDay].day}</h2>
                                        <p className="text-gray-500 text-sm">
                                            {weeklyPlan.days[activeDay].meals.filter((m: any) => !m.isFasting).length} repas • {weeklyPlan.days[activeDay].totalCalories} kcal
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleRegenerateDay(activeDay)}
                                        disabled={regeneratingDay === activeDay}
                                        className="flex items-center gap-2 px-3 py-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors text-sm font-medium disabled:opacity-50"
                                    >
                                        {regeneratingDay === activeDay ? (
                                            <Loader2 size={16} className="animate-spin" />
                                        ) : (
                                            <RefreshCw size={16} />
                                        )}
                                        Régénérer ce jour
                                    </button>
                                </div>

                                <div className="grid gap-4">
                                    {weeklyPlan.days[activeDay].meals.map((meal: any, idx: number) => {
                                        // Calculer la date du jour actif
                                        const mealDate = new Date(planStartDate);
                                        mealDate.setDate(mealDate.getDate() + activeDay);
                                        
                                        return (
                                            <MealCard 
                                                key={`${activeDay}-${idx}`} 
                                                meal={meal} 
                                                showImages={showImages}
                                                showActions={true}
                                                mealDate={mealDate}
                                                dayIndex={activeDay}
                                                mealPlanId={mealPlanId || undefined}
                                                onMealStatusChange={(status, mealId) => {
                                                    setMealStatuses(prev => ({
                                                        ...prev,
                                                        [`${activeDay}-${idx}`]: status,
                                                    }));
                                                }}
                                            />
                                        );
                                    })}
                                </div>
                            </motion.div>
                        </AnimatePresence>

                        {/* Feedback Section */}
                        {mealPlanId && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-5 border border-amber-200 mt-6"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                            <MessageCircle size={18} className="text-amber-600" />
                                            Votre avis compte !
                                        </h3>
                                        <p className="text-sm text-gray-600 mt-1">
                                            Aidez-nous à améliorer vos futurs plans avec vos retours
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setShowFeedbackModal(true)}
                                        className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2.5 rounded-xl font-medium transition-colors shadow-md"
                                    >
                                        <Star size={18} />
                                        Noter ce plan
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </div>
                )}
            </div>

            {/* Feedback Modal */}
            {mealPlanId && (
                <MealPlanFeedbackModal
                    isOpen={showFeedbackModal}
                    onClose={() => setShowFeedbackModal(false)}
                    mealPlanId={mealPlanId}
                    planDays={weeklyPlan?.days}
                />
            )}
        </div>
    );
}
