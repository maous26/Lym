'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/user-store';
import { motion } from 'framer-motion';
import { Check, Zap, Crown, Users, ArrowRight } from 'lucide-react';

const plans = [
    {
        id: 'basic',
        name: 'LYM Basic',
        price: 'Gratuit',
        description: 'Parfait pour débuter',
        color: 'from-blue-500 to-cyan-400',
        features: [
            'Plans repas personnalisés',
            'Suivi des calories',
            'Coach IA basique',
            '1 profil utilisateur',
            'Accès à 500+ recettes',
        ],
        icon: Zap,
        cta: 'Commencer',
    },
    {
        id: 'premium',
        name: 'LYM Premium',
        price: '9,99€/mois',
        description: 'Fonctionnalités avancées',
        color: 'from-purple-500 to-pink-400',
        features: [
            'Tout de Basic +',
            'Coach IA avancé et illimité',
            'Analyse nutritionnelle détaillée',
            'Suivi du poids et courbes',
            'Intégration wearables',
            'Plans repas adaptés par saison',
        ],
        icon: Crown,
        cta: 'Passer en Premium',
        recommended: true,
    },
    {
        id: 'family',
        name: 'FamilLYM',
        price: '12€/mois',
        description: 'Pour toute la famille',
        color: 'from-indigo-500 to-purple-400',
        features: [
            'Tout de Premium +',
            '3-6 profils familiaux',
            'Plans repas personnalisés par membre',
            'Suivi santé complet',
            'Liste de courses partagée intelligente',
            'Challenges familiaux',
        ],
        icon: Users,
        cta: 'Activer FamilLYM',
    },
];

export default function PlanSelectionPage() {
    const router = useRouter();
    const { setSubscriptionPlan, setActiveMode } = useUserStore();
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSelectPlan = async (planId: string) => {
        setIsLoading(true);
        setSelectedPlan(planId);

        // Set subscription plan in store
        setSubscriptionPlan(planId as 'basic' | 'premium' | 'family');

        // Simulate API call to save plan
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Redirect to mode selection
        setActiveMode(null);
        router.push('/mode-selection');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 py-12 px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-7xl mx-auto"
            >
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold text-white mb-4">
                        Choisissez Votre Plan
                    </h1>
                    <p className="text-xl text-gray-300">
                        Sélectionnez l'offre qui correspond à vos besoins
                    </p>
                </div>

                {/* Plans Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    {plans.map((plan, index) => {
                        const Icon = plan.icon;
                        return (
                            <motion.div
                                key={plan.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className={`relative rounded-3xl overflow-hidden transition-all ${
                                    plan.recommended ? 'md:scale-105 md:z-10' : ''
                                }`}
                            >
                                {/* Recommended Badge */}
                                {plan.recommended && (
                                    <div className="absolute top-4 right-4 z-20">
                                        <div className="bg-yellow-400 text-gray-900 px-4 py-1 rounded-full text-sm font-bold">
                                            Recommandé
                                        </div>
                                    </div>
                                )}

                                {/* Card */}
                                <div className={`bg-gradient-to-br ${plan.color} p-0.5 h-full`}>
                                    <div className="bg-gray-900 rounded-3xl p-8 h-full flex flex-col space-y-6">
                                        {/* Icon */}
                                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center`}>
                                            <Icon size={32} className="text-white" />
                                        </div>

                                        {/* Title & Price */}
                                        <div>
                                            <h3 className="text-2xl font-bold text-white mb-1">{plan.name}</h3>
                                            <p className="text-gray-400">{plan.description}</p>
                                        </div>

                                        {/* Price */}
                                        <div className="py-4 border-t border-gray-700">
                                            <p className="text-4xl font-bold text-white">
                                                {plan.price}
                                            </p>
                                        </div>

                                        {/* Features */}
                                        <ul className="space-y-3 flex-1">
                                            {plan.features.map((feature, idx) => (
                                                <li
                                                    key={idx}
                                                    className="flex items-start gap-3 text-gray-300"
                                                >
                                                    <Check size={20} className="text-green-400 mt-0.5 flex-shrink-0" />
                                                    <span>{feature}</span>
                                                </li>
                                            ))}
                                        </ul>

                                        {/* CTA Button */}
                                        <button
                                            onClick={() => handleSelectPlan(plan.id)}
                                            disabled={isLoading && selectedPlan === plan.id}
                                            className={`w-full py-3 px-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 mt-auto ${
                                                plan.recommended
                                                    ? `bg-gradient-to-r ${plan.color} text-white hover:shadow-lg disabled:opacity-50`
                                                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:opacity-50'
                                            }`}
                                        >
                                            {isLoading && selectedPlan === plan.id ? (
                                                <>
                                                    <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
                                                    Chargement...
                                                </>
                                            ) : (
                                                <>
                                                    {plan.cta}
                                                    <ArrowRight size={18} />
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Bottom Text */}
                <div className="text-center text-gray-400">
                    <p className="text-sm">
                        Vous pouvez changer de plan à tout moment. Aucun engagement requis.
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
