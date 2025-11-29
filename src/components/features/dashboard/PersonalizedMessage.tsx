"use client";

import { useOnboardingStore } from '@/store/onboarding-store';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, Heart, Zap } from 'lucide-react';

export const PersonalizedMessage = () => {
    const { profile } = useOnboardingStore();

    const getMessage = () => {
        const hour = new Date().getHours();
        let greeting = 'Bonjour';
        if (hour < 12) greeting = 'Bon matin';
        else if (hour < 18) greeting = 'Bon après-midi';
        else greeting = 'Bonsoir';

        const messages = {
            weight_loss: {
                icon: TrendingUp,
                text: `Chaque petit pas compte ! Votre objectif de ${profile.targetWeight}kg est à portée de main.`,
                color: 'from-orange-400 to-red-500',
            },
            muscle_gain: {
                icon: Zap,
                text: 'Construisez votre force jour après jour. Les protéines sont vos alliées !',
                color: 'from-blue-400 to-purple-500',
            },
            health: {
                icon: Heart,
                text: 'Votre santé est votre plus grande richesse. Continuez sur cette belle voie !',
                color: 'from-green-400 to-emerald-500',
            },
            energy: {
                icon: Sparkles,
                text: 'Rechargez vos batteries avec des aliments riches en nutriments !',
                color: 'from-yellow-400 to-orange-500',
            },
            maintenance: {
                icon: Heart,
                text: 'Maintenez votre équilibre avec constance et bienveillance.',
                color: 'from-primary-400 to-secondary-500',
            },
        };

        const goalMessage = profile.primaryGoal
            ? messages[profile.primaryGoal]
            : messages.health;

        return { greeting, ...goalMessage };
    };

    const { greeting, icon: Icon, text, color } = getMessage();

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden glass rounded-3xl p-6 mb-6"
        >
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${color} opacity-10 rounded-full blur-3xl`} />

            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-3">
                    <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center`}>
                        <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                            {greeting}, {profile.name || 'Ami'} !
                        </h2>
                    </div>
                </div>
                <p className="text-gray-600 leading-relaxed">{text}</p>
            </div>
        </motion.div>
    );
};
