'use client';

import { forwardRef, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

// Button variants configuration
const variants = {
  primary: `
    bg-gradient-to-r from-primary-500 to-primary-600
    text-white font-semibold
    shadow-btn-emerald hover:shadow-glow-emerald
    hover:from-primary-600 hover:to-primary-700
    active:scale-[0.98]
  `,
  secondary: `
    bg-gradient-to-r from-secondary-500 to-secondary-600
    text-white font-semibold
    shadow-btn-amber hover:shadow-glow-amber
    hover:from-secondary-600 hover:to-secondary-700
    active:scale-[0.98]
  `,
  accent: `
    bg-gradient-to-r from-accent-500 to-accent-600
    text-white font-semibold
    shadow-btn-teal hover:shadow-glow-teal
    hover:from-accent-600 hover:to-accent-700
    active:scale-[0.98]
  `,
  outline: `
    bg-transparent border-2 border-primary-500
    text-primary-600 font-semibold
    hover:bg-primary-50 hover:border-primary-600
    active:scale-[0.98]
  `,
  ghost: `
    bg-transparent
    text-stone-600 font-medium
    hover:bg-stone-100
    active:scale-[0.98]
  `,
  glass: `
    bg-white/80 backdrop-blur-md
    text-stone-800 font-semibold
    shadow-glass hover:shadow-card
    border border-white/50
    hover:bg-white/90
    active:scale-[0.98]
  `,
  danger: `
    bg-gradient-to-r from-red-500 to-red-600
    text-white font-semibold
    shadow-btn-rose hover:shadow-glow-rose
    hover:from-red-600 hover:to-red-700
    active:scale-[0.98]
  `,
} as const;

const sizes = {
  sm: 'px-4 py-2 text-sm rounded-xl',
  md: 'px-6 py-3 text-base rounded-2xl',
  lg: 'px-8 py-4 text-lg rounded-2xl',
  xl: 'px-10 py-5 text-xl rounded-3xl',
  icon: 'p-3 rounded-xl',
  'icon-lg': 'p-4 rounded-2xl',
} as const;

export interface ButtonProps {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  animated?: boolean;
  disabled?: boolean;
  className?: string;
  children?: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      animated = true,
      disabled,
      children,
      onClick,
      type = 'button',
    },
    ref
  ) => {
    const buttonContent = (
      <>
        {/* Shine effect overlay */}
        <span className="absolute inset-0 overflow-hidden rounded-inherit">
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        </span>

        {/* Content */}
        <span className="relative flex items-center justify-center gap-2">
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            leftIcon && <span className="shrink-0">{leftIcon}</span>
          )}
          {children}
          {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
        </span>
      </>
    );

    const buttonClassName = cn(
      'relative inline-flex items-center justify-center gap-2',
      'transition-all duration-300 ease-out',
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
      variants[variant],
      sizes[size],
      fullWidth && 'w-full',
      className
    );

    if (animated) {
      return (
        <motion.button
          ref={ref}
          type={type}
          className={buttonClassName}
          disabled={disabled || isLoading}
          onClick={onClick}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        >
          {buttonContent}
        </motion.button>
      );
    }

    return (
      <button
        ref={ref}
        type={type}
        className={buttonClassName}
        disabled={disabled || isLoading}
        onClick={onClick}
      >
        {buttonContent}
      </button>
    );
  }
);

Button.displayName = 'Button';

// Icon Button variant
export interface IconButtonProps extends Omit<ButtonProps, 'leftIcon' | 'rightIcon' | 'children'> {
  icon: ReactNode;
  'aria-label': string;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, size = 'icon', ...props }, ref) => {
    return (
      <Button ref={ref} size={size} {...props}>
        {icon}
      </Button>
    );
  }
);

IconButton.displayName = 'IconButton';

export default Button;
