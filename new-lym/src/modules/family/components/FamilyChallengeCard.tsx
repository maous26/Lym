'use client';

import { Trophy, Leaf, ShoppingCart, Footprints, Apple } from 'lucide-react';
import { Card, Progress, Badge } from '@/core/components/ui';
import { cn } from '@/core/lib/cn';
import type { FamilyChallenge } from '../store';

interface FamilyChallengeCardProps {
  challenge: FamilyChallenge;
  onUpdateProgress?: (value: number) => void;
}

const challengeConfig = {
  NUTRITION: {
    icon: Apple,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-100',
    gradient: 'from-emerald-500 to-teal-500',
  },
  ACTIVITY: {
    icon: Footprints,
    color: 'text-blue-500',
    bgColor: 'bg-blue-100',
    gradient: 'from-blue-500 to-cyan-500',
  },
  BUDGET: {
    icon: ShoppingCart,
    color: 'text-amber-500',
    bgColor: 'bg-amber-100',
    gradient: 'from-amber-500 to-orange-500',
  },
  ECOLOGY: {
    icon: Leaf,
    color: 'text-green-500',
    bgColor: 'bg-green-100',
    gradient: 'from-green-500 to-emerald-500',
  },
};

export function FamilyChallengeCard({ challenge, onUpdateProgress }: FamilyChallengeCardProps) {
  const config = challengeConfig[challenge.type];
  const Icon = config.icon;
  const percentage = Math.min((challenge.current / challenge.target) * 100, 100);
  const isCompleted = percentage >= 100;

  // Calculate days remaining
  const endDate = new Date(challenge.endDate);
  const now = new Date();
  const daysRemaining = Math.max(
    0,
    Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  );

  return (
    <Card variant="elevated" padding="md" className="overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', config.bgColor)}>
            <Icon className={cn('w-5 h-5', config.color)} />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">{challenge.title}</h4>
            {challenge.description && (
              <p className="text-sm text-gray-500">{challenge.description}</p>
            )}
          </div>
        </div>
        {isCompleted ? (
          <Badge variant="success" className="flex items-center gap-1">
            <Trophy className="w-3 h-3" />
            Terminé !
          </Badge>
        ) : (
          <Badge variant="default">
            {daysRemaining}j restants
          </Badge>
        )}
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Progression</span>
          <span className="font-semibold text-gray-900">
            {challenge.current}/{challenge.target} {challenge.unit}
          </span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-500 bg-gradient-to-r',
              config.gradient
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 text-right">
          {Math.round(percentage)}% accompli
        </p>
      </div>

      {/* Action button if handler provided */}
      {onUpdateProgress && !isCompleted && (
        <button
          onClick={() => onUpdateProgress(challenge.current + 1)}
          className={cn(
            'w-full mt-4 py-2 rounded-xl text-white font-medium',
            'bg-gradient-to-r transition-all hover:opacity-90',
            config.gradient
          )}
        >
          +1 {challenge.unit}
        </button>
      )}
    </Card>
  );
}
