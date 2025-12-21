'use client';

import { forwardRef, type HTMLAttributes, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface SliderProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value: number;
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  showValue?: boolean;
  valueFormat?: (value: number) => string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'accent';
  disabled?: boolean;
  marks?: { value: number; label?: string }[];
}

export const Slider = forwardRef<HTMLDivElement, SliderProps>(
  (
    {
      value,
      onChange,
      min = 0,
      max = 100,
      step = 1,
      label,
      showValue = true,
      valueFormat = (v) => String(v),
      size = 'md',
      variant = 'primary',
      disabled = false,
      marks,
      className,
      ...props
    },
    ref
  ) => {
    const trackRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const percentage = ((value - min) / (max - min)) * 100;

    const variants = {
      primary: { track: 'bg-primary-500', thumb: 'bg-primary-500 ring-primary-200' },
      secondary: { track: 'bg-secondary-500', thumb: 'bg-secondary-500 ring-secondary-200' },
      accent: { track: 'bg-accent-500', thumb: 'bg-accent-500 ring-accent-200' },
    };

    const sizes = {
      sm: { track: 'h-1', thumb: 'w-4 h-4' },
      md: { track: 'h-2', thumb: 'w-5 h-5' },
      lg: { track: 'h-3', thumb: 'w-6 h-6' },
    };

    const updateValue = useCallback(
      (clientX: number) => {
        if (!trackRef.current || disabled) return;
        const rect = trackRef.current.getBoundingClientRect();
        const x = clientX - rect.left;
        const percentage = Math.min(Math.max(x / rect.width, 0), 1);
        const newValue = Math.round((percentage * (max - min) + min) / step) * step;
        onChange?.(Math.min(Math.max(newValue, min), max));
      },
      [min, max, step, onChange, disabled]
    );

    const handleMouseDown = (e: React.MouseEvent) => {
      if (disabled) return;
      setIsDragging(true);
      updateValue(e.clientX);
    };

    const handleMouseMove = useCallback(
      (e: MouseEvent) => {
        if (isDragging) {
          updateValue(e.clientX);
        }
      },
      [isDragging, updateValue]
    );

    const handleMouseUp = useCallback(() => {
      setIsDragging(false);
    }, []);

    // Add/remove event listeners
    useState(() => {
      if (isDragging) {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
      }
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    });

    return (
      <div
        ref={ref}
        className={cn('w-full', disabled && 'opacity-50', className)}
        {...props}
      >
        {/* Header */}
        {(label || showValue) && (
          <div className="flex justify-between items-center mb-3">
            {label && (
              <span className="text-sm font-medium text-stone-700">{label}</span>
            )}
            {showValue && (
              <span className="text-sm font-semibold text-stone-800">
                {valueFormat(value)}
              </span>
            )}
          </div>
        )}

        {/* Slider Track */}
        <div
          ref={trackRef}
          className={cn(
            'relative rounded-full bg-stone-200 cursor-pointer',
            sizes[size].track,
            disabled && 'cursor-not-allowed'
          )}
          onMouseDown={handleMouseDown}
        >
          {/* Filled Track */}
          <motion.div
            className={cn('absolute left-0 top-0 h-full rounded-full', variants[variant].track)}
            style={{ width: `${percentage}%` }}
            animate={{ width: `${percentage}%` }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />

          {/* Marks */}
          {marks && (
            <div className="absolute inset-0">
              {marks.map((mark) => {
                const markPercentage = ((mark.value - min) / (max - min)) * 100;
                return (
                  <div
                    key={mark.value}
                    className="absolute top-1/2 -translate-y-1/2"
                    style={{ left: `${markPercentage}%` }}
                  >
                    <div
                      className={cn(
                        'w-1.5 h-1.5 rounded-full -translate-x-1/2',
                        mark.value <= value ? 'bg-white' : 'bg-stone-400'
                      )}
                    />
                    {mark.label && (
                      <span className="absolute top-4 left-1/2 -translate-x-1/2 text-[10px] text-stone-500 whitespace-nowrap">
                        {mark.label}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Thumb */}
          <motion.div
            className={cn(
              'absolute top-1/2 -translate-y-1/2 rounded-full shadow-lg',
              'ring-4 transition-shadow',
              variants[variant].thumb,
              sizes[size].thumb,
              isDragging && 'ring-8',
              !disabled && 'cursor-grab active:cursor-grabbing'
            )}
            style={{ left: `${percentage}%`, transform: 'translate(-50%, -50%)' }}
            animate={{ left: `${percentage}%` }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          />
        </div>

        {/* Min/Max labels */}
        <div className="flex justify-between mt-1">
          <span className="text-xs text-stone-400">{valueFormat(min)}</span>
          <span className="text-xs text-stone-400">{valueFormat(max)}</span>
        </div>
      </div>
    );
  }
);

Slider.displayName = 'Slider';

// Range Slider (two thumbs)
export interface RangeSliderProps extends Omit<SliderProps, 'value' | 'onChange'> {
  values: [number, number];
  onChange?: (values: [number, number]) => void;
}

export const RangeSlider = forwardRef<HTMLDivElement, RangeSliderProps>(
  (
    {
      values,
      onChange,
      min = 0,
      max = 100,
      step = 1,
      label,
      showValue = true,
      valueFormat = (v) => String(v),
      size = 'md',
      variant = 'primary',
      disabled = false,
      className,
      ...props
    },
    ref
  ) => {
    const [low, high] = values;
    const lowPercentage = ((low - min) / (max - min)) * 100;
    const highPercentage = ((high - min) / (max - min)) * 100;

    const variants = {
      primary: { track: 'bg-primary-500', thumb: 'bg-primary-500 ring-primary-200' },
      secondary: { track: 'bg-secondary-500', thumb: 'bg-secondary-500 ring-secondary-200' },
      accent: { track: 'bg-accent-500', thumb: 'bg-accent-500 ring-accent-200' },
    };

    const sizes = {
      sm: { track: 'h-1', thumb: 'w-4 h-4' },
      md: { track: 'h-2', thumb: 'w-5 h-5' },
      lg: { track: 'h-3', thumb: 'w-6 h-6' },
    };

    return (
      <div ref={ref} className={cn('w-full', className)} {...props}>
        {(label || showValue) && (
          <div className="flex justify-between items-center mb-3">
            {label && <span className="text-sm font-medium text-stone-700">{label}</span>}
            {showValue && (
              <span className="text-sm font-semibold text-stone-800">
                {valueFormat(low)} - {valueFormat(high)}
              </span>
            )}
          </div>
        )}

        <div className={cn('relative rounded-full bg-stone-200', sizes[size].track)}>
          {/* Filled Track */}
          <div
            className={cn('absolute top-0 h-full rounded-full', variants[variant].track)}
            style={{
              left: `${lowPercentage}%`,
              width: `${highPercentage - lowPercentage}%`,
            }}
          />

          {/* Low Thumb */}
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={low}
            onChange={(e) => {
              const newLow = Math.min(Number(e.target.value), high - step);
              onChange?.([newLow, high]);
            }}
            disabled={disabled}
            className="absolute w-full h-full opacity-0 cursor-pointer"
          />

          {/* High Thumb */}
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={high}
            onChange={(e) => {
              const newHigh = Math.max(Number(e.target.value), low + step);
              onChange?.([low, newHigh]);
            }}
            disabled={disabled}
            className="absolute w-full h-full opacity-0 cursor-pointer"
          />

          {/* Visual Thumbs */}
          <div
            className={cn(
              'absolute top-1/2 -translate-y-1/2 rounded-full shadow-lg ring-4',
              variants[variant].thumb,
              sizes[size].thumb
            )}
            style={{ left: `${lowPercentage}%`, transform: 'translate(-50%, -50%)' }}
          />
          <div
            className={cn(
              'absolute top-1/2 -translate-y-1/2 rounded-full shadow-lg ring-4',
              variants[variant].thumb,
              sizes[size].thumb
            )}
            style={{ left: `${highPercentage}%`, transform: 'translate(-50%, -50%)' }}
          />
        </div>
      </div>
    );
  }
);

RangeSlider.displayName = 'RangeSlider';

export default Slider;
