'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Camera, Mic, Search, Scan, Sparkles, Calendar } from 'lucide-react';

interface QuickAction {
  id: string;
  icon: React.ReactNode;
  label: string;
  color: string;
  bgColor: string;
  onClick: () => void;
}

interface QuickActionsWidgetProps {
  onAction: (actionId: string) => void;
  className?: string;
}

export function QuickActionsWidget({
  onAction,
  className,
}: QuickActionsWidgetProps) {
  const actions: QuickAction[] = [
    {
      id: 'photo',
      icon: <Camera className="w-6 h-6" />,
      label: 'Photo',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 hover:bg-blue-100',
      onClick: () => onAction('photo'),
    },
    {
      id: 'voice',
      icon: <Mic className="w-6 h-6" />,
      label: 'Vocal',
      color: 'text-rose-600',
      bgColor: 'bg-rose-50 hover:bg-rose-100',
      onClick: () => onAction('voice'),
    },
    {
      id: 'search',
      icon: <Search className="w-6 h-6" />,
      label: 'Recherche',
      color: 'text-amber-600',
      bgColor: 'bg-amber-50 hover:bg-amber-100',
      onClick: () => onAction('search'),
    },
    {
      id: 'barcode',
      icon: <Scan className="w-6 h-6" />,
      label: 'Code-barres',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 hover:bg-purple-100',
      onClick: () => onAction('barcode'),
    },
    {
      id: 'coach',
      icon: <Sparkles className="w-6 h-6" />,
      label: 'Coach IA',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50 hover:bg-emerald-100',
      onClick: () => onAction('coach'),
    },
    {
      id: 'plan',
      icon: <Calendar className="w-6 h-6" />,
      label: 'Planning',
      color: 'text-teal-600',
      bgColor: 'bg-teal-50 hover:bg-teal-100',
      onClick: () => onAction('plan'),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('', className)}
    >
      <h2 className="text-lg font-bold text-stone-800 mb-4">
        Actions rapides
      </h2>

      <div className="grid grid-cols-3 gap-3">
        {actions.map((action, index) => (
          <motion.button
            key={action.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            onClick={action.onClick}
            className={cn(
              'flex flex-col items-center justify-center p-4 rounded-2xl transition-all duration-200',
              'hover:scale-105 active:scale-95',
              action.bgColor
            )}
          >
            <div className={cn('mb-2', action.color)}>
              {action.icon}
            </div>
            <span className="text-xs font-medium text-stone-600">
              {action.label}
            </span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

export default QuickActionsWidget;
