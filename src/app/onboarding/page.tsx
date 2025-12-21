'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, Leaf, Heart, Zap } from 'lucide-react';

export default function OnboardingPage() {
    const router = useRouter();

    const handleStart = () => {
        router.push('/mode-selection');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-amber-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">

            {/* Background elements */}
            <div className="absolute inset-0 pointer-events-none">
                <motion.div
                    animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-32 -right-32 w-96 h-96 bg-emerald-200/20 rounded-full blur-3xl"
                />
                <motion.div
                    animate={{ scale: [1, 1.2, 1], rotate: [0, -5, 0] }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                    className="absolute -bottom-32 -left-32 w-96 h-96 bg-amber-200/20 rounded-full blur-3xl"
                />
            </div>

            <main className="relative z-10 max-w-md w-full text-center">
                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-3xl mx-auto flex items-center justify-center shadow-lg shadow-emerald-200 mb-8"
                >
                    <Leaf className="w-12 h-12 text-white" />
                </motion.div>

                <motion.h1
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-4xl font-bold text-stone-800 mb-4 font-display"
                >
                    Bienvenue sur <span className="text-emerald-600">Lym</span>
                </motion.h1>

                <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-stone-500 text-lg mb-12 leading-relaxed"
                >
                    Votre compagnon nutritionnel intelligent pour une vie plus saine et plus savoureuse.
                </motion.p>

                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="grid grid-cols-1 gap-4 mb-12"
                >
                    <FeatureItem icon={Zap} title="Suivi Intelligent" desc="Calories et macronutriments calculés automatiquement" delay={0.5} />
                    <FeatureItem icon={Heart} title="Recettes Personnalisées" desc="Des suggestions adaptées à vos goûts et objectifs" delay={0.6} />
                </motion.div>

                <motion.button
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleStart}
                    className="w-full py-4 bg-stone-900 text-white rounded-2xl font-semibold text-lg flex items-center justify-center gap-2 shadow-xl shadow-stone-200 hover:bg-stone-800 transition-colors"
                >
                    Commencer l'aventure
                    <ArrowRight className="w-5 h-5" />
                </motion.button>
            </main>
        </div>
    );
}

function FeatureItem({ icon: Icon, title, desc, delay }: { icon: any, title: string, desc: string, delay: number }) {
    return (
        <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay }}
            className="bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-white/50 flex items-start gap-4 text-left"
        >
            <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
                <h3 className="font-semibold text-stone-800 mb-1">{title}</h3>
                <p className="text-sm text-stone-500 leading-snug">{desc}</p>
            </div>
        </motion.div>
    );
}
