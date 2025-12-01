'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Scale, TrendingDown, TrendingUp, ChevronRight, Bluetooth } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useOnboardingStore } from '@/store/onboarding-store';
import { getWeightStats } from '@/app/actions/weight';

export function WeightQuickCard() {
    const router = useRouter();
    const { profile } = useOnboardingStore();
    const [stats, setStats] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const result = await getWeightStats();
            if (result.success && result.stats) {
                setStats(result.stats);
            }
        } catch (error) {
            console.error('Error loading weight stats:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const currentWeight = stats?.currentWeight || profile.weight;
    const weightChange = stats?.weightChange;

    const getChangeIcon = () => {
        if (!weightChange) return null;
        if (weightChange < 0) return <TrendingDown className="h-4 w-4 text-green-500" />;
        if (weightChange > 0) return <TrendingUp className="h-4 w-4 text-orange-500" />;
        return null;
    };

    const getChangeText = () => {
        if (!weightChange) return null;
        const sign = weightChange > 0 ? '+' : '';
        return `${sign}${weightChange.toFixed(1)} kg`;
    };

    return (
        <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => router.push('/weight')}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-5 text-white text-left mb-6 shadow-lg shadow-blue-200 hover:shadow-xl transition-shadow"
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2.5 rounded-xl">
                        <Scale className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-blue-100 text-sm">Suivi du poids</p>
                        <div className="flex items-baseline gap-2">
                            {isLoading ? (
                                <div className="h-7 w-20 bg-white/20 rounded animate-pulse"></div>
                            ) : (
                                <>
                                    <span className="text-2xl font-bold">
                                        {currentWeight?.toFixed(1) || '—'}
                                    </span>
                                    <span className="text-blue-200">kg</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
                
                <div className="flex items-center gap-3">
                    {weightChange !== null && weightChange !== undefined && (
                        <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-lg">
                            {getChangeIcon()}
                            <span className="text-sm font-medium">{getChangeText()}</span>
                        </div>
                    )}
                    <div className="bg-white/20 p-2 rounded-full">
                        <ChevronRight className="h-5 w-5" />
                    </div>
                </div>
            </div>

            {/* Indication wearable */}
            <div className="mt-3 pt-3 border-t border-white/20 flex items-center gap-2 text-sm text-blue-100">
                <Bluetooth size={14} />
                <span>Connectez votre balance ou app santé</span>
            </div>
        </motion.button>
    );
}


