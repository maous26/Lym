"use client";

import { useOnboardingStore } from '@/store/onboarding-store';
import { BottomNav } from '@/components/ui/BottomNav';
import { motion } from 'framer-motion';
import { User, Mail, Calendar, Ruler, Weight, Target, Activity, Utensils, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
    const { profile, reset } = useOnboardingStore();
    const router = useRouter();

    const handleLogout = () => {
        if (confirm('Êtes-vous sûr de vouloir réinitialiser votre profil ?')) {
            reset();
            router.push('/onboarding');
        }
    };

    const profileFields = [
        { icon: User, label: 'Prénom', value: profile.name },
        { icon: Calendar, label: 'Âge', value: profile.age ? `${profile.age} ans` : '-' },
        { icon: Ruler, label: 'Taille', value: profile.height ? `${profile.height} cm` : '-' },
        { icon: Weight, label: 'Poids', value: profile.weight ? `${profile.weight} kg` : '-' },
        { icon: Target, label: 'Objectif', value: profile.primaryGoal || '-' },
        { icon: Activity, label: 'Activité', value: profile.activityLevel || '-' },
        { icon: Utensils, label: 'Régime', value: profile.dietaryPreferences },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 pb-32">
            <div className="container mx-auto px-4 max-w-md pt-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                >
                    <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
                        {profile.name?.charAt(0).toUpperCase() || 'V'}
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">{profile.name || 'Utilisateur'}</h1>
                    <p className="text-gray-500">Membre Vitality</p>
                </motion.div>

                {/* Profile Info */}
                <div className="space-y-3 mb-6">
                    {profileFields.map((field, index) => {
                        const Icon = field.icon;
                        return (
                            <motion.div
                                key={field.label}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="glass rounded-2xl p-4 flex items-center gap-4"
                            >
                                <div className="h-12 w-12 rounded-xl bg-primary-100 flex items-center justify-center shrink-0">
                                    <Icon className="h-5 w-5 text-primary-600" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-gray-500">{field.label}</p>
                                    <p className="font-semibold text-gray-900 capitalize">{field.value}</p>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

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
