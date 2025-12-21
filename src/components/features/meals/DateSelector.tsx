'use client';

import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';

interface DateSelectorProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  onPrevious: () => void;
  onNext: () => void;
  onToday?: () => void;
  className?: string;
}

// Format date for display
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Check for special days
  if (dateString === today.toISOString().split('T')[0]) {
    return "Aujourd'hui";
  }
  if (dateString === yesterday.toISOString().split('T')[0]) {
    return 'Hier';
  }
  if (dateString === tomorrow.toISOString().split('T')[0]) {
    return 'Demain';
  }

  // Format as "Lun 15 Jan"
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  };
  return date.toLocaleDateString('fr-FR', options);
};

// Get short date info
const getDateInfo = (dateString: string) => {
  const date = new Date(dateString);
  const today = new Date();
  const diffDays = Math.floor((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  return {
    isToday: dateString === today.toISOString().split('T')[0],
    isPast: diffDays < 0,
    isFuture: diffDays > 0,
    daysAgo: Math.abs(diffDays),
  };
};

export function DateSelector({
  selectedDate,
  onDateChange,
  onPrevious,
  onNext,
  onToday,
  className,
}: DateSelectorProps) {
  const dateInfo = useMemo(() => getDateInfo(selectedDate), [selectedDate]);
  const formattedDate = useMemo(() => formatDate(selectedDate), [selectedDate]);

  return (
    <div className={cn('flex items-center justify-between px-4 py-3', className)}>
      {/* Navigation */}
      <div className="flex items-center gap-2">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onPrevious}
          className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-stone-600 hover:bg-stone-200 transition-colors"
          aria-label="Jour précédent"
        >
          <ChevronLeft className="w-5 h-5" />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onNext}
          className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-stone-600 hover:bg-stone-200 transition-colors"
          aria-label="Jour suivant"
        >
          <ChevronRight className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Date Display */}
      <div className="flex flex-col items-center">
        <motion.span
          key={selectedDate}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            'text-lg font-semibold',
            dateInfo.isToday ? 'text-primary-600' : 'text-stone-800'
          )}
        >
          {formattedDate}
        </motion.span>

        {/* Subtitle for past/future dates */}
        {!dateInfo.isToday && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-stone-500"
          >
            {dateInfo.isPast
              ? `Il y a ${dateInfo.daysAgo} jour${dateInfo.daysAgo > 1 ? 's' : ''}`
              : `Dans ${dateInfo.daysAgo} jour${dateInfo.daysAgo > 1 ? 's' : ''}`}
          </motion.span>
        )}
      </div>

      {/* Today Button / Calendar */}
      <div className="flex items-center gap-2">
        {!dateInfo.isToday && onToday && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onToday}
            className="px-3 py-2 rounded-xl bg-primary-100 text-primary-600 text-sm font-medium hover:bg-primary-200 transition-colors"
          >
            Aujourd'hui
          </motion.button>
        )}

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            // Open native date picker
            const input = document.createElement('input');
            input.type = 'date';
            input.value = selectedDate;
            input.onchange = (e) => {
              const target = e.target as HTMLInputElement;
              if (target.value) {
                onDateChange(target.value);
              }
            };
            input.click();
          }}
          className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-stone-600 hover:bg-stone-200 transition-colors"
          aria-label="Choisir une date"
        >
          <Calendar className="w-5 h-5" />
        </motion.button>
      </div>
    </div>
  );
}

export default DateSelector;
