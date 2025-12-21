'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  Users,
  Calendar,
  ShoppingCart,
  Trophy,
  Heart,
  AlertTriangle,
  Award,
  DollarSign,
  TrendingUp,
  Plus,
} from 'lucide-react';
import { useFamilyStore, useFamilyMembers, useFamily } from '@/store/family-store';
import { getAge, getAgeCategory } from '@/types/family';
import type { FamilyMember } from '@/types/family';

// Role emoji mapping
const getRoleEmoji = (role: string, ageCategory: string): string => {
  if (role === 'admin' || role === 'parent') {
    return '👨‍👩';
  }
  switch (ageCategory) {
    case 'infant':
      return '👶';
    case 'child':
      return '🧒';
    case 'teen':
      return '👦';
    case 'senior':
      return '👴';
    default:
      return '👤';
  }
};

// Member card component
const MemberCard = ({ member, index }: { member: FamilyMember; index: number }) => {
  const age = getAge(member.birthDate);
  const emoji = getRoleEmoji(member.role, member.ageCategory);
  const hasAllergies = member.allergies.length > 0 || member.intolerances.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-2xl p-4 border border-stone-100 hover:border-purple-200 hover:shadow-md transition-all"
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-2xl shadow-sm">
          {emoji}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-stone-800 truncate">{member.firstName}</p>
          <p className="text-xs text-stone-500">
            {age} ans · {member.role === 'admin' ? 'Admin' : member.role === 'parent' ? 'Parent' : 'Membre'}
          </p>
        </div>
      </div>

      {/* Nutritional needs summary */}
      {member.nutritionalNeeds && (
        <div className="flex items-center gap-2 text-xs text-stone-500 mb-2">
          <span className="font-medium text-amber-600">
            {member.nutritionalNeeds.calories} kcal
          </span>
          <span>·</span>
          <span>P: {member.nutritionalNeeds.proteins}g</span>
        </div>
      )}

      {/* Allergy warning */}
      {hasAllergies && (
        <div className="bg-red-50 rounded-lg px-2 py-1.5 flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
          <span className="text-xs text-red-700 font-medium">
            {member.allergies.length + member.intolerances.length} allergie(s)
          </span>
        </div>
      )}
    </motion.div>
  );
};

// Alert item component
const AlertItem = ({
  icon: Icon,
  title,
  message,
  color,
  index,
}: {
  icon: React.ElementType;
  title: string;
  message: string;
  color: 'green' | 'orange' | 'red' | 'blue';
  index: number;
}) => {
  const colors = {
    green: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: 'text-green-500',
      text: 'text-green-700',
    },
    orange: {
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      icon: 'text-orange-500',
      text: 'text-orange-700',
    },
    red: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: 'text-red-500',
      text: 'text-red-700',
    },
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: 'text-blue-500',
      text: 'text-blue-700',
    },
  };

  const c = colors[color];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className={cn('p-3 rounded-xl border-2 flex items-start gap-3', c.bg, c.border)}
    >
      <Icon className={cn('w-5 h-5 flex-shrink-0 mt-0.5', c.icon)} />
      <div className="flex-1 min-w-0">
        <p className={cn('font-medium text-sm', c.text)}>{title}</p>
        <p className={cn('text-xs mt-0.5 opacity-80', c.text)}>{message}</p>
      </div>
    </motion.div>
  );
};

export function FamilyDashboard() {
  const family = useFamily();
  const members = useFamilyMembers();
  const { activeMealPlan, activeChallenges } = useFamilyStore();
  const [healthScore, setHealthScore] = useState(0);

  // Calculate family health score
  useEffect(() => {
    if (members.length === 0) return;

    const timer = setTimeout(() => {
      let score = 40; // Base score

      // Points for active meal plan
      if (activeMealPlan) score += 20;

      // Points for complete member profiles
      const profileCompleteness = members.reduce((acc, m) => {
        let memberScore = 0;
        if (m.weight && m.height) memberScore += 10;
        if (m.nutritionalNeeds?.calories) memberScore += 10;
        if (m.allergies.length > 0 || m.intolerances.length > 0) memberScore += 5;
        return acc + memberScore;
      }, 0) / members.length;

      score += Math.min(40, profileCompleteness);

      setHealthScore(Math.min(100, Math.round(score)));
    }, 500);

    return () => clearTimeout(timer);
  }, [members, activeMealPlan]);

  if (!family || members.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="w-16 h-16 text-stone-300 mx-auto mb-4" />
        <h3 className="font-semibold text-stone-700 mb-2">Aucune famille</h3>
        <p className="text-sm text-stone-500">Créez votre famille pour commencer</p>
      </div>
    );
  }

  // Generate alerts based on members
  const alerts = [];
  members.forEach((member) => {
    const age = getAge(member.birthDate);
    if (age < 18 && (!member.weight || !member.height)) {
      alerts.push({
        type: 'warning' as const,
        icon: AlertTriangle,
        color: 'orange' as const,
        title: member.firstName,
        message: 'Ajoutez poids et taille pour un suivi optimal',
      });
    }
  });

  if (alerts.length === 0) {
    alerts.push({
      type: 'success' as const,
      icon: Trophy,
      color: 'green' as const,
      title: 'Profils complets',
      message: 'Tous les membres ont des profils à jour !',
    });
  }

  const scoreGradient =
    healthScore >= 80
      ? 'from-green-500 to-emerald-500'
      : healthScore >= 60
      ? 'from-yellow-500 to-orange-500'
      : 'from-orange-500 to-red-500';

  return (
    <div className="space-y-6">
      {/* Family header with score */}
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
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Health score */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-purple-100">Score Santé Famille</span>
            <span className="text-2xl font-bold">{healthScore}/100</span>
          </div>

          {/* Progress bar */}
          <div className="h-3 bg-white/20 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${healthScore}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className={cn('h-full rounded-full bg-gradient-to-r', scoreGradient)}
            />
          </div>

          <p className="text-xs text-purple-100 mt-2">
            {healthScore >= 80
              ? '🎉 Excellent ! Continuez comme ça'
              : healthScore >= 60
              ? '👍 Bon suivi, quelques améliorations possibles'
              : '💪 Commencez votre suivi pour améliorer votre score'}
          </p>
        </div>
      </motion.div>

      {/* Members grid */}
      <div>
        <h3 className="font-bold text-stone-800 mb-3 flex items-center gap-2">
          <Heart className="w-5 h-5 text-pink-500" />
          Vos Membres
        </h3>

        <div className="grid grid-cols-2 gap-3">
          {members.slice(0, 4).map((member, index) => (
            <MemberCard key={member.id} member={member} index={index} />
          ))}

          {/* Add member button */}
          {members.length < 4 && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: members.length * 0.1 }}
              className="bg-stone-50 rounded-2xl p-4 border-2 border-dashed border-stone-200 hover:border-purple-300 hover:bg-purple-50 transition-all flex flex-col items-center justify-center gap-2 min-h-[120px]"
            >
              <div className="w-10 h-10 bg-stone-200 rounded-xl flex items-center justify-center">
                <Plus className="w-5 h-5 text-stone-500" />
              </div>
              <span className="text-sm font-medium text-stone-500">Ajouter</span>
            </motion.button>
          )}
        </div>
      </div>

      {/* Meal plan & Budget */}
      <div>
        <h3 className="font-bold text-stone-800 mb-3">Repas & Courses</h3>

        <div className="space-y-3">
          {/* Meal plan card */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 border border-purple-100">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-5 h-5 text-purple-600" />
              <span className="font-semibold text-stone-800">Plan de repas famille</span>
            </div>
            {activeMealPlan ? (
              <div>
                <p className="text-2xl font-bold text-purple-900 mb-1">7 jours planifiés</p>
                <p className="text-xs text-purple-700">Portions adaptées automatiquement</p>
              </div>
            ) : (
              <div>
                <p className="text-lg font-bold text-stone-600 mb-1">Aucun plan actif</p>
                <p className="text-xs text-stone-500">Créez votre premier plan de repas</p>
              </div>
            )}
          </div>

          {/* Budget card */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 border border-green-100">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="w-5 h-5 text-green-600" />
              <span className="font-semibold text-stone-800">Budget courses</span>
            </div>
            <p className="text-2xl font-bold text-green-900 mb-1">
              {family.weeklyBudget ? `${family.weeklyBudget}€` : 'Non défini'}
            </p>
            <p className="text-xs text-green-700">
              {family.weeklyBudget
                ? 'par semaine · Liste optimisée'
                : 'Définissez votre budget pour optimiser vos courses'}
            </p>
          </div>
        </div>
      </div>

      {/* Alerts section */}
      <div>
        <h3 className="font-bold text-stone-800 mb-3 flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-500" />
          Alertes & Conseils
        </h3>

        <div className="space-y-2">
          {alerts.slice(0, 3).map((alert, index) => (
            <AlertItem
              key={index}
              icon={alert.icon}
              title={alert.title}
              message={alert.message}
              color={alert.color}
              index={index}
            />
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <h3 className="font-bold text-stone-800 mb-3">Actions Rapides</h3>

        <div className="grid grid-cols-2 gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl p-4 font-semibold shadow-lg text-sm flex flex-col items-center gap-2"
          >
            <Calendar className="w-6 h-6" />
            Nouveau Plan
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl p-4 font-semibold shadow-lg text-sm flex flex-col items-center gap-2"
          >
            <ShoppingCart className="w-6 h-6" />
            Liste Courses
          </motion.button>
        </div>
      </div>
    </div>
  );
}

export default FamilyDashboard;
