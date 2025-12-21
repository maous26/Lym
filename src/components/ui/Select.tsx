'use client';

import { forwardRef, type HTMLAttributes, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Check, ChevronDown, Search, X } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  description?: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  searchable?: boolean;
  clearable?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const Select = forwardRef<HTMLDivElement, SelectProps>(
  (
    {
      options,
      value,
      onChange,
      placeholder = 'Sélectionner...',
      label,
      error,
      searchable = false,
      clearable = false,
      disabled = false,
      size = 'md',
      className,
      ...props
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    const selectedOption = options.find((opt) => opt.value === value);

    const filteredOptions = searchable
      ? options.filter((opt) =>
          opt.label.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : options;

    // Close on click outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setIsOpen(false);
          setSearchQuery('');
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Focus search input when opened
    useEffect(() => {
      if (isOpen && searchable && searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, [isOpen, searchable]);

    const handleSelect = (optionValue: string) => {
      onChange?.(optionValue);
      setIsOpen(false);
      setSearchQuery('');
    };

    const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange?.('');
    };

    const sizes = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-3 text-base',
      lg: 'px-5 py-4 text-lg',
    };

    return (
      <div ref={ref} className={cn('relative w-full', className)} {...props}>
        {label && (
          <label className="block text-sm font-medium text-stone-700 mb-2">
            {label}
          </label>
        )}

        <div ref={containerRef} className="relative">
          {/* Trigger Button */}
          <button
            type="button"
            onClick={() => !disabled && setIsOpen(!isOpen)}
            disabled={disabled}
            className={cn(
              'w-full flex items-center justify-between gap-2 rounded-2xl border-2',
              'bg-white border-stone-200 text-left',
              'transition-all duration-200',
              'focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100',
              'hover:border-stone-300',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              isOpen && 'border-primary-500 ring-2 ring-primary-100',
              error && 'border-red-500',
              sizes[size]
            )}
          >
            <span className="flex items-center gap-2 flex-1 min-w-0">
              {selectedOption?.icon}
              <span className={cn('truncate', !selectedOption && 'text-stone-400')}>
                {selectedOption?.label || placeholder}
              </span>
            </span>
            <div className="flex items-center gap-1 shrink-0">
              {clearable && value && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="p-1 hover:bg-stone-100 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-stone-400" />
                </button>
              )}
              <ChevronDown
                className={cn(
                  'w-5 h-5 text-stone-400 transition-transform duration-200',
                  isOpen && 'rotate-180'
                )}
              />
            </div>
          </button>

          {/* Dropdown */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className={cn(
                  'absolute z-50 w-full mt-2 py-2 rounded-2xl',
                  'bg-white border border-stone-200 shadow-xl',
                  'max-h-64 overflow-auto'
                )}
              >
                {/* Search Input */}
                {searchable && (
                  <div className="px-3 pb-2 border-b border-stone-100">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                      <input
                        ref={searchInputRef}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Rechercher..."
                        className={cn(
                          'w-full pl-9 pr-4 py-2 text-sm rounded-xl',
                          'bg-stone-50 border-none',
                          'focus:outline-none focus:ring-2 focus:ring-primary-100'
                        )}
                      />
                    </div>
                  </div>
                )}

                {/* Options */}
                <div className="px-1">
                  {filteredOptions.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-stone-500 text-center">
                      Aucun résultat
                    </div>
                  ) : (
                    filteredOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => !option.disabled && handleSelect(option.value)}
                        disabled={option.disabled}
                        className={cn(
                          'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left',
                          'transition-colors duration-150',
                          'hover:bg-stone-50',
                          option.value === value && 'bg-primary-50',
                          option.disabled && 'opacity-50 cursor-not-allowed'
                        )}
                      >
                        {option.icon && (
                          <span className="shrink-0">{option.icon}</span>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className={cn(
                            'font-medium truncate',
                            option.value === value ? 'text-primary-700' : 'text-stone-700'
                          )}>
                            {option.label}
                          </p>
                          {option.description && (
                            <p className="text-xs text-stone-500 truncate mt-0.5">
                              {option.description}
                            </p>
                          )}
                        </div>
                        {option.value === value && (
                          <Check className="w-5 h-5 text-primary-500 shrink-0" />
                        )}
                      </button>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {error && (
          <p className="text-sm text-red-500 mt-2">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

// Multi Select
export interface MultiSelectProps extends Omit<SelectProps, 'value' | 'onChange'> {
  values: string[];
  onChange?: (values: string[]) => void;
  maxSelections?: number;
}

export const MultiSelect = forwardRef<HTMLDivElement, MultiSelectProps>(
  (
    {
      options,
      values,
      onChange,
      placeholder = 'Sélectionner...',
      label,
      error,
      searchable = true,
      disabled = false,
      maxSelections,
      className,
      ...props
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedOptions = options.filter((opt) => values.includes(opt.value));

    const filteredOptions = searchable
      ? options.filter((opt) =>
          opt.label.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : options;

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setIsOpen(false);
          setSearchQuery('');
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleToggle = (optionValue: string) => {
      if (values.includes(optionValue)) {
        onChange?.(values.filter((v) => v !== optionValue));
      } else {
        if (maxSelections && values.length >= maxSelections) return;
        onChange?.([...values, optionValue]);
      }
    };

    const handleRemove = (optionValue: string, e: React.MouseEvent) => {
      e.stopPropagation();
      onChange?.(values.filter((v) => v !== optionValue));
    };

    return (
      <div ref={ref} className={cn('relative w-full', className)} {...props}>
        {label && (
          <label className="block text-sm font-medium text-stone-700 mb-2">
            {label}
          </label>
        )}

        <div ref={containerRef} className="relative">
          <button
            type="button"
            onClick={() => !disabled && setIsOpen(!isOpen)}
            disabled={disabled}
            className={cn(
              'w-full min-h-[48px] flex flex-wrap items-center gap-2 p-2 rounded-2xl border-2',
              'bg-white border-stone-200 text-left',
              'transition-all duration-200',
              'focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100',
              'hover:border-stone-300',
              isOpen && 'border-primary-500 ring-2 ring-primary-100',
              error && 'border-red-500'
            )}
          >
            {selectedOptions.length > 0 ? (
              selectedOptions.map((option) => (
                <span
                  key={option.value}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-primary-100 text-primary-700 text-sm"
                >
                  {option.icon}
                  {option.label}
                  <button
                    type="button"
                    onClick={(e) => handleRemove(option.value, e)}
                    className="hover:bg-primary-200 rounded p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))
            ) : (
              <span className="px-2 text-stone-400">{placeholder}</span>
            )}
            <ChevronDown
              className={cn(
                'w-5 h-5 text-stone-400 ml-auto shrink-0 transition-transform duration-200',
                isOpen && 'rotate-180'
              )}
            />
          </button>

          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={cn(
                  'absolute z-50 w-full mt-2 py-2 rounded-2xl',
                  'bg-white border border-stone-200 shadow-xl',
                  'max-h-64 overflow-auto'
                )}
              >
                {searchable && (
                  <div className="px-3 pb-2 border-b border-stone-100">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Rechercher..."
                        className="w-full pl-9 pr-4 py-2 text-sm rounded-xl bg-stone-50 border-none focus:outline-none focus:ring-2 focus:ring-primary-100"
                      />
                    </div>
                  </div>
                )}

                <div className="px-1">
                  {filteredOptions.map((option) => {
                    const isSelected = values.includes(option.value);
                    const isDisabled =
                      option.disabled ||
                      (!isSelected && !!maxSelections && values.length >= maxSelections);

                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => !isDisabled && handleToggle(option.value)}
                        disabled={!!isDisabled}
                        className={cn(
                          'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left',
                          'transition-colors duration-150',
                          'hover:bg-stone-50',
                          isSelected && 'bg-primary-50',
                          isDisabled && 'opacity-50 cursor-not-allowed'
                        )}
                      >
                        <div
                          className={cn(
                            'w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0',
                            isSelected
                              ? 'bg-primary-500 border-primary-500'
                              : 'border-stone-300'
                          )}
                        >
                          {isSelected && <Check className="w-3 h-3 text-white" />}
                        </div>
                        {option.icon && <span>{option.icon}</span>}
                        <span className="flex-1 truncate">{option.label}</span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
      </div>
    );
  }
);

MultiSelect.displayName = 'MultiSelect';

export default Select;
