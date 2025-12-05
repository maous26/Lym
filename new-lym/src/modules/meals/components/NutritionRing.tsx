'use client';

import { cn } from '@/core/lib/cn';

interface NutritionRingProps {
  value: number;
  max: number;
  label: string;
  color: 'calories' | 'protein' | 'carbs' | 'fat';
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
}

const colorClasses = {
  calories: {
    stroke: 'stroke-orange-500',
    text: 'text-orange-600',
    bg: 'bg-orange-100',
  },
  protein: {
    stroke: 'stroke-emerald-500',
    text: 'text-emerald-600',
    bg: 'bg-emerald-100',
  },
  carbs: {
    stroke: 'stroke-blue-500',
    text: 'text-blue-600',
    bg: 'bg-blue-100',
  },
  fat: {
    stroke: 'stroke-amber-500',
    text: 'text-amber-600',
    bg: 'bg-amber-100',
  },
};

const sizes = {
  sm: { size: 48, strokeWidth: 4, fontSize: 'text-xs' },
  md: { size: 64, strokeWidth: 5, fontSize: 'text-sm' },
  lg: { size: 96, strokeWidth: 6, fontSize: 'text-lg' },
};

export function NutritionRing({
  value,
  max,
  label,
  color,
  size = 'md',
  showValue = true,
}: NutritionRingProps) {
  const percentage = Math.min((value / max) * 100, 100);
  const { size: svgSize, strokeWidth, fontSize } = sizes[size];
  const radius = (svgSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  const colors = colorClasses[color];

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: svgSize, height: svgSize }}>
        <svg
          width={svgSize}
          height={svgSize}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={radius}
            fill="none"
            stroke="#E5E7EB"
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={radius}
            fill="none"
            className={cn(colors.stroke, 'transition-all duration-500')}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        {/* Center value */}
        {showValue && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={cn('font-bold', fontSize, colors.text)}>
              {Math.round(percentage)}%
            </span>
          </div>
        )}
      </div>
      <div className="mt-2 text-center">
        <p className={cn('font-semibold', fontSize, colors.text)}>
          {value}/{max}
        </p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
    </div>
  );
}
