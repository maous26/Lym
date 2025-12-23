'use client';

import { motion } from 'framer-motion';
import { CalendarDays } from 'lucide-react';
import { cn, getGreeting } from '@/lib/utils';

interface WelcomeWidgetProps {
  firstName: string;
  greeting?: string;
  avatarUrl?: string;
  streak?: number;
  motivationalMessage?: string;
  onViewCalendar?: () => void;
  className?: string;
}

// Messages motivationnels basés sur l'heure et le contexte
const getMotivationalMessage = (streak: number = 0): string => {
  const hour = new Date().getHours();

  if (hour < 10) {
    const morningMessages = [
      "Un bon petit-déjeuner pour bien démarrer 🌅",
      "Commence ta journée du bon pied ! ☀️",
      "Prêt(e) pour une journée équilibrée ? 🌱",
    ];
    return morningMessages[Math.floor(Math.random() * morningMessages.length)];
  }

  if (hour < 14) {
    const lunchMessages = [
      "C'est l'heure de recharger les batteries 🔋",
      "Un déjeuner équilibré t'attend ! 🥗",
      "Pause bien méritée 😊",
    ];
    return lunchMessages[Math.floor(Math.random() * lunchMessages.length)];
  }

  if (hour < 18) {
    const afternoonMessages = [
      "Une petite collation pour tenir ? 🍎",
      "Tu gères comme un chef ! 💪",
      "Continue sur ta lancée 🚀",
    ];
    return afternoonMessages[Math.floor(Math.random() * afternoonMessages.length)];
  }

  const eveningMessages = [
    "Un dîner léger pour bien dormir 🌙",
    "Tu as bien travaillé aujourd'hui ✨",
    "Dernière ligne droite ! 🎯",
  ];

  if (streak > 7) {
    return `${streak} jours de suite ! Tu es incroyable 🔥`;
  }

  return eveningMessages[Math.floor(Math.random() * eveningMessages.length)];
};

export function WelcomeWidget({
  firstName,
  greeting: customGreeting,
  streak = 0,
  motivationalMessage,
  onViewCalendar,
  className,
}: WelcomeWidgetProps) {
  const greeting = customGreeting || getGreeting();
  const message = motivationalMessage || getMotivationalMessage(streak);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('relative overflow-hidden', className)}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Text Content */}
        <div className="flex-1 min-w-0">
          {/* Greeting */}
          <motion.p
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-stone-500 text-sm font-medium"
          >
            {greeting} 👋
          </motion.p>

          {/* Name */}
          <motion.h1
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-bold text-stone-800 mt-1"
          >
            {firstName}
          </motion.h1>

          {/* Motivational Message */}
          <motion.p
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="text-stone-500 mt-2 text-sm"
          >
            {message}
          </motion.p>

          {/* Streak Badge */}
          {streak > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, type: 'spring' }}
              className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700"
            >
              <span className="text-sm">🔥</span>
              <span className="text-xs font-semibold">{streak} jours</span>
            </motion.div>
          )}
        </div>

        {/* Calendar Button */}
        {onViewCalendar && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onViewCalendar}
            className="shrink-0 w-12 h-12 rounded-2xl bg-white shadow-lg ring-2 ring-gray-100 flex items-center justify-center text-primary-600 hover:bg-primary-50 transition-colors"
            aria-label="Voir le calendrier"
          >
            <CalendarDays className="w-6 h-6" />
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}

export default WelcomeWidget;
