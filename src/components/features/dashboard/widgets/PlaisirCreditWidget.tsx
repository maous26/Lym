'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Gift, Sparkles, ChefHat } from 'lucide-react';
import { type Zone, type DayZoneStatus, getZoneColor } from '@/lib/plaisir-credit';

interface PlaisirCreditWidgetProps {
  currentCredit: number;
  creditRequired: number;
  weeklyHistory: DayZoneStatus[];
  isReady: boolean;
  percentageFilled: number;
  message: {
    title: string;
    subtitle: string;
    message: string;
    badgeText: string;
  };
  onPlanPleasureMeal: () => void;
  className?: string;
}

// Jauge circulaire de progression
function CreditGauge({
  percentage,
  isReady,
  size = 100,
  strokeWidth = 10,
}: {
  percentage: number;
  isReady: boolean;
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  // Couleur du gradient selon l'état
  const strokeColor = isReady ? '#10b981' : '#f472b6'; // emerald-500 ou pink-400

  return (
    <div className="relative">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className={isReady ? 'text-emerald-100' : 'text-pink-100'}
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut' }}
          style={{ strokeDasharray: circumference }}
        />
      </svg>
      {/* Centre - Icône et pourcentage */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: 'spring' }}
        >
          {isReady ? (
            <Sparkles className="w-6 h-6 text-emerald-500" />
          ) : (
            <Gift className="w-6 h-6 text-pink-500" />
          )}
        </motion.div>
        <span className={cn(
          'text-sm font-bold mt-1',
          isReady ? 'text-emerald-600' : 'text-pink-600'
        )}>
          {Math.round(percentage)}%
        </span>
      </div>
    </div>
  );
}

// Indicateur de jour de la semaine
function DayIndicator({
  day,
  delay,
}: {
  day: DayZoneStatus;
  delay: number;
}) {
  const bgColor = day.hasData ? getZoneColor(day.zone) : 'bg-stone-200';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, type: 'spring' }}
      className="flex flex-col items-center gap-1"
    >
      <div
        className={cn(
          'w-7 h-7 rounded-full flex items-center justify-center',
          bgColor,
          !day.hasData && 'opacity-50'
        )}
      >
        {day.hasData && day.zone === 'green' && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-2 h-2 bg-white rounded-full"
          />
        )}
      </div>
      <span className="text-[10px] font-medium text-stone-500">{day.dayLabel}</span>
    </motion.div>
  );
}

export function PlaisirCreditWidget({
  currentCredit,
  creditRequired,
  weeklyHistory,
  isReady,
  percentageFilled,
  message,
  onPlanPleasureMeal,
  className,
}: PlaisirCreditWidgetProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'rounded-3xl p-5 shadow-card overflow-hidden',
        isReady
          ? 'bg-gradient-to-br from-emerald-50 to-white'
          : 'bg-gradient-to-br from-pink-50 to-white',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center',
              isReady
                ? 'bg-gradient-to-br from-emerald-100 to-emerald-200'
                : 'bg-gradient-to-br from-pink-100 to-pink-200'
            )}
          >
            {isReady ? (
              <Sparkles className="w-5 h-5 text-emerald-600" />
            ) : (
              <Gift className="w-5 h-5 text-pink-600" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-stone-800">{message.title}</h3>
            <p className="text-xs text-stone-500">{message.subtitle}</p>
          </div>
        </div>

        {/* Badge */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className={cn(
            'px-2.5 py-1 rounded-full text-xs font-bold',
            isReady
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-pink-100 text-pink-700'
          )}
        >
          {message.badgeText}
        </motion.div>
      </div>

      {/* Contenu principal */}
      <div className="flex items-center gap-4">
        {/* Jauge */}
        <CreditGauge percentage={percentageFilled} isReady={isReady} />

        {/* Historique semaine */}
        <div className="flex-1">
          <div className="flex justify-between mb-3">
            {weeklyHistory.map((day, index) => (
              <DayIndicator
                key={day.date}
                day={day}
                delay={0.1 + index * 0.05}
              />
            ))}
          </div>

          {/* Message */}
          <p className="text-sm text-stone-600 leading-relaxed">
            {message.message}
          </p>
        </div>
      </div>

      {/* Bouton Plaisir (visible quand prêt) */}
      {isReady && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onPlanPleasureMeal}
          className={cn(
            'mt-4 w-full py-3 px-4 rounded-xl',
            'bg-gradient-to-r from-emerald-500 to-emerald-600',
            'text-white font-semibold text-sm',
            'flex items-center justify-center gap-2',
            'shadow-lg shadow-emerald-500/25',
            'hover:shadow-xl hover:shadow-emerald-500/30 transition-shadow'
          )}
        >
          <ChefHat className="w-4 h-4" />
          Planifier mon repas plaisir
        </motion.button>
      )}
    </motion.div>
  );
}

export default PlaisirCreditWidget;
