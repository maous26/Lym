"use client";

import { useOnboardingStore } from '@/store/onboarding-store';
import { BottomNav } from '@/components/ui/BottomNav';
import { motion } from 'framer-motion';
import { 
    User, Calendar, Ruler, Weight, Target, Activity, Utensils, LogOut,
    ChefHat, Clock, Timer, TrendingDown, Heart, Scale
} from 'lucide-react';
import { useRouter } from 'next/navigation';

// Fonction pour calculer l'IMC
const calculateBMI = (weight: number | null, height: number | null): { value: number | null; category: string; color: string } => {
    if (!weight || !height) return { value: null, category: '-', color: 'text-gray-500' };
    
    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);
    const roundedBmi = Math.round(bmi * 10) / 10;
    
    if (bmi < 18.5) return { value: roundedBmi, category: 'Insuffisance pondérale', color: 'text-blue-600' };
    if (bmi < 25) return { value: roundedBmi, category: 'Poids normal', color: 'text-green-600' };
    if (bmi < 30) return { value: roundedBmi, category: 'Surpoids', color: 'text-orange-500' };
    return { value: roundedBmi, category: 'Obésité', color: 'text-red-600' };
};

// Fonction pour formater les labels
const formatGoal = (goal: string | null): string => {
    const goals: Record<string, string> = {
        'weight_loss': 'Perdre du poids',
        'muscle_gain': 'Prendre du muscle',
        'maintenance': 'Maintenir mon poids',
        'health': 'Manger plus sainement',
        'energy': 'Regain d\'énergie'
    };
    return goal ? goals[goal] || goal : '-';
};

const formatActivity = (level: string | null): string => {
    const levels: Record<string, string> = {
        'sedentary': 'Sédentaire',
        'light': 'Légèrement actif',
        'moderate': 'Modérément actif',
        'active': 'Très actif',
        'athlete': 'Athlète'
    };
    return level ? levels[level] || level : '-';
};

const formatDiet = (diet: string): string => {
    const diets: Record<string, string> = {
        'omnivore': 'Omnivore',
        'vegetarian': 'Végétarien',
        'vegan': 'Végétalien',
        'pescatarian': 'Pescétarien',
        'keto': 'Cétogène',
        'paleo': 'Paléo'
    };
    return diets[diet] || diet;
};

const formatCookingSkill = (skill: string | undefined): string => {
    const skills: Record<string, string> = {
        'beginner': 'Débutant',
        'intermediate': 'Intermédiaire',
        'advanced': 'Avancé'
    };
    return skill ? skills[skill] || skill : '-';
};

const formatFasting = (type: string | undefined): string => {
    const types: Record<string, string> = {
        'none': 'Non',
        '16_8': '16:8',
        '18_6': '18:6',
        '20_4': '20:4 (OMAD)',
        '5_2': '5:2',
        'eat_stop_eat': 'Eat-Stop-Eat'
    };
    return type ? types[type] || type : 'Non';
};

export default function ProfilePage() {
    const { profile, reset } = useOnboardingStore();
    const router = useRouter();

    const handleLogout = () => {
        if (confirm('Êtes-vous sûr de vouloir réinitialiser votre profil ?')) {
            reset();
            router.push('/onboarding');
        }
    };

    const bmi = calculateBMI(profile.weight, profile.height);

    // Informations de base
    const basicInfoFields = [
        { icon: User, label: 'Prénom', value: profile.name || '-' },
        { icon: Calendar, label: 'Âge', value: profile.age ? `${profile.age} ans` : '-' },
        { icon: User, label: 'Genre', value: profile.gender === 'male' ? 'Homme' : profile.gender === 'female' ? 'Femme' : '-' },
        { icon: Ruler, label: 'Taille', value: profile.height ? `${profile.height} cm` : '-' },
        { icon: Weight, label: 'Poids actuel', value: profile.weight ? `${profile.weight} kg` : '-' },
    ];

    // Objectifs et cibles
    const goalFields = [
        { icon: Target, label: 'Objectif principal', value: formatGoal(profile.primaryGoal) },
        { icon: Activity, label: 'Niveau d\'activité', value: formatActivity(profile.activityLevel) },
        ...(profile.primaryGoal === 'weight_loss' && profile.weightLossGoalKg ? [
            { icon: TrendingDown, label: 'Objectif perte', value: `-${profile.weightLossGoalKg} kg` },
            { icon: Calendar, label: 'Durée estimée', value: profile.suggestedDurationWeeks ? `${profile.suggestedDurationWeeks} semaines` : '-' },
            { icon: Target, label: 'Poids cible', value: profile.weight && profile.weightLossGoalKg ? `${profile.weight - profile.weightLossGoalKg} kg` : '-' },
        ] : []),
    ];

    // Alimentation et cuisine
    const fastingType = profile.fastingSchedule?.type;
    const hasFasting = fastingType && fastingType !== 'none';
    const fastingWindow = hasFasting && profile.fastingSchedule?.eatingWindowStart && profile.fastingSchedule?.eatingWindowEnd
        ? `${profile.fastingSchedule.eatingWindowStart} - ${profile.fastingSchedule.eatingWindowEnd}`
        : null;

    const dietFields = [
        { icon: Utensils, label: 'Régime alimentaire', value: formatDiet(profile.dietaryPreferences) },
        { icon: Timer, label: 'Jeûne intermittent', value: formatFasting(fastingType) },
        ...(fastingWindow ? [{ icon: Clock, label: 'Fenêtre alimentaire', value: fastingWindow }] : []),
        { icon: ChefHat, label: 'Niveau en cuisine', value: formatCookingSkill(profile.cookingSkillLevel) },
        { icon: Clock, label: 'Temps cuisine (semaine)', value: profile.cookingTimeWeekday ? `${profile.cookingTimeWeekday} min` : '-' },
        { icon: Clock, label: 'Temps cuisine (weekend)', value: profile.cookingTimeWeekend ? `${profile.cookingTimeWeekend} min` : '-' },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 pb-32">
            <div className="container mx-auto px-4 max-w-md pt-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-6"
                >
                    <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
                        {profile.name?.charAt(0).toUpperCase() || 'V'}
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">{profile.name || 'Utilisateur'}</h1>
                    <p className="text-gray-500">Membre Vitality</p>
                </motion.div>

                {/* IMC Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gradient-to-br from-primary-100 to-secondary-100 rounded-2xl p-5 mb-6"
                >
                    <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-xl bg-white flex items-center justify-center shadow-sm">
                            <Scale className="h-7 w-7 text-primary-600" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm text-gray-600">Indice de Masse Corporelle (IMC)</p>
                            <div className="flex items-baseline gap-2">
                                <span className={`text-3xl font-bold ${bmi.color}`}>
                                    {bmi.value || '-'}
                                </span>
                                <span className={`text-sm font-medium ${bmi.color}`}>
                                    {bmi.category}
                                </span>
                            </div>
                        </div>
                    </div>
                    {bmi.value && (
                        <div className="mt-3 bg-white/50 rounded-lg p-2">
                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                                <span>&lt;18.5</span>
                                <span>18.5-25</span>
                                <span>25-30</span>
                                <span>&gt;30</span>
                            </div>
                            <div className="h-2 bg-gradient-to-r from-blue-400 via-green-400 via-50% to-orange-400 to-75% rounded-full relative">
                                <div 
                                    className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-gray-800 rounded-full shadow"
                                    style={{ 
                                        left: `${Math.min(Math.max(((bmi.value - 15) / 25) * 100, 0), 100)}%`,
                                        transform: 'translate(-50%, -50%)'
                                    }}
                                />
                            </div>
                        </div>
                    )}
                </motion.div>

                {/* Section: Informations de base */}
                <div className="mb-6">
                    <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 px-1">
                        Informations personnelles
                    </h2>
                    <div className="space-y-2">
                        {basicInfoFields.map((field, index) => {
                            const Icon = field.icon;
                            return (
                                <motion.div
                                    key={field.label}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.15 + index * 0.03 }}
                                    className="glass rounded-xl p-3 flex items-center gap-3"
                                >
                                    <div className="h-10 w-10 rounded-lg bg-primary-100 flex items-center justify-center shrink-0">
                                        <Icon className="h-4 w-4 text-primary-600" />
                                    </div>
                                    <div className="flex-1 flex justify-between items-center">
                                        <p className="text-sm text-gray-500">{field.label}</p>
                                        <p className="font-semibold text-gray-900">{field.value}</p>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* Section: Objectifs */}
                <div className="mb-6">
                    <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 px-1">
                        Objectifs & Activité
                    </h2>
                    <div className="space-y-2">
                        {goalFields.map((field, index) => {
                            const Icon = field.icon;
                            return (
                                <motion.div
                                    key={field.label}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 + index * 0.03 }}
                                    className="glass rounded-xl p-3 flex items-center gap-3"
                                >
                                    <div className="h-10 w-10 rounded-lg bg-secondary-100 flex items-center justify-center shrink-0">
                                        <Icon className="h-4 w-4 text-secondary-600" />
                                    </div>
                                    <div className="flex-1 flex justify-between items-center">
                                        <p className="text-sm text-gray-500">{field.label}</p>
                                        <p className="font-semibold text-gray-900">{field.value}</p>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* Section: Alimentation & Cuisine */}
                <div className="mb-6">
                    <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 px-1">
                        Alimentation & Cuisine
                    </h2>
                    <div className="space-y-2">
                        {dietFields.map((field, index) => {
                            const Icon = field.icon;
                            return (
                                <motion.div
                                    key={field.label}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.45 + index * 0.03 }}
                                    className="glass rounded-xl p-3 flex items-center gap-3"
                                >
                                    <div className="h-10 w-10 rounded-lg bg-accent-100 flex items-center justify-center shrink-0">
                                        <Icon className="h-4 w-4 text-accent-600" />
                                    </div>
                                    <div className="flex-1 flex justify-between items-center">
                                        <p className="text-sm text-gray-500">{field.label}</p>
                                        <p className="font-semibold text-gray-900">{field.value}</p>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* Allergies si présentes */}
                {profile.allergies && profile.allergies.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="mb-6"
                    >
                        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 px-1">
                            Allergies & Restrictions
                        </h2>
                        <div className="glass rounded-xl p-4">
                            <div className="flex flex-wrap gap-2">
                                {profile.allergies.map((allergy, index) => (
                                    <span 
                                        key={index}
                                        className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium"
                                    >
                                        {allergy}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Actions */}
                <div className="space-y-3">
                    <button
                        onClick={() => router.push('/onboarding')}
                        className="w-full glass rounded-2xl p-4 text-primary-700 font-semibold hover:bg-primary-50 transition-colors"
                    >
                        Modifier mon profil
                    </button>

                    <button
                        onClick={handleLogout}
                        className="w-full glass rounded-2xl p-4 text-red-600 font-semibold hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                    >
                        <LogOut className="h-5 w-5" />
                        Réinitialiser le profil
                    </button>
                </div>
            </div>

            <BottomNav />
        </div>
    );
}
