'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Trophy, Medal, Flame } from 'lucide-react';

interface XpToastProps {
    isVisible: boolean;
    xpAmount: number;
    reason?: string;
    leveledUp?: boolean;
    newLevel?: number;
    newBadges?: string[];
    onComplete?: () => void;
}

export function XpToast({
    isVisible,
    xpAmount,
    reason,
    leveledUp,
    newLevel,
    newBadges,
    onComplete,
}: XpToastProps) {
    return (
        <AnimatePresence onExitComplete={onComplete}>
            {isVisible && (
                <motion.div
                    initial={{ y: -100, opacity: 0, scale: 0.8 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: -100, opacity: 0, scale: 0.8 }}
                    transition={{ type: 'spring', damping: 15, stiffness: 300 }}
                    className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] pointer-events-none"
                >
                    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-4 rounded-2xl shadow-2xl min-w-[200px]">
                        {/* XP Earned */}
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: [0, 1.2, 1] }}
                            transition={{ delay: 0.1 }}
                            className="flex items-center justify-center gap-2 mb-1"
                        >
                            <Sparkles className="w-6 h-6 text-yellow-300" />
                            <span className="text-2xl font-bold">+{xpAmount} XP</span>
                        </motion.div>

                        {reason && (
                            <p className="text-center text-white/80 text-sm">{formatReason(reason)}</p>
                        )}

                        {/* Level Up */}
                        {leveledUp && newLevel && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="mt-3 pt-3 border-t border-white/20 flex items-center justify-center gap-2"
                            >
                                <Trophy className="w-5 h-5 text-yellow-300" />
                                <span className="font-bold">Niveau {newLevel} !</span>
                            </motion.div>
                        )}

                        {/* New Badges */}
                        {newBadges && newBadges.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="mt-2 flex items-center justify-center gap-2"
                            >
                                <Medal className="w-5 h-5 text-amber-300" />
                                <span className="text-sm">Nouveau badge !</span>
                            </motion.div>
                        )}
                    </div>

                    {/* Floating particles */}
                    <motion.div
                        className="absolute -top-2 left-1/4"
                        animate={{ y: [-20, -40], opacity: [1, 0] }}
                        transition={{ duration: 1, delay: 0.2 }}
                    >
                        <Sparkles className="w-4 h-4 text-yellow-400" />
                    </motion.div>
                    <motion.div
                        className="absolute -top-2 right-1/4"
                        animate={{ y: [-20, -40], opacity: [1, 0] }}
                        transition={{ duration: 1, delay: 0.4 }}
                    >
                        <Sparkles className="w-4 h-4 text-pink-400" />
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

function formatReason(reason: string): string {
    const labels: Record<string, string> = {
        rate_recipe: 'Note recette',
        rate_recipe_with_comment: 'Note + commentaire',
        mark_recipe_cooked: 'Recette cuisinée',
        first_rating: 'Première note !',
        log_meal: 'Repas logué',
        log_weight: 'Pesée enregistrée',
    };
    return labels[reason] || reason;
}
