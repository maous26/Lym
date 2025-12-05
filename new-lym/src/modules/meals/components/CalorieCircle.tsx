'use client';

import { cn } from '@/core/lib/cn';
import { Flame } from 'lucide-react';

interface CalorieCircleProps {
  consumed: number;
  target: number;
  size?: 'sm' | 'md' | 'lg';
}

const sizes = {
  sm: { container: 'w-24 h-24', text: 'text-lg', subtext: 'text-xs' },
  md: { container: 'w-32 h-32', text: 'text-2xl', subtext: 'text-sm' },
  lg: { container: 'w-40 h-40', text: 'text-3xl', subtext: 'text-base' },
};

export function CalorieCircle({ consumed, target, size = 'md' }: CalorieCircleProps) {
  const percentage = Math.min((consumed / target) * 100, 100);
  const remaining = Math.max(target - consumed, 0);
  const isOver = consumed > target;
  const { container, text, subtext } = sizes[size];

  // SVG parameters
  const strokeWidth = size === 'sm' ? 6 : size === 'md' ? 8 : 10;
  const svgSize = size === 'sm' ? 96 : size === 'md' ? 128 : 160;
  const radius = (svgSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className={cn('relative', container)}>
      <svg width={svgSize} height={svgSize} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={svgSize / 2}
          cy={svgSize / 2}
          r={radius}
          fill="none"
          stroke="#F3F4F6"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={svgSize / 2}
          cy={svgSize / 2}
          r={radius}
          fill="none"
          className={cn(
            'transition-all duration-700 ease-out',
            isOver ? 'stroke-red-500' : 'stroke-orange-500'
          )}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <Flame className={cn('text-orange-500 mb-1', size === 'sm' ? 'w-4 h-4' : 'w-6 h-6')} />
        <span className={cn('font-bold text-gray-900', text)}>
          {consumed}
        </span>
        <span className={cn('text-gray-500', subtext)}>
          {isOver ? (
            <span className="text-red-500">+{consumed - target} kcal</span>
          ) : (
            `${remaining} restants`
          )}
        </span>
      </div>
    </div>
  );
}
