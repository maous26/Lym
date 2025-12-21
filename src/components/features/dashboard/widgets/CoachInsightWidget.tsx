'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Sparkles, ArrowRight, X } from 'lucide-react';
import { useState } from 'react';

interface CoachInsightWidgetProps {
  id: string;
  type: 'tip' | 'alert' | 'motivation' | 'achievement';
  title: string;
  message: string;
  actionLabel?: string;
  priority?: 'normal' | 'high' | 'low';
  onAction?: () => void;
  onDismiss?: () => void;
  className?: string;
}

const insightStyles = {
  tip: {
    gradient: 'from-blue-500 to-indigo-600',
    bgGradient: 'from-blue-50 to-indigo-50',
    icon: '💡',
    iconBg: 'bg-blue-100',
  },
  alert: {
    gradient: 'from-amber-500 to-orange-600',
    bgGradient: 'from-amber-50 to-orange-50',
    icon: '⚠️',
    iconBg: 'bg-amber-100',
  },
  motivation: {
    gradient: 'from-emerald-500 to-teal-600',
    bgGradient: 'from-emerald-50 to-teal-50',
    icon: '💪',
    iconBg: 'bg-emerald-100',
  },
  achievement: {
    gradient: 'from-purple-500 to-pink-600',
    bgGradient: 'from-purple-50 to-pink-50',
    icon: '🏆',
    iconBg: 'bg-purple-100',
  },
};

export function CoachInsightWidget({
  id,
  type,
  title,
  message,
  actionLabel,
  priority = 'normal',
  onAction,
  onDismiss,
  className,
}: CoachInsightWidgetProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  const styles = insightStyles[type];

  const handleDismiss = () => {
    setIsDismissed(true);
    setTimeout(() => onDismiss?.(), 300);
  };

  if (isDismissed) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className={cn(
        'relative overflow-hidden rounded-3xl',
        `bg-gradient-to-br ${styles.bgGradient}`,
        'border border-white/50',
        className
      )}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-20">
        <div
          className={cn(
            'w-full h-full rounded-full blur-3xl',
            `bg-gradient-to-br ${styles.gradient}`
          )}
        />
      </div>

      {/* Dismiss button */}
      {onDismiss && (
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-1.5 rounded-full bg-white/50 hover:bg-white/80 transition-colors z-10"
        >
          <X className="w-4 h-4 text-stone-500" />
        </button>
      )}

      <div className="relative p-5">
        <div className="flex gap-4">
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className={cn(
              'shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center text-2xl',
              styles.iconBg
            )}
          >
            {styles.icon}
          </motion.div>

          {/* Content */}
          <div className="flex-1 min-w-0 pr-6">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-primary-500" />
              <span className="text-xs font-medium text-primary-600">
                Coach LYM
              </span>
            </div>

            <h3 className="font-semibold text-stone-800 mb-1">
              {title}
            </h3>

            <p className="text-sm text-stone-600 leading-relaxed">
              {message}
            </p>

            {/* Actions */}
            {(actionLabel || onAction) && (
              <div className="flex items-center gap-3 mt-4">
                {actionLabel && onAction && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onAction}
                    className={cn(
                      'px-4 py-2 rounded-xl text-sm font-medium text-white',
                      `bg-gradient-to-r ${styles.gradient}`,
                      'shadow-md hover:shadow-lg transition-shadow'
                    )}
                  >
                    {actionLabel}
                  </motion.button>
                )}

                <button
                  onClick={onAction}
                  className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-medium text-stone-600 hover:text-stone-800 hover:bg-white/50 transition-colors"
                >
                  Demander au coach
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Version compacte pour les alertes multiples
export function CoachInsightCompact({
  insight,
  onClick,
}: {
  insight: { type: keyof typeof insightStyles; title: string };
  onClick: () => void;
}) {
  const styles = insightStyles[insight.type];

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 p-3 rounded-xl w-full text-left',
        `bg-gradient-to-r ${styles.bgGradient}`,
        'border border-white/50 hover:border-white transition-colors'
      )}
    >
      <span className="text-lg">{styles.icon}</span>
      <span className="flex-1 text-sm font-medium text-stone-700 truncate">
        {insight.title}
      </span>
      <ArrowRight className="w-4 h-4 text-stone-400" />
    </motion.button>
  );
}

export default CoachInsightWidget;
