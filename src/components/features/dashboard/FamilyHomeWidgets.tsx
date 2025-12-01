'use client';

import { useFamilyStore } from '@/store/family-store';
import { Users, Calendar, ShoppingCart, ChefHat, TrendingUp, Heart, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { getAge } from '@/types/family';
import { useRouter } from 'next/navigation';

// Widget: Résumé Famille
export function FamilySummaryWidget() {
    const { family, members } = useFamilyStore();
    const router = useRouter();

    if (!family || members.length === 0) return null;

    const childrenCount = members.filter((m) => {
        const age = getAge(m.birthDate);
        return age < 18;
    }).length;

    const adultsCount = members.length - childrenCount;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl p-6 text-white shadow-xl cursor-pointer hover:shadow-2xl transition-all"
            onClick={() => router.push('/family')}
        >
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-2xl font-bold">{family.name}</h2>
                    <p className="text-purple-100 text-sm">
                        {adultsCount} adulte{adultsCount > 1 ? 's' : ''} • {childrenCount} enfant{childrenCount > 1 ? 's' : ''}
                    </p>
                </div>
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <Users size={28} />
                </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-4">
                {members.slice(0, 3).map((member, index) => {
                    const age = getAge(member.birthDate);
                    const roleEmoji = age < 12 ? '👶' : age < 18 ? '🧒' : member.gender === 'female' ? '👩' : '👨';

                    return (
                        <div key={member.id} className="bg-white/10 backdrop-blur-sm rounded-xl p-2 text-center">
                            <div className="text-2xl mb-1">{roleEmoji}</div>
                            <p className="text-xs font-medium truncate">{member.firstName}</p>
                        </div>
                    );
                })}
                {members.length > 3 && (
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2 text-center flex items-center justify-center">
                        <p className="text-sm font-bold">+{members.length - 3}</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
}

// Widget: Plan de Repas Actuel
export function FamilyMealPlanWidget() {
    const { activeMealPlan } = useFamilyStore();
    const router = useRouter();

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl p-6 shadow-lg border-2 border-gray-100 hover:border-purple-200 transition-all cursor-pointer"
            onClick={() => router.push(activeMealPlan ? '/family/plan' : '/family/plan')}
        >
            <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                    <Calendar size={24} className="text-white" />
                </div>
                <div className="flex-1">
                    <h3 className="font-bold text-gray-900">Plan de Repas</h3>
                    <p className="text-xs text-gray-500">Repas communs pour toute la famille</p>
                </div>
            </div>

            {activeMealPlan ? (
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Durée</span>
                        <span className="font-bold text-gray-900">7 jours</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Repas planifiés</span>
                        <span className="font-bold text-gray-900">{activeMealPlan.mealsPerDay * 7}</span>
                    </div>
                    <div className="mt-3 p-3 bg-purple-50 rounded-xl border border-purple-100">
                        <p className="text-xs text-purple-700 font-medium">
                            ✨ Portions adaptées automatiquement
                        </p>
                    </div>
                </div>
            ) : (
                <div className="text-center py-6">
                    <p className="text-gray-500 text-sm mb-3">Aucun plan actif</p>
                    <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-xl font-semibold text-sm hover:shadow-lg transition-all">
                        Créer un plan
                    </button>
                </div>
            )}
        </motion.div>
    );
}

// Widget: Liste de Courses
export function FamilyShoppingWidget() {
    const { family } = useFamilyStore();
    const router = useRouter();

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl p-6 shadow-lg border-2 border-gray-100 hover:border-green-200 transition-all cursor-pointer"
            onClick={() => router.push('/family/shopping')}
        >
            <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center">
                    <ShoppingCart size={24} className="text-white" />
                </div>
                <div className="flex-1">
                    <h3 className="font-bold text-gray-900">Liste de Courses</h3>
                    <p className="text-xs text-gray-500">Optimisée pour votre budget</p>
                </div>
            </div>

            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Budget hebdo</span>
                    <span className="font-bold text-green-600">
                        {family?.weeklyBudget ? `${family.weeklyBudget}€` : 'Non défini'}
                    </span>
                </div>

                {family?.weeklyBudget ? (
                    <div className="p-3 bg-green-50 rounded-xl border border-green-100">
                        <p className="text-xs text-green-700 font-medium">
                            🛒 Liste générée automatiquement
                        </p>
                    </div>
                ) : (
                    <button className="w-full bg-green-500 text-white py-2 rounded-xl font-semibold text-sm hover:bg-green-600 transition-all">
                        Définir un budget
                    </button>
                )}
            </div>
        </motion.div>
    );
}

// Widget: Suggestions du Coach IA
export function FamilyCoachWidget() {
    const { members } = useFamilyStore();

    // Génération de suggestions basiques pour la démo
    const suggestions = [
        {
            icon: '🥗',
            title: 'Variété nutritionnelle',
            message: 'Pensez à inclure 5 fruits et légumes différents par jour pour toute la famille',
            color: 'green',
        },
        {
            icon: '💧',
            title: 'Hydratation',
            message: `Assurez-vous que chaque membre boive suffisamment d'eau (1.5L/adulte, 1L/enfant)`,
            color: 'blue',
        },
        {
            icon: '🍽️',
            title: 'Repas en famille',
            message: 'Les repas partagés renforcent les liens familiaux et favorisent de bonnes habitudes',
            color: 'purple',
        },
    ];

    // Vérifier les allergies
    const hasAllergies = members.some((m) => m.allergies && m.allergies.length > 0);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-6 border-2 border-blue-100"
        >
            <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center">
                    <Heart size={24} className="text-white" />
                </div>
                <div className="flex-1">
                    <h3 className="font-bold text-gray-900">Coach IA Famille</h3>
                    <p className="text-xs text-gray-500">Conseils personnalisés</p>
                </div>
            </div>

            <div className="space-y-3">
                {hasAllergies && (
                    <div className="p-3 bg-red-50 rounded-xl border border-red-200 flex items-start gap-2">
                        <AlertCircle size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-xs font-semibold text-red-900">Allergies détectées</p>
                            <p className="text-xs text-red-700">Les repas générés excluront automatiquement ces allergènes</p>
                        </div>
                    </div>
                )}

                {suggestions.slice(0, 2).map((suggestion, index) => (
                    <div
                        key={index}
                        className="p-3 bg-white rounded-xl border-2 border-gray-100 hover:border-blue-200 transition-all"
                    >
                        <div className="flex items-start gap-3">
                            <span className="text-2xl">{suggestion.icon}</span>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-gray-900 mb-1">{suggestion.title}</p>
                                <p className="text-xs text-gray-600">{suggestion.message}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </motion.div>
    );
}

// Widget: Alertes Nutrition
export function FamilyNutritionAlertsWidget() {
    const { members } = useFamilyStore();

    const alerts = [];

    // Vérifier les enfants sans données complètes
    members.forEach((member) => {
        const age = getAge(member.birthDate);
        if (age < 18 && (!member.weight || !member.height)) {
            alerts.push({
                type: 'warning',
                member: member.firstName,
                message: 'Données manquantes pour un suivi optimal',
            });
        }
    });

    if (alerts.length === 0) {
        alerts.push({
            type: 'success',
            member: 'Famille',
            message: 'Tous les profils sont complets ! 🎉',
        });
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-3xl p-6 shadow-lg border-2 border-gray-100"
        >
            <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center">
                    <TrendingUp size={24} className="text-white" />
                </div>
                <div className="flex-1">
                    <h3 className="font-bold text-gray-900">Suivi Nutritionnel</h3>
                    <p className="text-xs text-gray-500">Besoins selon l'OMS</p>
                </div>
            </div>

            <div className="space-y-2">
                {alerts.map((alert, index) => (
                    <div
                        key={index}
                        className={cn(
                            'p-3 rounded-xl border-2',
                            alert.type === 'success'
                                ? 'bg-green-50 border-green-200'
                                : 'bg-orange-50 border-orange-200'
                        )}
                    >
                        <p className="text-xs font-semibold text-gray-900">{alert.member}</p>
                        <p
                            className={cn(
                                'text-xs mt-1',
                                alert.type === 'success' ? 'text-green-700' : 'text-orange-700'
                            )}
                        >
                            {alert.message}
                        </p>
                    </div>
                ))}
            </div>
        </motion.div>
    );
}
