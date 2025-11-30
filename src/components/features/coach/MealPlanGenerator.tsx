'use client';

import { useState, useEffect } from 'react';
import { generateMealPlan, generateFoodImage } from '@/app/actions/ai';
import { saveMealPlan } from '@/app/actions/feedback';
import { useOnboardingStore } from '@/store/onboarding-store';
import { Loader2, ChefHat, Calendar, ImageIcon, Sparkles, Star, MessageCircle } from 'lucide-react';
import Image from 'next/image';
import { MealPlanFeedbackModal } from '@/components/features/feedback/MealPlanFeedbackModal';

export function MealPlanGenerator() {
    const { profile } = useOnboardingStore();
    
    // Calcul du TDEE pour les calories recommandées
    const calculateRecommendedCalories = () => {
        if (!profile.weight || !profile.height || !profile.age || !profile.gender) return 2000;
        
        // BMR avec Mifflin-St Jeor
        let bmr: number;
        if (profile.gender === 'male') {
            bmr = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age + 5;
        } else {
            bmr = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age - 161;
        }
        
        // Multiplicateur d'activité
        const activityMultipliers: Record<string, number> = {
            'sedentary': 1.2,
            'light': 1.375,
            'moderate': 1.55,
            'active': 1.725,
            'athlete': 1.9
        };
        const multiplier = profile.activityLevel ? activityMultipliers[profile.activityLevel] : 1.55;
        let tdee = Math.round(bmr * multiplier);
        
        // Ajustement selon l'objectif
        if (profile.primaryGoal === 'weight_loss') {
            tdee -= 500;
        } else if (profile.primaryGoal === 'muscle_gain') {
            tdee += 300;
        }
        
        return tdee;
    };
    
    const [preferences, setPreferences] = useState({
        calories: calculateRecommendedCalories(),
        diet: profile.dietaryPreferences || 'balanced',
        allergies: profile.allergies?.join(', ') || '',
        goals: profile.primaryGoal || 'maintenance'
    });
    const [plan, setPlan] = useState<any>(null);
    const [mealPlanId, setMealPlanId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingImages, setLoadingImages] = useState<{ [key: string]: boolean }>({});
    const [mealImages, setMealImages] = useState<{ [key: string]: string }>({});
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);

    // Mettre à jour les préférences quand le profil change
    useEffect(() => {
        setPreferences({
            calories: calculateRecommendedCalories(),
            diet: profile.dietaryPreferences || 'balanced',
            allergies: profile.allergies?.join(', ') || '',
            goals: profile.primaryGoal || 'maintenance'
        });
    }, [profile]);

    const handleGenerate = async () => {
        setIsLoading(true);
        try {
            // Passer le profil complet à l'agent IA
            const result = await generateMealPlan(preferences, profile, 'default');
            if (result.success) {
                setPlan(result.plan);
                setMealImages({}); // Reset images on new plan
                
                // Sauvegarder le plan pour le feedback et l'apprentissage ML
                const today = new Date();
                const endDate = new Date(today);
                endDate.setDate(endDate.getDate() + 7);
                
                const saveResult = await saveMealPlan({
                    startDate: today,
                    endDate: endDate,
                    planData: result.plan,
                    userGoal: profile.primaryGoal || undefined,
                    targetCalories: preferences.calories,
                    dietType: preferences.diet,
                });
                
                if (saveResult.success && saveResult.mealPlanId) {
                    setMealPlanId(saveResult.mealPlanId);
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerateImage = async (mealName: string, mealId: string) => {
        if (mealImages[mealId] || loadingImages[mealId]) return;

        setLoadingImages(prev => ({ ...prev, [mealId]: true }));
        try {
            const result = await generateFoodImage(mealName);
            if (result.success && result.image) {
                setMealImages(prev => ({ ...prev, [mealId]: result.image! }));
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingImages(prev => ({ ...prev, [mealId]: false }));
        }
    };

    return (
        <div className="space-y-6">
            {!plan ? (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <ChefHat className="text-emerald-500" />
                        Préférences du plan
                    </h2>

                    {/* Profile-based info */}
                    {profile.name && (
                        <div className="mb-4 p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
                            <div className="flex items-center gap-2 text-emerald-700">
                                <Sparkles size={16} />
                                <span className="text-sm font-medium">
                                    Plan personnalisé pour {profile.name}
                                </span>
                            </div>
                            <p className="text-xs text-gray-600 mt-1">
                                Basé sur votre profil : {profile.primaryGoal === 'weight_loss' ? 'Perte de poids' : 
                                    profile.primaryGoal === 'muscle_gain' ? 'Prise de muscle' : 'Équilibre'}
                                {profile.cookingSkillLevel && ` • Niveau ${profile.cookingSkillLevel === 'beginner' ? 'débutant' : 
                                    profile.cookingSkillLevel === 'intermediate' ? 'intermédiaire' : 'avancé'}`}
                            </p>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Calories journalières
                                {profile.name && <span className="text-xs text-emerald-600 ml-2">(calculé selon votre profil)</span>}
                            </label>
                            <input
                                type="number"
                                value={preferences.calories}
                                onChange={(e) => setPreferences({ ...preferences, calories: parseInt(e.target.value) })}
                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Type de régime</label>
                            <select
                                value={preferences.diet}
                                onChange={(e) => setPreferences({ ...preferences, diet: e.target.value as any })}
                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                            >
                                <option value="omnivore">Omnivore</option>
                                <option value="balanced">Équilibré</option>
                                <option value="low-carb">Low Carb</option>
                                <option value="keto">Keto</option>
                                <option value="vegetarian">Végétarien</option>
                                <option value="vegan">Vegan</option>
                                <option value="pescatarian">Pescétarien</option>
                                <option value="high-protein">Riche en protéines</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Allergies / Restrictions</label>
                            <input
                                type="text"
                                value={preferences.allergies}
                                onChange={(e) => setPreferences({ ...preferences, allergies: e.target.value })}
                                placeholder="Ex: Gluten, Arachides..."
                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                            />
                        </div>

                        <button
                            onClick={handleGenerate}
                            disabled={isLoading}
                            className="w-full bg-emerald-500 text-white py-3 rounded-xl font-medium hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="animate-spin" />
                                    Génération en cours...
                                </>
                            ) : (
                                <>
                                    <Calendar size={20} />
                                    Générer le plan sur 7 jours
                                </>
                            )}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    <button
                        onClick={() => setPlan(null)}
                        className="text-sm text-gray-500 hover:text-gray-900 underline"
                    >
                        ← Modifier les préférences
                    </button>

                    {plan.days.map((day: any, index: number) => (
                        <div key={index} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="font-bold text-lg text-gray-900 mb-3">{day.day}</h3>
                            <div className="space-y-4">
                                {day.meals.map((meal: any, idx: number) => {
                                    const mealId = `${index} -${idx} `;
                                    return (
                                        <div key={idx} className="flex flex-col gap-3 p-3 bg-gray-50 rounded-xl">
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start">
                                                    <span className="text-xs font-medium uppercase text-emerald-600 tracking-wider">
                                                        {meal.type}
                                                    </span>
                                                    <span className="text-xs text-gray-500 font-medium">{meal.calories} kcal</span>
                                                </div>
                                                <p className="text-gray-800 font-medium mt-1">{meal.name}</p>
                                            </div>

                                            {mealImages[mealId] ? (
                                                <div className="relative w-full h-48 rounded-lg overflow-hidden mt-2">
                                                    <Image
                                                        src={mealImages[mealId]}
                                                        alt={meal.name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => handleGenerateImage(meal.name, mealId)}
                                                    disabled={loadingImages[mealId]}
                                                    className="self-start text-xs flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-medium"
                                                >
                                                    {loadingImages[mealId] ? (
                                                        <Loader2 size={14} className="animate-spin" />
                                                    ) : (
                                                        <ImageIcon size={14} />
                                                    )}
                                                    {loadingImages[mealId] ? 'Génération...' : 'Voir photo'}
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="pt-2 border-t flex justify-between text-sm font-medium text-gray-600">
                                <span>Total</span>
                                <span>{day.totalCalories} kcal</span>
                            </div>
                        </div>
                    ))}
                    
                    {/* Feedback Button */}
                    {mealPlanId && (
                        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-4 border border-amber-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-gray-900">Qu'avez-vous pensé de ce plan ?</p>
                                    <p className="text-sm text-gray-500">Votre avis nous aide à améliorer les suggestions</p>
                                </div>
                                <button
                                    onClick={() => setShowFeedbackModal(true)}
                                    className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl font-medium transition-colors"
                                >
                                    <Star size={18} />
                                    Donner mon avis
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
            
            {/* Feedback Modal */}
            {mealPlanId && (
                <MealPlanFeedbackModal
                    isOpen={showFeedbackModal}
                    onClose={() => setShowFeedbackModal(false)}
                    mealPlanId={mealPlanId}
                    planDays={plan?.days}
                />
            )}
        </div>
    );
}
