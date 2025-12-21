'use client';

import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

// Card variants
const variants = {
  default: `
    bg-white
    shadow-card hover:shadow-card-hover
    border border-stone-100
  `,
  elevated: `
    bg-white
    shadow-lg hover:shadow-xl
  `,
  glass: `
    bg-white/70 backdrop-blur-xl
    shadow-glass
    border border-white/50
  `,
  gradient: `
    bg-gradient-to-br from-white to-stone-50
    shadow-card hover:shadow-card-hover
    border border-stone-100
  `,
  outline: `
    bg-transparent
    border-2 border-stone-200 hover:border-stone-300
  `,
  ghost: `
    bg-transparent
    hover:bg-stone-50
  `,
  primary: `
    bg-gradient-to-br from-primary-50 to-primary-100/50
    border border-primary-100
    shadow-card
  `,
  secondary: `
    bg-gradient-to-br from-secondary-50 to-secondary-100/50
    border border-secondary-100
    shadow-card
  `,
  accent: `
    bg-gradient-to-br from-accent-50 to-accent-100/50
    border border-accent-100
    shadow-card
  `,
} as const;

const paddings = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
  xl: 'p-8',
} as const;

const radii = {
  sm: 'rounded-xl',
  md: 'rounded-2xl',
  lg: 'rounded-3xl',
  xl: 'rounded-4xl',
  full: 'rounded-full',
} as const;

export interface CardProps {
  variant?: keyof typeof variants;
  padding?: keyof typeof paddings;
  radius?: keyof typeof radii;
  hoverable?: boolean;
  clickable?: boolean;
  animated?: boolean;
  className?: string;
  children?: ReactNode;
  onClick?: () => void;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant = 'default',
      padding = 'md',
      radius = 'lg',
      hoverable = false,
      clickable = false,
      animated = false,
      children,
      onClick,
    },
    ref
  ) => {
    const cardClassName = cn(
      'relative overflow-hidden',
      'transition-all duration-300 ease-out',
      variants[variant],
      paddings[padding],
      radii[radius],
      hoverable && 'hover:-translate-y-1',
      clickable && 'cursor-pointer active:scale-[0.99]',
      className
    );

    if (animated) {
      return (
        <motion.div
          ref={ref}
          className={cardClassName}
          onClick={onClick}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      );
    }

    return (
      <div ref={ref} className={cardClassName} onClick={onClick}>
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

// Card Header
export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
}

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, title, subtitle, action, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex items-start justify-between gap-4 mb-4', className)}
        {...props}
      >
        {(title || subtitle) ? (
          <div className="flex-1 min-w-0">
            {title && (
              <h3 className="text-lg font-semibold text-stone-800 truncate">{title}</h3>
            )}
            {subtitle && (
              <p className="text-sm text-stone-500 mt-0.5">{subtitle}</p>
            )}
          </div>
        ) : children}
        {action && <div className="shrink-0">{action}</div>}
      </div>
    );
  }
);

CardHeader.displayName = 'CardHeader';

// Card Body
export const CardBody = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('', className)} {...props}>
        {children}
      </div>
    );
  }
);

CardBody.displayName = 'CardBody';

// Card Footer
export const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex items-center gap-3 mt-4 pt-4 border-t border-stone-100', className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardFooter.displayName = 'CardFooter';

// Image Card - for food/recipe display
export interface ImageCardProps extends CardProps {
  image: string;
  imageAlt?: string;
  imageOverlay?: boolean;
  aspectRatio?: 'square' | 'video' | 'portrait' | 'landscape';
}

export const ImageCard = forwardRef<HTMLDivElement, ImageCardProps>(
  (
    {
      image,
      imageAlt = '',
      imageOverlay = true,
      aspectRatio = 'landscape',
      children,
      className,
      ...props
    },
    ref
  ) => {
    const aspects = {
      square: 'aspect-square',
      video: 'aspect-video',
      portrait: 'aspect-[3/4]',
      landscape: 'aspect-[4/3]',
    };

    return (
      <Card
        ref={ref}
        className={cn('overflow-hidden', className)}
        padding="none"
        {...props}
      >
        <div className={cn('relative w-full', aspects[aspectRatio])}>
          <img
            src={image}
            alt={imageAlt}
            className="absolute inset-0 w-full h-full object-cover"
          />
          {imageOverlay && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          )}
        </div>
        {children && <div className="p-4">{children}</div>}
      </Card>
    );
  }
);

ImageCard.displayName = 'ImageCard';

// Stat Card - for dashboard metrics
export interface StatCardProps extends CardProps {
  icon?: ReactNode;
  label: string;
  value: string | number;
  unit?: string;
  trend?: { value: number; label?: string };
  color?: 'primary' | 'secondary' | 'accent' | 'stone';
}

export const StatCard = forwardRef<HTMLDivElement, StatCardProps>(
  ({ icon, label, value, unit, trend, color = 'primary', className, ...props }, ref) => {
    const colors = {
      primary: 'text-primary-500 bg-primary-50',
      secondary: 'text-secondary-500 bg-secondary-50',
      accent: 'text-accent-500 bg-accent-50',
      stone: 'text-stone-500 bg-stone-50',
    };

    return (
      <Card ref={ref} className={cn('', className)} {...props}>
        <div className="flex items-start gap-3">
          {icon && (
            <div
              className={cn(
                'shrink-0 w-10 h-10 rounded-xl flex items-center justify-center',
                colors[color]
              )}
            >
              {icon}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-stone-500">{label}</p>
            <p className="text-2xl font-bold text-stone-800 mt-0.5">
              {value}
              {unit && <span className="text-sm font-normal text-stone-400 ml-1">{unit}</span>}
            </p>
            {trend && (
              <p
                className={cn(
                  'text-xs font-medium mt-1',
                  trend.value >= 0 ? 'text-green-500' : 'text-red-500'
                )}
              >
                {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}%{' '}
                {trend.label && <span className="text-stone-400">{trend.label}</span>}
              </p>
            )}
          </div>
        </div>
      </Card>
    );
  }
);

StatCard.displayName = 'StatCard';

export default Card;
