'use client';

import { type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

// Base Skeleton
export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'circular' | 'rounded';
  animation?: 'pulse' | 'shimmer' | 'none';
  width?: string | number;
  height?: string | number;
}

export function Skeleton({
  variant = 'default',
  animation = 'shimmer',
  width,
  height,
  className,
  style,
  ...props
}: SkeletonProps) {
  const variants = {
    default: 'rounded-lg',
    circular: 'rounded-full',
    rounded: 'rounded-2xl',
  };

  const animations = {
    pulse: 'animate-pulse',
    shimmer: 'relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent before:animate-shimmer',
    none: '',
  };

  return (
    <div
      className={cn(
        'bg-stone-200',
        variants[variant],
        animations[animation],
        className
      )}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        ...style,
      }}
      {...props}
    />
  );
}

// Skeleton Text (multiple lines)
export interface SkeletonTextProps extends HTMLAttributes<HTMLDivElement> {
  lines?: number;
  lastLineWidth?: string;
}

export function SkeletonText({
  lines = 3,
  lastLineWidth = '60%',
  className,
  ...props
}: SkeletonTextProps) {
  return (
    <div className={cn('space-y-2', className)} {...props}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height={16}
          style={{
            width: i === lines - 1 ? lastLineWidth : '100%',
          }}
        />
      ))}
    </div>
  );
}

// Skeleton Card
export interface SkeletonCardProps extends HTMLAttributes<HTMLDivElement> {
  hasImage?: boolean;
  hasAvatar?: boolean;
  lines?: number;
}

export function SkeletonCard({
  hasImage = true,
  hasAvatar = false,
  lines = 2,
  className,
  ...props
}: SkeletonCardProps) {
  return (
    <div
      className={cn('bg-white rounded-2xl p-4 shadow-card', className)}
      {...props}
    >
      {/* Image */}
      {hasImage && (
        <Skeleton
          variant="rounded"
          className="w-full aspect-video mb-4"
        />
      )}

      {/* Header with Avatar */}
      {hasAvatar && (
        <div className="flex items-center gap-3 mb-4">
          <Skeleton variant="circular" width={40} height={40} />
          <div className="flex-1">
            <Skeleton height={14} width="60%" className="mb-2" />
            <Skeleton height={12} width="40%" />
          </div>
        </div>
      )}

      {/* Content */}
      <SkeletonText lines={lines} />

      {/* Actions */}
      <div className="flex gap-2 mt-4">
        <Skeleton height={36} className="flex-1" variant="rounded" />
        <Skeleton height={36} width={36} variant="rounded" />
      </div>
    </div>
  );
}

// Skeleton List Item
export function SkeletonListItem({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex items-center gap-3 p-3', className)}
      {...props}
    >
      <Skeleton variant="rounded" width={48} height={48} />
      <div className="flex-1">
        <Skeleton height={14} width="70%" className="mb-2" />
        <Skeleton height={12} width="50%" />
      </div>
      <Skeleton height={24} width={60} variant="rounded" />
    </div>
  );
}

// Skeleton Stat Card
export function SkeletonStatCard({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('bg-white rounded-2xl p-4 shadow-card', className)}
      {...props}
    >
      <div className="flex items-start gap-3">
        <Skeleton variant="rounded" width={40} height={40} />
        <div className="flex-1">
          <Skeleton height={12} width="50%" className="mb-2" />
          <Skeleton height={24} width="70%" />
        </div>
      </div>
    </div>
  );
}

// Skeleton Meal Card
export function SkeletonMealCard({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('bg-white rounded-2xl overflow-hidden shadow-card', className)}
      {...props}
    >
      <Skeleton className="w-full h-32" />
      <div className="p-4">
        <Skeleton height={18} width="80%" className="mb-2" />
        <Skeleton height={14} width="60%" className="mb-3" />
        <div className="flex gap-2">
          <Skeleton height={24} width={50} variant="rounded" />
          <Skeleton height={24} width={50} variant="rounded" />
          <Skeleton height={24} width={50} variant="rounded" />
        </div>
      </div>
    </div>
  );
}

// Skeleton Dashboard
export function SkeletonDashboard() {
  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton height={24} width={180} className="mb-2" />
          <Skeleton height={14} width={120} />
        </div>
        <Skeleton variant="circular" width={48} height={48} />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <SkeletonStatCard />
        <SkeletonStatCard />
      </div>

      {/* Main Card */}
      <SkeletonCard hasImage lines={3} />

      {/* List */}
      <div className="space-y-2">
        <SkeletonListItem />
        <SkeletonListItem />
        <SkeletonListItem />
      </div>
    </div>
  );
}

export default Skeleton;
