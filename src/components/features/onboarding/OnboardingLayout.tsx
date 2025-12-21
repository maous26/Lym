'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ChevronLeft } from 'lucide-react';
import { Progress } from '@/components/ui/Progress';

export interface OnboardingLayoutProps {
  children: React.ReactNode;
  currentStep?: number;
  totalSteps?: number;
  title?: string;
  subtitle?: string;
  gradient?: string;
  accent?: string;
  showBack?: boolean;
  onBack?: () => void;
  className?: string;
}

export function OnboardingLayout({
  children,
  currentStep = 1,
  totalSteps = 6,
  title,
  subtitle,
  gradient = 'from-emerald-50 via-white to-amber-50',
  accent = '#10B981',
  showBack = true,
  onBack,
  className,
}: OnboardingLayoutProps) {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div
      className={cn(
        'min-h-screen flex flex-col',
        `bg-gradient-to-b ${gradient}`,
        className
      )}
      style={{
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif",
      }}
    >
      {/* Background Decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-24 -right-24 w-72 h-72 rounded-full opacity-30"
          style={{
            background: `radial-gradient(circle, ${accent}30, transparent)`,
          }}
          animate={{ scale: [0.9, 1, 0.9] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute top-1/3 -left-32 w-56 h-56 rounded-full opacity-20"
          style={{
            background: `radial-gradient(circle, ${accent}25, transparent)`,
          }}
          animate={{ scale: [1, 0.9, 1] }}
          transition={{ duration: 10, repeat: Infinity, delay: 1 }}
        />
        <motion.div
          className="absolute bottom-1/4 -right-20 w-40 h-40 rounded-full opacity-20"
          style={{
            background: `radial-gradient(circle, ${accent}20, transparent)`,
          }}
          animate={{ scale: [0.95, 1.05, 0.95] }}
          transition={{ duration: 6, repeat: Infinity, delay: 2 }}
        />
      </div>

      {/* Header */}
      <header className="relative z-10 safe-top px-4 pt-4">
        <div className="flex items-center justify-between h-12">
          {/* Back Button */}
          {showBack && currentStep > 1 ? (
            <motion.button
              onClick={onBack}
              className="p-2 -ml-2 text-stone-600 hover:text-stone-800 hover:bg-stone-100/50 rounded-xl transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronLeft className="w-6 h-6" />
            </motion.button>
          ) : (
            <div className="w-10" />
          )}

          {/* Step Indicator */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-stone-500">
              {currentStep} / {totalSteps}
            </span>
          </div>

          {/* Spacer */}
          <div className="w-10" />
        </div>

        {/* Progress Bar */}
        <div className="mt-2">
          <Progress value={progress} max={100} size="xs" variant="primary" />
        </div>
      </header>

      {/* Content */}
      <main className="relative z-10 flex-1 flex flex-col px-6 pt-6 pb-8">
        {/* Title Section */}
        {(title || subtitle) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            {title && (
              <h1 className="text-2xl font-bold text-stone-800 mb-2">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="text-stone-500 leading-relaxed">
                {subtitle}
              </p>
            )}
          </motion.div>
        )}

        {/* Step Content */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="flex-1 flex flex-col"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}

// Step card for selection options
interface StepCardProps {
  icon: string;
  title: string;
  description?: string;
  isSelected?: boolean;
  onClick?: () => void;
  accent?: string;
}

export function StepCard({
  icon,
  title,
  description,
  isSelected = false,
  onClick,
  accent = '#10B981',
}: StepCardProps) {
  return (
    <motion.button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-4 p-4 rounded-2xl text-left transition-all duration-200',
        isSelected
          ? 'bg-white shadow-lg ring-2 ring-primary-500'
          : 'bg-white/60 hover:bg-white/80'
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Icon */}
      <div
        className={cn(
          'w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0',
          isSelected ? 'bg-opacity-20' : 'bg-stone-100'
        )}
        style={{
          backgroundColor: isSelected ? `${accent}20` : undefined,
        }}
      >
        {icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3
          className={cn(
            'font-semibold',
            isSelected ? 'text-stone-800' : 'text-stone-700'
          )}
        >
          {title}
        </h3>
        {description && (
          <p className="text-sm text-stone-500 mt-0.5 line-clamp-2">
            {description}
          </p>
        )}
      </div>

      {/* Selection indicator */}
      <div
        className={cn(
          'w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0',
          isSelected ? 'border-current' : 'border-stone-300'
        )}
        style={{
          borderColor: isSelected ? accent : undefined,
        }}
      >
        {isSelected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: accent }}
          />
        )}
      </div>
    </motion.button>
  );
}

// Chip selector for multiple choices
interface ChipSelectorProps {
  options: { value: string; label: string; icon?: string }[];
  selected: string[];
  onChange: (selected: string[]) => void;
  multiple?: boolean;
  accent?: string;
}

export function ChipSelector({
  options,
  selected,
  onChange,
  multiple = true,
  accent = '#10B981',
}: ChipSelectorProps) {
  const toggleOption = (value: string) => {
    if (multiple) {
      if (selected.includes(value)) {
        onChange(selected.filter((v) => v !== value));
      } else {
        onChange([...selected, value]);
      }
    } else {
      onChange([value]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const isSelected = selected.includes(option.value);
        return (
          <motion.button
            key={option.value}
            onClick={() => toggleOption(option.value)}
            className={cn(
              'px-4 py-2 rounded-full font-medium text-sm transition-all duration-200',
              isSelected
                ? 'text-white shadow-md'
                : 'bg-white/70 text-stone-600 hover:bg-white'
            )}
            style={{
              backgroundColor: isSelected ? accent : undefined,
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {option.icon && <span className="mr-1.5">{option.icon}</span>}
            {option.label}
          </motion.button>
        );
      })}
    </div>
  );
}

export default OnboardingLayout;
