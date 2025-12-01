"use client";

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useCoachStore } from '@/store/coach-store';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X } from 'lucide-react';

export const FloatingCoachAvatar = () => {
    const router = useRouter();
    const pathname = usePathname();
    const { getUnreadCount, getTopInsights, markAsRead } = useCoachStore();
    const [showPreview, setShowPreview] = useState(false);

    const unreadCount = getUnreadCount();
    const topInsights = getTopInsights(3);

    // Don't show on coach page or onboarding
    if (pathname === '/coach' || pathname === '/onboarding') {
        return null;
    }

    const handleAvatarClick = () => {
        if (unreadCount > 0) {
            setShowPreview(!showPreview);
        } else {
            router.push('/coach');
        }
    };

    const handleInsightClick = (insightId: string) => {
        markAsRead(insightId);
        setShowPreview(false);
        router.push('/coach');
    };

    return (
        <>
            {/* Preview Panel */}
            <AnimatePresence>
                {showPreview && topInsights.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="fixed bottom-24 right-4 w-80 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-40"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-white" />
                                <h3 className="text-white font-bold">Coach Lym</h3>
                            </div>
                            <button
                                onClick={() => setShowPreview(false)}
                                className="text-white/80 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Insights */}
                        <div className="p-3 space-y-2 max-h-96 overflow-y-auto">
                            {topInsights.map((insight) => (
                                <button
                                    key={insight.id}
                                    onClick={() => handleInsightClick(insight.id)}
                                    className="w-full text-left p-3 rounded-xl bg-gray-50 hover:bg-purple-50 transition-colors border border-gray-100 hover:border-purple-200"
                                >
                                    <h4 className="font-semibold text-sm text-gray-900 mb-1">
                                        {insight.title}
                                    </h4>
                                    <p className="text-xs text-gray-600 line-clamp-2">
                                        {insight.message}
                                    </p>
                                    {!insight.read && (
                                        <div className="mt-2 inline-block px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
                                            Nouveau
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Footer */}
                        <div className="p-3 border-t border-gray-100 bg-gray-50">
                            <button
                                onClick={() => {
                                    setShowPreview(false);
                                    router.push('/coach');
                                }}
                                className="w-full py-2 text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors"
                            >
                                En savoir plus →
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Avatar Button */}
            <motion.button
                onClick={handleAvatarClick}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="fixed bottom-20 right-4 z-50 w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full shadow-lg shadow-purple-200 flex items-center justify-center text-white hover:shadow-xl transition-shadow"
            >
                <Sparkles className="h-6 w-6" />

                {/* Badge for unread count */}
                {unreadCount > 0 && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold text-white border-2 border-white"
                    >
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </motion.div>
                )}
            </motion.button>
        </>
    );
};
