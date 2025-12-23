'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Mic, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch?: (value: string) => void;
  onClear?: () => void;
  onVoiceSearch?: () => void;
  placeholder?: string;
  isLoading?: boolean;
  autoFocus?: boolean;
  className?: string;
  debounceMs?: number;
}

export function SearchBar({
  value,
  onChange,
  onSearch,
  onClear,
  onVoiceSearch,
  placeholder = 'Rechercher un aliment...',
  isLoading = false,
  autoFocus = false,
  className,
  debounceMs = 300,
}: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Sync local value with prop
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Debounced search
  const handleChange = useCallback(
    (newValue: string) => {
      setLocalValue(newValue);

      // Clear existing timeout
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      // Set new timeout
      debounceRef.current = setTimeout(() => {
        onChange(newValue);
        if (onSearch && newValue.length >= 2) {
          onSearch(newValue);
        }
      }, debounceMs);
    },
    [onChange, onSearch, debounceMs]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  // Auto focus
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleClear = () => {
    setLocalValue('');
    onChange('');
    onClear?.();
    inputRef.current?.focus();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (localValue.trim() && onSearch) {
      onSearch(localValue.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn('relative', className)}>
      <motion.div
        animate={{
          scale: isFocused ? 1.01 : 1,
          boxShadow: isFocused
            ? '0 4px 20px rgba(0, 0, 0, 0.1)'
            : '0 2px 8px rgba(0, 0, 0, 0.05)',
        }}
        transition={{ duration: 0.2 }}
        className="relative flex items-center bg-white rounded-2xl border border-stone-200 transition-colors"
      >
        {/* Search icon */}
        <div className="pl-4 pr-2">
          {isLoading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <Loader2 className="w-5 h-5 text-primary-500" />
            </motion.div>
          ) : (
            <Search
              className={cn(
                'w-5 h-5 transition-colors',
                isFocused ? 'text-primary-500' : 'text-stone-400'
              )}
            />
          )}
        </div>

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={localValue}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="flex-1 py-3.5 pr-2 bg-transparent text-stone-800 placeholder:text-stone-400 focus:outline-none text-base"
          aria-label="Rechercher"
        />

        {/* Action buttons */}
        <div className="flex items-center gap-1 pr-2">
          {/* Clear button */}
          <AnimatePresence>
            {localValue && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                type="button"
                onClick={handleClear}
                className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 hover:bg-stone-200 transition-colors"
                aria-label="Effacer"
              >
                <X className="w-4 h-4" />
              </motion.button>
            )}
          </AnimatePresence>

          {/* Voice search button */}
          {onVoiceSearch && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              type="button"
              onClick={onVoiceSearch}
              className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center text-primary-600 hover:bg-primary-100 transition-colors"
              aria-label="Recherche vocale"
            >
              <Mic className="w-4 h-4" />
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Search hint */}
      <AnimatePresence>
        {isFocused && !localValue && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="absolute left-4 right-4 -bottom-6 text-xs text-stone-500 text-center"
          >
            Tapez au moins 2 caractères pour rechercher
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
}

export default SearchBar;
