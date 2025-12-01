'use client';

import { useState, useEffect } from 'react';
import { useFamilyStore } from '@/store/family-store';
import { Users, TrendingUp, TrendingDown, AlertTriangle, Trophy, Heart, Calendar, DollarSign, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { getAge } from '@/types/family';

export function FamilyDashboard() {
    const { family, members, activeMealPlan } = useFamilyStore();
    const [healthScore, setHealthScore] = useState(0);

    useEffect(() => {
        // Animation du score
        const timer = setTimeout(() => {
            setHealthScore(calculateFamilyHealthScore());
        }, 500);
        return () => clearTimeout(timer);
    }, [members]);

    if (!family || members.length === 0) {
        return null;
    }

    const calculateFamilyHealthScore = () => {
        // Score basique pour démo
        const hasActivePlan = activeMealPlan ? 20 : 0;
        const memberCompleteness = members.reduce((acc, m) => {
            let score = 0;
            if (m.weight && m.height) score += 10;
            if (m.targetCalories) score += 10;
            if (m.allergies || m.intolerances) score += 5;
            return acc + score;
        }, 0) / members.length;
        
        return Math.min(100, Math.round(hasActivePlan + memberCompleteness + 40));
    };

    const score = healthScore;
    const scoreColor = score >= 80 ? 'green' : score >= 60 ? 'yellow' : 'orange';
    const scoreGradient = score >= 80 
        ? 'from-green-500 to-emerald-500' 
        : score >= 60 
        ? 'from-yellow-500 to-orange-500' 
        : 'from-orange-500 to-red-500';

    return (
        <div className="space-y-6">
            {/* Header avec score */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl p-6 text-white shadow-xl"
            >
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-2xl font-bold">{family.name}</h2>
                        <p className="text-purple-100 text-sm">{members.length} membres actifs</p>
                    </div>
                    <Users size={32} className="text-white/50" />
                </div>

                {/* Score santé famille */}
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-purple-100">Score Santé Famille</span>
                        <span className="text-2xl font-bold">{score}/100</span>
                    </div>
                    
                    {/* Barre de progression */}
                    <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${score}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className={`h-full bg-gradient-to-r ${scoreGradient} shadow-lg`}
                        />
                    </div>
                    
                    <p className="text-xs text-purple-100 mt-2">
                        {score >= 80 ? '🎉 Excellent ! Continuez comme ça' : 
                         score >= 60 ? '👍 Bon suivi, quelques améliorations possibles' : 
                         '💪 Commencez votre suivi pour améliorer votre score'}
                    </p>
                </div>
            </motion.div>

            {/* Membres - Cartes rapides */}
            <div>
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Heart size={18} className="text-pink-500" />
                    Vos Membres
                </h3>
                
                <div className="grid grid-cols-2 gap-3">
                    {members.slice(0, 4).map((member, index) => {
                        const age = getAge(member.birthDate);
                        const roleEmoji = member.role === 'parent' || member.role === 'admin' ? '👨' : 
                                         member.role === 'child' ? '👶' : 
                                         member.role === 'teen' ? '🧒' : '👴';

                        return (
                            <motion.div
                                key={member.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white rounded-2xl p-4 border-2 border-gray-100 hover:border-purple-200 transition-all"
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                        {roleEmoji}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-gray-900 truncate">{member.firstName}</p>
                                        <p className="text-xs text-gray-500">{age} ans</p>
                                    </div>
                                </div>
                                
                                {member.targetCalories && (
                                    <div className="bg-gray-50 rounded-lg px-2 py-1">
                                        <p className="text-xs text-gray-600">
                                            <span className="font-medium text-gray-900">{member.targetCalories}</span> kcal/jour
                                        </p>
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Stats rapides */}
            <div>
                <h3 className="font-bold text-gray-900 mb-3">Vue d'ensemble</h3>
                
                <div className="grid grid-cols-2 gap-3">
                    {/* Plan actif */}
                    <div className="bg-white rounded-2xl p-4 border-2 border-gray-100">
                        <div className="flex items-center gap-2 mb-2">
                            <Calendar size={16} className="text-indigo-500" />
                            <span className="text-xs text-gray-600 font-medium">Plan Actif</span>
                        </div>
                        <p className="text-xl font-bold text-gray-900">
                            {activeMealPlan ? '7 jours' : 'Aucun'}
                        </p>
                        {activeMealPlan && (
                            <p className="text-xs text-gray-500 mt-1">
                                {activeMealPlan.mealsPerDay * 7} repas planifiés
                            </p>
                        )}
                    </div>

                    {/* Budget */}
                    <div className="bg-white rounded-2xl p-4 border-2 border-gray-100">
                        <div className="flex items-center gap-2 mb-2">
                            <DollarSign size={16} className="text-green-500" />
                            <span className="text-xs text-gray-600 font-medium">Budget</span>
                        </div>
                        <p className="text-xl font-bold text-gray-900">
                            {family.weeklyBudget ? `${family.weeklyBudget}€` : 'Non défini'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">par semaine</p>
                    </div>
                </div>
            </div>

            {/* Alertes nutritionnelles */}
            <AlertsSection members={members} />

            {/* Actions rapides */}
            <div>
                <h3 className="font-bold text-gray-900 mb-3">Actions Rapides</h3>
                
                <div className="grid grid-cols-2 gap-3">
                    <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl p-4 font-semibold shadow-md hover:shadow-lg transition-all text-sm">
                        <Calendar className="mx-auto mb-2" size={20} />
                        Nouveau Plan
                    </button>
                    
                    <button className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl p-4 font-semibold shadow-md hover:shadow-lg transition-all text-sm">
                        <Users className="mx-auto mb-2" size={20} />
                        Ajouter Membre
                    </button>
                </div>
            </div>
        </div>
    );
}

// Composant pour les alertes nutritionnelles
function AlertsSection({ members }: { members: any[] }) {
    const alerts = [];

    // Exemple: enfants sans poids/taille
    members.forEach((member) => {
        const age = getAge(member.birthDate);
        if (age < 18 && (!member.weight || !member.height)) {
            alerts.push({
                type: 'warning',
                icon: AlertTriangle,
                color: 'orange',
                title: `${member.firstName}`,
                message: 'Ajoutez poids et taille pour un suivi optimal',
            });
        }
    });

    // Ajouter une alerte positive si tout va bien
    if (alerts.length === 0) {
        alerts.push({
            type: 'success',
            icon: Trophy,
            color: 'green',
            title: 'Profils complets',
            message: 'Tous les membres ont des profils à jour !',
        });
    }

    if (alerts.length === 0) return null;

    return (
        <div>
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Award size={18} className="text-yellow-500" />
                Alertes & Conseils
            </h3>
            
            <div className="space-y-2">
                {alerts.slice(0, 2).map((alert, index) => {
                    const Icon = alert.icon;
                    const bgColor = alert.color === 'green' ? 'bg-green-50' : 
                                   alert.color === 'orange' ? 'bg-orange-50' : 'bg-blue-50';
                    const textColor = alert.color === 'green' ? 'text-green-700' : 
                                     alert.color === 'orange' ? 'text-orange-700' : 'text-blue-700';
                    const iconColor = alert.color === 'green' ? 'text-green-500' : 
                                     alert.color === 'orange' ? 'text-orange-500' : 'text-blue-500';

                    return (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={cn(
                                "p-3 rounded-xl border-2 flex items-start gap-3",
                                bgColor,
                                alert.color === 'green' ? 'border-green-200' : 
                                alert.color === 'orange' ? 'border-orange-200' : 'border-blue-200'
                            )}
                        >
                            <Icon size={18} className={cn("flex-shrink-0 mt-0.5", iconColor)} />
                            <div className="flex-1 min-w-0">
                                <p className={cn("font-medium text-sm", textColor)}>{alert.title}</p>
                                <p className={cn("text-xs mt-0.5", textColor, "opacity-80")}>{alert.message}</p>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}


