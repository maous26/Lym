'use client';

import { forwardRef, type HTMLAttributes, useState } from 'react';
import { cn, getInitials } from '@/lib/utils';

const sizes = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
  '2xl': 'w-20 h-20 text-xl',
  '3xl': 'w-24 h-24 text-2xl',
} as const;

const colors = {
  primary: 'bg-primary-100 text-primary-700',
  secondary: 'bg-secondary-100 text-secondary-700',
  accent: 'bg-accent-100 text-accent-700',
  rose: 'bg-rose-100 text-rose-700',
  stone: 'bg-stone-100 text-stone-700',
  gradient: 'bg-gradient-to-br from-primary-400 to-accent-500 text-white',
} as const;

export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt?: string;
  name?: string;
  size?: keyof typeof sizes;
  color?: keyof typeof colors;
  rounded?: boolean;
  bordered?: boolean;
  status?: 'online' | 'offline' | 'busy' | 'away';
  showStatus?: boolean;
}

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  (
    {
      src,
      alt = '',
      name,
      size = 'md',
      color = 'primary',
      rounded = true,
      bordered = false,
      status,
      showStatus = false,
      className,
      ...props
    },
    ref
  ) => {
    const [imageError, setImageError] = useState(false);
    const initials = name ? getInitials(name) : '?';
    const showImage = src && !imageError;

    const statusColors = {
      online: 'bg-green-500',
      offline: 'bg-stone-400',
      busy: 'bg-red-500',
      away: 'bg-amber-500',
    };

    return (
      <div ref={ref} className={cn('relative inline-block', className)} {...props}>
        <div
          className={cn(
            'flex items-center justify-center overflow-hidden font-semibold',
            sizes[size],
            rounded ? 'rounded-full' : 'rounded-xl',
            bordered && 'ring-2 ring-white shadow-md',
            !showImage && colors[color]
          )}
        >
          {showImage ? (
            <img
              src={src}
              alt={alt || name || 'Avatar'}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <span>{initials}</span>
          )}
        </div>

        {/* Status indicator */}
        {showStatus && status && (
          <span
            className={cn(
              'absolute bottom-0 right-0 block rounded-full ring-2 ring-white',
              statusColors[status],
              size === 'xs' && 'w-1.5 h-1.5',
              size === 'sm' && 'w-2 h-2',
              size === 'md' && 'w-2.5 h-2.5',
              size === 'lg' && 'w-3 h-3',
              size === 'xl' && 'w-4 h-4',
              size === '2xl' && 'w-5 h-5',
              size === '3xl' && 'w-6 h-6'
            )}
          />
        )}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';

// Avatar Group
export interface AvatarGroupProps extends HTMLAttributes<HTMLDivElement> {
  max?: number;
  size?: keyof typeof sizes;
  children: React.ReactNode;
}

export const AvatarGroup = forwardRef<HTMLDivElement, AvatarGroupProps>(
  ({ max = 4, size = 'md', children, className, ...props }, ref) => {
    const avatars = Array.isArray(children) ? children : [children];
    const visibleAvatars = avatars.slice(0, max);
    const remainingCount = avatars.length - max;

    return (
      <div ref={ref} className={cn('flex -space-x-2', className)} {...props}>
        {visibleAvatars.map((avatar, index) => (
          <div key={index} className="relative ring-2 ring-white rounded-full">
            {avatar}
          </div>
        ))}
        {remainingCount > 0 && (
          <div
            className={cn(
              'flex items-center justify-center rounded-full bg-stone-200 text-stone-600 font-semibold ring-2 ring-white',
              sizes[size]
            )}
          >
            +{remainingCount}
          </div>
        )}
      </div>
    );
  }
);

AvatarGroup.displayName = 'AvatarGroup';

// Family Member Avatar with role badge
export interface FamilyAvatarProps extends AvatarProps {
  role?: 'admin' | 'parent' | 'child' | 'teen' | 'senior';
  showRole?: boolean;
}

const roleConfig = {
  admin: { icon: '👑', label: 'Admin', bg: 'bg-amber-400' },
  parent: { icon: '👤', label: 'Parent', bg: 'bg-blue-400' },
  child: { icon: '👶', label: 'Enfant', bg: 'bg-pink-400' },
  teen: { icon: '🧑', label: 'Ado', bg: 'bg-purple-400' },
  senior: { icon: '👴', label: 'Senior', bg: 'bg-teal-400' },
};

export const FamilyAvatar = forwardRef<HTMLDivElement, FamilyAvatarProps>(
  ({ role, showRole = false, size = 'lg', className, ...props }, ref) => {
    const config = role ? roleConfig[role] : null;

    return (
      <div ref={ref} className={cn('relative', className)}>
        <Avatar size={size} bordered {...props} />
        {showRole && config && (
          <span
            className={cn(
              'absolute -bottom-1 -right-1 text-xs rounded-full p-1',
              config.bg
            )}
          >
            {config.icon}
          </span>
        )}
      </div>
    );
  }
);

FamilyAvatar.displayName = 'FamilyAvatar';

export default Avatar;
