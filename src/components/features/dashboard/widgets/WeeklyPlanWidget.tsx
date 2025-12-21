'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Calendar, Sparkles, ChevronRight, Zap } from 'lucide-react';

interface WeeklyPlanWidgetProps {
  onGeneratePlan: () => void;
  hasActivePlan?: boolean;
  planDaysRemaining?: number;
  className?: string;
}

export function WeeklyPlanWidget({
  onGeneratePlan,
  hasActivePlan = false,
  planDaysRemaining = 0,
  className,
}: WeeklyPlanWidgetProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('', className)}
    >
      <motion.button
        onClick={onGeneratePlan}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          'w-full p-4 rounded-2xl text-left transition-all duration-300',
          'bg-gradient-to-br from-purple-500 via-purple-600 to-pink-500',
          'shadow-lg shadow-purple-500/25',
          'relative overflow-hidden'
        )}
      >
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white/10"
            animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <motion.div
            className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-white/10"
            animate={{ scale: [1.2, 1, 1.2], rotate: [0, -90, 0] }}
            transition={{ duration: 6, repeat: Infinity }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 flex items-center gap-4">
          {/* Icon */}
          <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Calendar className="w-7 h-7 text-white" />
          </div>

          {/* Text */}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white">Plan Repas IA</h3>
              <motion.div
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="w-4 h-4 text-yellow-300" />
              </motion.div>
            </div>
            {hasActivePlan ? (
              <p className="text-sm text-white/80">
                {planDaysRemaining} jours restants sur votre plan
              </p>
            ) : (
              <p className="text-sm text-white/80">
                7 jours de repas personnalisés
              </p>
            )}
          </div>

          {/* Arrow */}
          <div className="flex items-center gap-1">
            <div className="px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm flex items-center gap-1">
              <Zap className="w-4 h-4 text-yellow-300" />
              <span className="text-xs font-semibold text-white">
                {hasActivePlan ? 'Voir' : 'Générer'}
              </span>
            </div>
            <ChevronRight className="w-5 h-5 text-white/60" />
          </div>
        </div>

        {/* Features badges */}
        <div className="relative z-10 flex gap-2 mt-3 flex-wrap">
          {['Petit-déj', 'Déjeuner', 'Collation', 'Dîner'].map((meal, i) => (
            <span
              key={meal}
              className="px-2 py-0.5 rounded-full bg-white/15 text-xs text-white/90"
            >
              {meal}
            </span>
          ))}
          <span className="px-2 py-0.5 rounded-full bg-yellow-400/30 text-xs text-yellow-100 font-medium">
            + Liste courses
          </span>
        </div>
      </motion.button>
    </motion.div>
  );
}

export default WeeklyPlanWidget;
