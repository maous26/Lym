"use client";

import { useEffect } from 'react';
import { useOnboardingStore } from '@/store/onboarding-store';
import { useFamilyStore } from '@/store/family-store';
import { motion } from 'framer-motion';
import { CheckCircle, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export const StepAnalysis = () => {
    const router = useRouter();
    const { isFamilyMode } = useFamilyStore();

    useEffect(() => {
        // Simulate AI Analysis
        const timer = setTimeout(() => {
            // Rediriger vers /family si mode famille, sinon vers dashboard
            if (isFamilyMode) {
                console.log('🎉 Mode famille activé - Redirection vers /family');
                router.push('/family');
            } else {
                console.log('🎉 Mode solo - Redirection vers dashboard');
                router.push('/');
            }
        }, 3000);

        return () => clearTimeout(timer);
    }, [router, isFamilyMode]);

    return (
        <div className="flex flex-col h-full justify-center items-center text-center px-6">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="mb-8 relative"
            >
                <div className="w-40 h-40 bg-primary-100 rounded-full flex items-center justify-center relative">
                    <Loader2 className="h-16 w-16 text-primary-600 animate-spin" />
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 2.5 }}
                        className="absolute inset-0 bg-green-500 rounded-full flex items-center justify-center"
                    >
                        <CheckCircle className="h-20 w-20 text-white" />
                    </motion.div>
                </div>
            </motion.div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Analyse de votre profil...
            </h2>

            <div className="space-y-2 text-gray-500 text-sm">
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                    Calcul du métabolisme de base...
                </motion.p>
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}>
                    Optimisation des macronutriments...
                </motion.p>
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.9 }}>
                    Génération du plan nutritionnel...
                </motion.p>
            </div>
        </div>
    );
};
