'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCoachStore } from '@/store/coach-store';

export function FloatingCoachButton() {
  const router = useRouter();
  const pathname = usePathname();
  const { getUnreadCount, getTopInsights, markAsRead } = useCoachStore();
  const [showPreview, setShowPreview] = useState(false);

  const unreadCount = getUnreadCount();
  const topInsights = getTopInsights(3);

  // Hide on coach page, onboarding, and auth pages
  const hiddenPaths = ['/coach', '/onboarding', '/auth'];
  if (hiddenPaths.some((path) => pathname?.startsWith(path))) {
    return null;
  }

  const handleClick = () => {
    if (unreadCount > 0 && topInsights.length > 0) {
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

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'success':
        return '🎉';
      case 'warning':
        return '⚠️';
      case 'tip':
        return '💡';
      case 'achievement':
        return '🏆';
      default:
        return '💬';
    }
  };

  return (
    <>
      {/* Preview Panel */}
      <AnimatePresence>
        {showPreview && topInsights.length > 0 && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 z-40"
              onClick={() => setShowPreview(false)}
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="fixed bottom-24 right-4 w-80 max-w-[calc(100vw-2rem)] bg-white rounded-3xl shadow-2xl border border-stone-100 overflow-hidden z-50"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold">Coach LYM</h3>
                    <p className="text-white/80 text-xs">
                      {unreadCount} nouvelle{unreadCount > 1 ? 's' : ''} notification
                      {unreadCount > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPreview(false)}
                  className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Insights */}
              <div className="p-3 space-y-2 max-h-64 overflow-y-auto">
                {topInsights.map((insight) => (
                  <motion.button
                    key={insight.id}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => handleInsightClick(insight.id)}
                    className="w-full text-left p-3 rounded-xl bg-stone-50 hover:bg-purple-50 transition-colors border border-stone-100 hover:border-purple-200"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-lg">{getInsightIcon(insight.type)}</span>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm text-stone-800 mb-0.5">
                          {insight.title}
                        </h4>
                        <p className="text-xs text-stone-600 line-clamp-2">
                          {insight.message}
                        </p>
                        {!insight.read && (
                          <span className="inline-block mt-1.5 px-2 py-0.5 bg-purple-100 text-purple-700 text-[10px] rounded-full font-medium">
                            Nouveau
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Footer */}
              <div className="p-3 border-t border-stone-100 bg-stone-50">
                <motion.button
                  whileHover={{ x: 3 }}
                  onClick={() => {
                    setShowPreview(false);
                    router.push('/coach');
                  }}
                  className="w-full py-2 text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors flex items-center justify-center gap-1"
                >
                  <span>Parler au coach</span>
                  <ChevronRight className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <motion.button
        onClick={handleClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          'fixed bottom-20 right-4 z-40',
          'w-14 h-14 rounded-2xl',
          'bg-gradient-to-br from-purple-500 to-pink-500',
          'shadow-lg shadow-purple-200',
          'flex items-center justify-center text-white',
          'hover:shadow-xl transition-shadow'
        )}
      >
        <Sparkles className="w-6 h-6" />

        {/* Badge */}
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold text-white border-2 border-white shadow-sm"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pulse effect */}
        {unreadCount > 0 && (
          <motion.div
            className="absolute inset-0 rounded-2xl bg-purple-400"
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ repeat: Infinity, duration: 2 }}
          />
        )}
      </motion.button>
    </>
  );
}

export default FloatingCoachButton;
