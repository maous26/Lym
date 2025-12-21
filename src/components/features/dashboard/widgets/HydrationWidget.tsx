'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Droplets, Plus, Minus } from 'lucide-react';

interface HydrationWidgetProps {
  current: number; // ml
  goal: number; // ml
  onAdd: (amount: number) => void;
  onRemove: (amount: number) => void;
  className?: string;
}

export function HydrationWidget({
  current,
  goal,
  onAdd,
  onRemove,
  className,
}: HydrationWidgetProps) {
  const percentage = Math.min((current / goal) * 100, 100);
  const glasses = Math.floor(current / 250);
  const totalGlasses = Math.ceil(goal / 250);

  const quickAmounts = [150, 250, 500];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'bg-gradient-to-br from-cyan-50 to-blue-50 rounded-3xl p-5 shadow-card relative overflow-hidden',
        className
      )}
    >
      {/* Water Effect Background */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-t from-cyan-200/30 to-transparent"
        initial={{ y: '100%' }}
        animate={{ y: `${100 - percentage}%` }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <motion.div
              className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Droplets className="w-5 h-5 text-cyan-600" />
            </motion.div>
            <div>
              <h3 className="font-semibold text-stone-800">Hydratation</h3>
              <p className="text-xs text-stone-500">
                {glasses}/{totalGlasses} verres
              </p>
            </div>
          </div>

          {/* Quick Remove */}
          {current > 0 && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onRemove(250)}
              className="w-8 h-8 rounded-full bg-white/80 flex items-center justify-center text-stone-400 hover:text-stone-600"
            >
              <Minus className="w-4 h-4" />
            </motion.button>
          )}
        </div>

        {/* Progress Display */}
        <div className="flex items-end gap-2 mb-4">
          <motion.span
            key={current}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-3xl font-bold text-cyan-700"
          >
            {(current / 1000).toFixed(1)}
          </motion.span>
          <span className="text-lg text-cyan-600/70 mb-0.5">/ {(goal / 1000).toFixed(1)} L</span>
        </div>

        {/* Progress Bar */}
        <div className="h-3 bg-white/60 rounded-full overflow-hidden mb-4">
          <motion.div
            className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        {/* Glass Icons */}
        <div className="flex gap-1 mb-4 flex-wrap">
          {Array.from({ length: totalGlasses }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              transition={{ delay: i * 0.05 }}
              className={cn(
                'w-6 h-6 rounded-md flex items-center justify-center text-xs',
                i < glasses
                  ? 'bg-cyan-500 text-white'
                  : 'bg-white/60 text-cyan-300'
              )}
            >
              <Droplets className="w-3 h-3" />
            </motion.div>
          ))}
        </div>

        {/* Quick Add Buttons */}
        <div className="flex gap-2">
          {quickAmounts.map((amount) => (
            <motion.button
              key={amount}
              onClick={() => onAdd(amount)}
              className="flex-1 py-2.5 px-3 rounded-xl bg-white/80 hover:bg-white text-sm font-medium text-cyan-700 flex items-center justify-center gap-1.5 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus className="w-4 h-4" />
              {amount >= 1000 ? `${amount / 1000}L` : `${amount}ml`}
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default HydrationWidget;
