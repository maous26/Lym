'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Plus, Info, Star } from 'lucide-react';
import Image from 'next/image';
import type { Product } from '@/types/product';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  onInfo?: (product: Product) => void;
  isSelected?: boolean;
  className?: string;
}

// Nutriscore colors
const NUTRISCORE_COLORS: Record<string, string> = {
  A: 'bg-green-500',
  B: 'bg-lime-400',
  C: 'bg-yellow-400',
  D: 'bg-orange-400',
  E: 'bg-red-500',
};

// Source badge
const SourceBadge = ({ source }: { source: Product['source'] }) => {
  const config = {
    CIQUAL: { label: 'CIQUAL', color: 'bg-blue-100 text-blue-700' },
    OFF: { label: 'Open Food Facts', color: 'bg-green-100 text-green-700' },
    AI: { label: 'IA', color: 'bg-purple-100 text-purple-700' },
  };

  const { label, color } = config[source];

  return (
    <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-medium', color)}>
      {label}
    </span>
  );
};

// Nutriscore badge
const NutriscoreBadge = ({ grade }: { grade: string }) => {
  const color = NUTRISCORE_COLORS[grade.toUpperCase()] || 'bg-gray-300';

  return (
    <div
      className={cn(
        'w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-sm',
        color
      )}
    >
      {grade.toUpperCase()}
    </div>
  );
};

export function ProductCard({
  product,
  onSelect,
  onInfo,
  isSelected = false,
  className,
}: ProductCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className={cn(
        'flex items-center gap-3 p-3 bg-white rounded-2xl border transition-all cursor-pointer',
        isSelected
          ? 'border-primary-300 bg-primary-50 ring-2 ring-primary-100'
          : 'border-stone-100 hover:border-stone-200 hover:shadow-sm',
        className
      )}
      onClick={() => onSelect(product)}
    >
      {/* Product image */}
      <div className="w-16 h-16 rounded-xl bg-stone-100 overflow-hidden flex-shrink-0">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            width={64}
            height={64}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl">
            🍽️
          </div>
        )}
      </div>

      {/* Product info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h4 className="font-medium text-stone-800 text-sm line-clamp-2 leading-snug">
            {product.name}
          </h4>
          {product.nutriscore && (
            <NutriscoreBadge grade={product.nutriscore} />
          )}
        </div>

        {/* Brand */}
        {product.brand && (
          <div className="text-xs text-stone-500 truncate mb-1">
            {product.brand}
          </div>
        )}

        {/* Nutrition summary */}
        <div className="flex items-center gap-3 text-xs text-stone-600">
          <span className="font-semibold text-amber-600">
            {product.calories} kcal
          </span>
          <span>P: {product.proteins}g</span>
          <span>G: {product.carbs}g</span>
          <span>L: {product.fats}g</span>
        </div>

        {/* Source badge */}
        <div className="mt-2">
          <SourceBadge source={product.source} />
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col items-center gap-2">
        {onInfo && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              onInfo(product);
            }}
            className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-stone-500 hover:bg-stone-200 transition-colors"
            aria-label="Plus d'infos"
          >
            <Info className="w-4 h-4" />
          </motion.button>
        )}

        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center transition-colors',
            isSelected
              ? 'bg-primary-500 text-white'
              : 'bg-primary-100 text-primary-600 hover:bg-primary-200'
          )}
        >
          <Plus className="w-5 h-5" />
        </motion.div>
      </div>
    </motion.div>
  );
}

// Compact variant for lists
export function ProductCardCompact({
  product,
  onSelect,
  className,
}: {
  product: Product;
  onSelect: (product: Product) => void;
  className?: string;
}) {
  return (
    <motion.div
      layout
      whileHover={{ x: 4 }}
      className={cn(
        'flex items-center gap-3 py-2 px-3 hover:bg-stone-50 rounded-xl cursor-pointer transition-colors',
        className
      )}
      onClick={() => onSelect(product)}
    >
      {/* Mini image */}
      <div className="w-10 h-10 rounded-lg bg-stone-100 overflow-hidden flex-shrink-0">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            width={40}
            height={40}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-lg">
            🍽️
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="font-medium text-stone-800 text-sm truncate">
          {product.name}
        </div>
        <div className="text-xs text-stone-500">
          {product.calories} kcal · P:{product.proteins}g
        </div>
      </div>

      {/* Nutriscore */}
      {product.nutriscore && (
        <div
          className={cn(
            'w-6 h-6 rounded flex items-center justify-center text-white text-xs font-bold',
            NUTRISCORE_COLORS[product.nutriscore.toUpperCase()] || 'bg-gray-300'
          )}
        >
          {product.nutriscore.toUpperCase()}
        </div>
      )}

      {/* Add icon */}
      <Plus className="w-4 h-4 text-primary-500" />
    </motion.div>
  );
}

export default ProductCard;
