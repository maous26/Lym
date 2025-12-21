'use client';

import { createContext, useContext, useState, type ReactNode, type HTMLAttributes } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

// Tabs Context
interface TabsContextType {
  activeTab: string;
  setActiveTab: (value: string) => void;
}

const TabsContext = createContext<TabsContextType | null>(null);

// Tabs Container
export interface TabsProps extends HTMLAttributes<HTMLDivElement> {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  variant?: 'default' | 'pills' | 'underline';
}

export function Tabs({
  defaultValue,
  value,
  onValueChange,
  variant = 'default',
  children,
  className,
  ...props
}: TabsProps) {
  const [internalValue, setInternalValue] = useState(defaultValue || '');
  const activeTab = value !== undefined ? value : internalValue;

  const setActiveTab = (newValue: string) => {
    if (value === undefined) {
      setInternalValue(newValue);
    }
    onValueChange?.(newValue);
  };

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={cn('w-full', className)} data-variant={variant} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

// Tab List
export interface TabListProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'pills' | 'underline';
}

export function TabList({ variant = 'default', children, className, ...props }: TabListProps) {
  const variants = {
    default: 'bg-stone-100 p-1 rounded-2xl',
    pills: 'gap-2',
    underline: 'border-b border-stone-200 gap-4',
  };

  return (
    <div
      className={cn('flex items-center', variants[variant], className)}
      role="tablist"
      {...props}
    >
      {children}
    </div>
  );
}

// Tab Trigger
export interface TabProps extends HTMLAttributes<HTMLButtonElement> {
  value: string;
  icon?: ReactNode;
  badge?: string | number;
  variant?: 'default' | 'pills' | 'underline';
  disabled?: boolean;
}

export function Tab({
  value,
  icon,
  badge,
  variant = 'default',
  disabled = false,
  children,
  className,
  ...props
}: TabProps) {
  const context = useContext(TabsContext);
  if (!context) throw new Error('Tab must be used within Tabs');

  const { activeTab, setActiveTab } = context;
  const isActive = activeTab === value;

  const baseStyles = 'relative flex items-center justify-center gap-2 font-medium transition-all';

  const variants = {
    default: cn(
      'flex-1 px-4 py-2.5 text-sm rounded-xl',
      isActive
        ? 'text-stone-800'
        : 'text-stone-500 hover:text-stone-700'
    ),
    pills: cn(
      'px-4 py-2 text-sm rounded-xl',
      isActive
        ? 'bg-primary-500 text-white shadow-btn-emerald'
        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
    ),
    underline: cn(
      'px-1 py-3 text-sm border-b-2 -mb-px',
      isActive
        ? 'border-primary-500 text-primary-600'
        : 'border-transparent text-stone-500 hover:text-stone-700'
    ),
  };

  return (
    <button
      role="tab"
      aria-selected={isActive}
      disabled={disabled}
      onClick={() => setActiveTab(value)}
      className={cn(
        baseStyles,
        variants[variant],
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      {...props}
    >
      {/* Active indicator for default variant */}
      {variant === 'default' && isActive && (
        <motion.div
          layoutId="activeTab"
          className="absolute inset-0 bg-white rounded-xl shadow-sm"
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        />
      )}

      <span className="relative flex items-center gap-2">
        {icon}
        {children}
        {badge !== undefined && (
          <span
            className={cn(
              'px-1.5 py-0.5 text-xs font-semibold rounded-full',
              isActive
                ? variant === 'pills'
                  ? 'bg-white/20 text-white'
                  : 'bg-primary-100 text-primary-700'
                : 'bg-stone-200 text-stone-600'
            )}
          >
            {badge}
          </span>
        )}
      </span>
    </button>
  );
}

// Tab Content
export interface TabContentProps {
  value: string;
  forceMount?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export function TabContent({
  value,
  forceMount = false,
  children,
  className,
}: TabContentProps) {
  const context = useContext(TabsContext);
  if (!context) throw new Error('TabContent must be used within Tabs');

  const { activeTab } = context;
  const isActive = activeTab === value;

  if (!isActive && !forceMount) return null;

  return (
    <motion.div
      role="tabpanel"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: isActive ? 1 : 0, y: isActive ? 0 : 10 }}
      transition={{ duration: 0.2 }}
      className={cn('mt-4', !isActive && forceMount && 'hidden', className)}
    >
      {children}
    </motion.div>
  );
}

export default Tabs;
