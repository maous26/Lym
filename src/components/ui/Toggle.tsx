'use client';

import { forwardRef, type HTMLAttributes } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

// Toggle Switch
export interface ToggleProps extends Omit<HTMLAttributes<HTMLButtonElement>, 'onChange'> {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'accent';
  disabled?: boolean;
}

export const Toggle = forwardRef<HTMLButtonElement, ToggleProps>(
  (
    {
      checked = false,
      onChange,
      label,
      description,
      size = 'md',
      variant = 'primary',
      disabled = false,
      className,
      ...props
    },
    ref
  ) => {
    const sizes = {
      sm: { track: 'w-8 h-5', thumb: 'w-3.5 h-3.5', translate: 14 },
      md: { track: 'w-11 h-6', thumb: 'w-5 h-5', translate: 20 },
      lg: { track: 'w-14 h-8', thumb: 'w-6 h-6', translate: 24 },
    };

    const variants = {
      primary: 'bg-primary-500',
      secondary: 'bg-secondary-500',
      accent: 'bg-accent-500',
    };

    return (
      <button
        ref={ref}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => !disabled && onChange?.(!checked)}
        disabled={disabled}
        className={cn(
          'flex items-center gap-3 group',
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
        {...props}
      >
        {/* Track */}
        <div
          className={cn(
            'relative inline-flex shrink-0 rounded-full transition-colors duration-200',
            sizes[size].track,
            checked ? variants[variant] : 'bg-stone-200'
          )}
        >
          {/* Thumb */}
          <motion.span
            className={cn(
              'absolute top-0.5 left-0.5 bg-white rounded-full shadow-md',
              sizes[size].thumb
            )}
            animate={{ x: checked ? sizes[size].translate : 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        </div>

        {/* Label */}
        {(label || description) && (
          <div className="flex flex-col text-left">
            {label && (
              <span className="text-sm font-medium text-stone-700">{label}</span>
            )}
            {description && (
              <span className="text-xs text-stone-500">{description}</span>
            )}
          </div>
        )}
      </button>
    );
  }
);

Toggle.displayName = 'Toggle';

// Checkbox
export interface CheckboxProps extends Omit<HTMLAttributes<HTMLButtonElement>, 'onChange'> {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'accent';
  disabled?: boolean;
  indeterminate?: boolean;
}

export const Checkbox = forwardRef<HTMLButtonElement, CheckboxProps>(
  (
    {
      checked = false,
      onChange,
      label,
      description,
      size = 'md',
      variant = 'primary',
      disabled = false,
      indeterminate = false,
      className,
      ...props
    },
    ref
  ) => {
    const sizes = {
      sm: { box: 'w-4 h-4', icon: 'w-3 h-3' },
      md: { box: 'w-5 h-5', icon: 'w-3.5 h-3.5' },
      lg: { box: 'w-6 h-6', icon: 'w-4 h-4' },
    };

    const variants = {
      primary: 'bg-primary-500 border-primary-500',
      secondary: 'bg-secondary-500 border-secondary-500',
      accent: 'bg-accent-500 border-accent-500',
    };

    return (
      <button
        ref={ref}
        type="button"
        role="checkbox"
        aria-checked={indeterminate ? 'mixed' : checked}
        onClick={() => !disabled && onChange?.(!checked)}
        disabled={disabled}
        className={cn(
          'flex items-start gap-3 group',
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
        {...props}
      >
        {/* Checkbox */}
        <motion.div
          className={cn(
            'shrink-0 rounded-md border-2 flex items-center justify-center transition-colors',
            sizes[size].box,
            checked || indeterminate
              ? variants[variant]
              : 'border-stone-300 group-hover:border-stone-400'
          )}
          whileTap={{ scale: 0.9 }}
        >
          {checked && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            >
              <Check className={cn('text-white', sizes[size].icon)} />
            </motion.div>
          )}
          {indeterminate && !checked && (
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              className="w-2/3 h-0.5 bg-white rounded"
            />
          )}
        </motion.div>

        {/* Label */}
        {(label || description) && (
          <div className="flex flex-col text-left">
            {label && (
              <span className="text-sm font-medium text-stone-700">{label}</span>
            )}
            {description && (
              <span className="text-xs text-stone-500 mt-0.5">{description}</span>
            )}
          </div>
        )}
      </button>
    );
  }
);

Checkbox.displayName = 'Checkbox';

// Radio Button
export interface RadioProps extends Omit<HTMLAttributes<HTMLButtonElement>, 'onChange'> {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'accent';
  disabled?: boolean;
}

export const Radio = forwardRef<HTMLButtonElement, RadioProps>(
  (
    {
      checked = false,
      onChange,
      label,
      description,
      size = 'md',
      variant = 'primary',
      disabled = false,
      className,
      ...props
    },
    ref
  ) => {
    const sizes = {
      sm: { outer: 'w-4 h-4', inner: 'w-2 h-2' },
      md: { outer: 'w-5 h-5', inner: 'w-2.5 h-2.5' },
      lg: { outer: 'w-6 h-6', inner: 'w-3 h-3' },
    };

    const borderColors = {
      primary: 'border-primary-500',
      secondary: 'border-secondary-500',
      accent: 'border-accent-500',
    };

    return (
      <button
        ref={ref}
        type="button"
        role="radio"
        aria-checked={checked}
        onClick={() => !disabled && onChange?.(true)}
        disabled={disabled}
        className={cn(
          'flex items-start gap-3 group',
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
        {...props}
      >
        {/* Radio Circle */}
        <motion.div
          className={cn(
            'shrink-0 rounded-full border-2 flex items-center justify-center transition-colors',
            sizes[size].outer,
            checked ? borderColors[variant] : 'border-stone-300 group-hover:border-stone-400'
          )}
          whileTap={{ scale: 0.9 }}
        >
          {checked && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className={cn('rounded-full bg-current', sizes[size].inner)}
              style={{
                color: variant === 'primary' ? '#10b981' : variant === 'secondary' ? '#f59e0b' : '#14b8a6',
              }}
            />
          )}
        </motion.div>

        {/* Label */}
        {(label || description) && (
          <div className="flex flex-col text-left">
            {label && (
              <span className="text-sm font-medium text-stone-700">{label}</span>
            )}
            {description && (
              <span className="text-xs text-stone-500 mt-0.5">{description}</span>
            )}
          </div>
        )}
      </button>
    );
  }
);

Radio.displayName = 'Radio';

// Radio Group
export interface RadioGroupProps {
  value?: string;
  onChange?: (value: string) => void;
  options: {
    value: string;
    label: string;
    description?: string;
    disabled?: boolean;
  }[];
  direction?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'accent';
  className?: string;
}

export const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>(
  (
    {
      value,
      onChange,
      options,
      direction = 'vertical',
      size = 'md',
      variant = 'primary',
      className,
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        role="radiogroup"
        className={cn(
          'flex gap-3',
          direction === 'vertical' ? 'flex-col' : 'flex-row flex-wrap',
          className
        )}
      >
        {options.map((option) => (
          <Radio
            key={option.value}
            checked={value === option.value}
            onChange={() => onChange?.(option.value)}
            label={option.label}
            description={option.description}
            disabled={option.disabled}
            size={size}
            variant={variant}
          />
        ))}
      </div>
    );
  }
);

RadioGroup.displayName = 'RadioGroup';

export default Toggle;
