'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useUserStore } from '@/store/user-store';
import { motion } from 'framer-motion';
import { Check, Zap, Crown, Users, ArrowRight, Loader2 } from 'lucide-react';

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
    const { data: session, status, update: updateSession } = useSession();
    const { setSubscriptionPlan, setActiveMode, setUserId } = useUserStore();
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [checkCount, setCheckCount] = useState(0);

    // Rediriger vers login si pas de session (mais donner du temps pour l'OAuth callback)
    useEffect(() => {
        console.log('[Plan Selection] Session status:', status, 'Check count:', checkCount);
        
        if (status === 'unauthenticated') {
            // Attendre quelques vérifications avant de rediriger (pour OAuth callback)
            if (checkCount < 3) {
                setCheckCount(prev => prev + 1);
                return;
            }
            console.log('[Plan Selection] Unauthenticated after 3 checks, redirecting to login');
            router.push('/auth/login');
        } else if (status === 'authenticated') {
            console.log('[Plan Selection] Authenticated:', session?.user?.email);
        }
    }, [status, router, checkCount, session]);

    // Synchroniser l'ID utilisateur avec le store
    useEffect(() => {
        if (session?.user?.id) {
            setUserId(session.user.id);
        }
    }, [session?.user?.id, setUserId]);

    const handleSelectPlan = async (planId: string) => {
        setIsLoading(true);
        setSelectedPlan(planId);

        try {
            // Mettre à jour le plan dans le store local
            setSubscriptionPlan(planId as 'basic' | 'premium' | 'family');

            // Mettre à jour la session NextAuth
            await updateSession({ subscriptionPlan: planId });

            // Réinitialiser le mode actif pour la sélection
            setActiveMode(null);

            // Rediriger vers la sélection du mode
            router.push('/mode-selection');
        } catch (error) {
            console.error('Erreur lors de la sélection du plan:', error);
            setIsLoading(false);
            setSelectedPlan(null);
        }
    };

    // Afficher un loader pendant la vérification de la session
    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-white" />
            </div>
        );
    }

    // Ne rien afficher si non authentifié (redirection en cours)
    if (status === 'unauthenticated') {
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 py-12 px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-7xl mx-auto"
            >
                {/* Header avec info utilisateur */}
                <div className="text-center mb-12">
                    {session?.user?.name && (
                        <p className="text-lg text-gray-400 mb-2">
                            Bienvenue, {session.user.name} 👋
                        </p>
                    )}
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
                                            disabled={isLoading}
                                            className={`w-full py-3 px-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 mt-auto ${
                                                plan.recommended
                                                    ? `bg-gradient-to-r ${plan.color} text-white hover:shadow-lg disabled:opacity-50`
                                                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:opacity-50'
                                            }`}
                                        >
                                            {isLoading && selectedPlan === plan.id ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin" />
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
