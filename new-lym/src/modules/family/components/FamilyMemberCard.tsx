'use client';

import { MoreVertical, Edit2, Trash2, User } from 'lucide-react';
import { Card, Avatar, Badge } from '@/core/components/ui';
import { cn } from '@/core/lib/cn';
import type { FamilyMember, FamilyRole, AgeGroup } from '../store';

interface FamilyMemberCardProps {
  member: FamilyMember;
  isActive?: boolean;
  onSelect?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

const roleLabels: Record<FamilyRole, { label: string; color: string }> = {
  ADMIN: { label: 'Admin', color: 'bg-violet-100 text-violet-700' },
  PARENT: { label: 'Parent', color: 'bg-blue-100 text-blue-700' },
  MEMBER: { label: 'Membre', color: 'bg-gray-100 text-gray-700' },
  CHILD: { label: 'Enfant', color: 'bg-green-100 text-green-700' },
};

const ageGroupLabels: Record<AgeGroup, string> = {
  INFANT: 'Bébé',
  CHILD: 'Enfant',
  TEEN: 'Ado',
  ADULT: 'Adulte',
  SENIOR: 'Senior',
};

const ageGroupEmojis: Record<AgeGroup, string> = {
  INFANT: '👶',
  CHILD: '🧒',
  TEEN: '🧑',
  ADULT: '👨',
  SENIOR: '👴',
};

export function FamilyMemberCard({
  member,
  isActive,
  onSelect,
  onEdit,
  onDelete,
}: FamilyMemberCardProps) {
  const roleInfo = roleLabels[member.role];

  return (
    <Card
      variant={isActive ? 'elevated' : 'outlined'}
      padding="md"
      className={cn(
        'transition-all cursor-pointer',
        isActive && 'ring-2 ring-emerald-500 border-transparent',
        !isActive && 'hover:border-gray-300'
      )}
      onClick={onSelect}
    >
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="relative">
          <Avatar
            src={member.avatar}
            fallback={member.name}
            size="lg"
          />
          <span className="absolute -bottom-1 -right-1 text-lg">
            {ageGroupEmojis[member.ageGroup]}
          </span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-gray-900 truncate">
              {member.name}
            </h4>
            <span className={cn('text-xs px-2 py-0.5 rounded-full', roleInfo.color)}>
              {roleInfo.label}
            </span>
          </div>
          <p className="text-sm text-gray-500">
            {ageGroupLabels[member.ageGroup]}
            {member.dailyCalories && ` • ${member.dailyCalories} kcal/j`}
          </p>
          {member.allergies.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {member.allergies.slice(0, 2).map((allergy) => (
                <Badge key={allergy} variant="error" size="sm">
                  {allergy}
                </Badge>
              ))}
              {member.allergies.length > 2 && (
                <Badge variant="default" size="sm">
                  +{member.allergies.length - 2}
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        {(onEdit || onDelete) && (
          <div className="flex items-center gap-1">
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}
            {onDelete && member.role !== 'ADMIN' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
