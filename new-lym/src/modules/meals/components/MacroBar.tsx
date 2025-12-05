'use client';

import { cn } from '@/core/lib/cn';
import { Progress } from '@/core/components/ui';

interface MacroBarProps {
  label: string;
  value: number;
  max: number;
  unit?: string;
  color: 'protein' | 'carbs' | 'fat';
}

const colorClasses = {
  protein: {
    bar: 'bg-emerald-500',
    text: 'text-emerald-600',
    icon: '🥩',
  },
  carbs: {
    bar: 'bg-blue-500',
    text: 'text-blue-600',
    icon: '🍞',
  },
  fat: {
    bar: 'bg-amber-500',
    text: 'text-amber-600',
    icon: '🥑',
  },
};

export function MacroBar({ label, value, max, unit = 'g', color }: MacroBarProps) {
  const percentage = Math.min((value / max) * 100, 100);
  const colors = colorClasses[color];

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-1.5">
          <span>{colors.icon}</span>
          <span className="font-medium text-gray-700">{label}</span>
        </div>
        <div className={cn('font-semibold', colors.text)}>
          {value}
          <span className="text-gray-400 font-normal">/{max}{unit}</span>
        </div>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-500', colors.bar)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
