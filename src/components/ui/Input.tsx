'use client';

import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Eye, EyeOff, AlertCircle, CheckCircle, Search, X } from 'lucide-react';

// Input variants
const variants = {
  default: `
    bg-white border-2 border-stone-200
    focus:border-primary-500 focus:ring-2 focus:ring-primary-100
    hover:border-stone-300
  `,
  filled: `
    bg-stone-100 border-2 border-transparent
    focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-100
    hover:bg-stone-150
  `,
  ghost: `
    bg-transparent border-b-2 border-stone-200
    rounded-none
    focus:border-primary-500
    hover:border-stone-300
  `,
  glass: `
    bg-white/60 backdrop-blur-lg border-2 border-white/50
    focus:border-primary-500 focus:ring-2 focus:ring-primary-100
    hover:bg-white/70
  `,
} as const;

const sizes = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-3 text-base',
  lg: 'px-5 py-4 text-lg',
} as const;

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  variant?: keyof typeof variants;
  inputSize?: keyof typeof sizes;
  label?: string;
  helperText?: string;
  error?: string;
  success?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isLoading?: boolean;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = 'text',
      variant = 'default',
      inputSize = 'md',
      label,
      helperText,
      error,
      success,
      leftIcon,
      rightIcon,
      isLoading,
      fullWidth = true,
      disabled,
      id,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const isPassword = type === 'password';
    const inputType = isPassword && showPassword ? 'text' : type;

    return (
      <div className={cn('relative', fullWidth && 'w-full')}>
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-stone-700 mb-2"
          >
            {label}
          </label>
        )}

        {/* Input Container */}
        <div className="relative">
          {/* Left Icon */}
          {leftIcon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400">
              {leftIcon}
            </div>
          )}

          {/* Input */}
          <input
            ref={ref}
            id={inputId}
            type={inputType}
            disabled={disabled || isLoading}
            className={cn(
              'w-full rounded-2xl',
              'transition-all duration-200 ease-out',
              'placeholder:text-stone-400',
              'focus:outline-none',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              variants[variant],
              sizes[inputSize],
              leftIcon && 'pl-12',
              (rightIcon || isPassword || error || success) && 'pr-12',
              error && 'border-red-500 focus:border-red-500 focus:ring-red-100',
              success && 'border-green-500 focus:border-green-500 focus:ring-green-100',
              className
            )}
            {...props}
          />

          {/* Right Side Icons */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {isPassword && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-stone-400 hover:text-stone-600 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            )}
            {error && <AlertCircle className="w-5 h-5 text-red-500" />}
            {success && !error && <CheckCircle className="w-5 h-5 text-green-500" />}
            {rightIcon && !error && !success && !isPassword && rightIcon}
          </div>
        </div>

        {/* Helper/Error Text */}
        <AnimatePresence mode="wait">
          {(error || helperText) && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className={cn(
                'text-sm mt-2',
                error ? 'text-red-500' : 'text-stone-500'
              )}
            >
              {error || helperText}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

Input.displayName = 'Input';

// Search Input
export interface SearchInputProps extends Omit<InputProps, 'leftIcon' | 'type'> {
  onClear?: () => void;
  showClear?: boolean;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ onClear, showClear = true, value, className, ...props }, ref) => {
    const hasValue = value && String(value).length > 0;

    return (
      <div className="relative">
        <Input
          ref={ref}
          type="search"
          value={value}
          leftIcon={<Search className="w-5 h-5" />}
          className={cn('pr-10', className)}
          {...props}
        />
        {showClear && hasValue && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    );
  }
);

SearchInput.displayName = 'SearchInput';

// Textarea
export interface TextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  variant?: keyof typeof variants;
  textareaSize?: keyof typeof sizes;
  label?: string;
  helperText?: string;
  error?: string;
  success?: boolean;
  fullWidth?: boolean;
  autoResize?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      variant = 'default',
      textareaSize = 'md',
      label,
      helperText,
      error,
      success,
      fullWidth = true,
      autoResize = false,
      disabled,
      id,
      ...props
    },
    ref
  ) => {
    const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className={cn('relative', fullWidth && 'w-full')}>
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-stone-700 mb-2"
          >
            {label}
          </label>
        )}

        <textarea
          ref={ref}
          id={textareaId}
          disabled={disabled}
          className={cn(
            'w-full rounded-2xl min-h-[120px]',
            'transition-all duration-200 ease-out',
            'placeholder:text-stone-400',
            'focus:outline-none',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'resize-y',
            variants[variant],
            sizes[textareaSize],
            error && 'border-red-500 focus:border-red-500 focus:ring-red-100',
            success && 'border-green-500 focus:border-green-500 focus:ring-green-100',
            autoResize && 'resize-none overflow-hidden',
            className
          )}
          {...props}
        />

        <AnimatePresence mode="wait">
          {(error || helperText) && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className={cn(
                'text-sm mt-2',
                error ? 'text-red-500' : 'text-stone-500'
              )}
            >
              {error || helperText}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

// Number Input with +/- buttons
export interface NumberInputProps extends Omit<InputProps, 'type'> {
  min?: number;
  max?: number;
  step?: number;
  onValueChange?: (value: number) => void;
}

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  ({ min = 0, max = 100, step = 1, value, onValueChange, className, ...props }, ref) => {
    const numValue = typeof value === 'number' ? value : parseFloat(String(value)) || 0;

    const handleIncrement = () => {
      const newValue = Math.min(numValue + step, max);
      onValueChange?.(newValue);
    };

    const handleDecrement = () => {
      const newValue = Math.max(numValue - step, min);
      onValueChange?.(newValue);
    };

    return (
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleDecrement}
          disabled={numValue <= min}
          className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center',
            'bg-stone-100 text-stone-600 font-bold text-lg',
            'hover:bg-stone-200 transition-colors',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          −
        </button>
        <Input
          ref={ref}
          type="number"
          value={value}
          min={min}
          max={max}
          step={step}
          className={cn('text-center w-20', className)}
          inputSize="sm"
          {...props}
        />
        <button
          type="button"
          onClick={handleIncrement}
          disabled={numValue >= max}
          className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center',
            'bg-primary-100 text-primary-600 font-bold text-lg',
            'hover:bg-primary-200 transition-colors',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          +
        </button>
      </div>
    );
  }
);

NumberInput.displayName = 'NumberInput';

export default Input;
