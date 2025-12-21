'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Database, Globe, AlertCircle, History, TrendingUp } from 'lucide-react';
import { ProductCard, ProductCardCompact } from './ProductCard';
import type { Product } from '@/types/product';

interface SearchResultsProps {
  query: string;
  ciqualResults: Product[];
  offResults: Product[];
  recentSearches?: string[];
  isLoadingCiqual: boolean;
  isLoadingOff: boolean;
  ciqualError?: string | null;
  offError?: string | null;
  onSelectProduct: (product: Product) => void;
  onProductInfo?: (product: Product) => void;
  onRecentSearchClick?: (query: string) => void;
  selectedProductId?: string;
  compact?: boolean;
  className?: string;
}

// Loading skeleton
const ProductSkeleton = () => (
  <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-2xl animate-pulse">
    <div className="w-16 h-16 rounded-xl bg-stone-200" />
    <div className="flex-1 space-y-2">
      <div className="h-4 bg-stone-200 rounded w-3/4" />
      <div className="h-3 bg-stone-200 rounded w-1/2" />
      <div className="h-3 bg-stone-200 rounded w-2/3" />
    </div>
    <div className="w-10 h-10 rounded-xl bg-stone-200" />
  </div>
);

// Empty state
const EmptyState = ({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="text-center py-8 px-4"
  >
    <div className="w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center mx-auto mb-3">
      <Icon className="w-6 h-6 text-stone-400" />
    </div>
    <h4 className="font-medium text-stone-700 mb-1">{title}</h4>
    <p className="text-sm text-stone-500">{description}</p>
  </motion.div>
);

// Section header with expandable toggle
const SectionHeader = ({
  icon: Icon,
  title,
  count,
  color,
  isExpanded,
  onToggle,
}: {
  icon: React.ElementType;
  title: string;
  count: number;
  color: string;
  isExpanded?: boolean;
  onToggle?: () => void;
}) => (
  <button
    onClick={onToggle}
    className="flex items-center gap-2 mb-3 w-full text-left group"
  >
    <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center transition-opacity', color)}>
      <Icon className="w-4 h-4 text-white" />
    </div>
    <span className="font-medium text-stone-700">{title}</span>
    <span className="text-xs text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full">
      {count}
    </span>
    {onToggle && (
      <div className={cn("ml-auto transition-transform", isExpanded ? "rotate-180" : "")}>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    )}
  </button>
);

export function SearchResults({
  query,
  ciqualResults,
  offResults,
  recentSearches = [],
  isLoadingCiqual,
  isLoadingOff,
  ciqualError,
  offError,
  onSelectProduct,
  onProductInfo,
  onRecentSearchClick,
  selectedProductId,
  compact = false,
  className,
}: SearchResultsProps) {
  const hasQuery = query.length >= 2;
  const hasResults = ciqualResults.length > 0 || offResults.length > 0;
  const isLoading = isLoadingCiqual || isLoadingOff;

  // Filter state
  const [filter, setFilter] = useState<'all' | 'ciqual' | 'off'>('all');

  // Show recent searches when no query
  if (!hasQuery) {
    // ... (rest of recent searches logic)
    return (
      <div className={cn('space-y-4', className)}>
        {/* Recent searches */}
        {recentSearches.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3 px-1">
              <History className="w-4 h-4 text-stone-400" />
              <span className="text-sm font-medium text-stone-600">
                Recherches récentes
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {recentSearches.slice(0, 8).map((search) => (
                <motion.button
                  key={search}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onRecentSearchClick?.(search)}
                  className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 rounded-full text-sm text-stone-700 transition-colors"
                >
                  {search}
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Popular suggestion */}
        <div className="text-center py-6 text-stone-500 text-sm">
          <TrendingUp className="w-5 h-5 mx-auto mb-2 text-stone-400" />
          Recherchez un aliment pour commencer
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading && !hasResults) {
    return (
      <div className={cn('space-y-3', className)}>
        <ProductSkeleton />
        <ProductSkeleton />
        <ProductSkeleton />
      </div>
    );
  }

  // No results
  if (!isLoading && !hasResults) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="Aucun résultat"
        description={`Aucun aliment trouvé pour "${query}". Essayez avec d'autres termes.`}
      />
    );
  }

  const ProductComponent = compact ? ProductCardCompact : ProductCard;

  const showCiqual = (filter === 'all' || filter === 'ciqual') && (ciqualResults.length > 0 || isLoadingCiqual);
  const showOff = (filter === 'all' || filter === 'off') && (offResults.length > 0 || isLoadingOff);

  return (
    <div className={cn('space-y-6', className)}>

      {/* Filters */}
      <div className="flex gap-2 pb-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setFilter('all')}
          className={cn(
            "px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap",
            filter === 'all'
              ? "bg-stone-800 text-white"
              : "bg-stone-100 text-stone-600 hover:bg-stone-200"
          )}
        >
          Tout
        </button>
        {(ciqualResults.length > 0 || isLoadingCiqual) && (
          <button
            onClick={() => setFilter('ciqual')}
            className={cn(
              "px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2",
              filter === 'ciqual'
                ? "bg-blue-600 text-white"
                : "bg-blue-50 text-blue-700 hover:bg-blue-100"
            )}
          >
            <div className="w-2 h-2 rounded-full bg-current opacity-70" />
            Base générique ({ciqualResults.length})
          </button>
        )}
        {(offResults.length > 0 || isLoadingOff) && (
          <button
            onClick={() => setFilter('off')}
            className={cn(
              "px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2",
              filter === 'off'
                ? "bg-green-600 text-white"
                : "bg-green-50 text-green-700 hover:bg-green-100"
            )}
          >
            <div className="w-2 h-2 rounded-full bg-current opacity-70" />
            Produits de marque ({offResults.length})
          </button>
        )}
      </div>

      {/* CIQUAL Results */}
      {showCiqual && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          {filter === 'all' && (
            <SectionHeader
              icon={Database}
              title="Aliments génériques"
              count={ciqualResults.length}
              color="bg-blue-500"
            />
          )}

          {ciqualError ? (
            <div className="text-sm text-red-500 py-2">{ciqualError}</div>
          ) : (
            <AnimatePresence mode="popLayout">
              <div className="space-y-2">
                {isLoadingCiqual && ciqualResults.length === 0 ? (
                  <>
                    <ProductSkeleton />
                    <ProductSkeleton />
                  </>
                ) : (
                  ciqualResults.map((product) => (
                    <ProductComponent
                      key={product.id}
                      product={product}
                      onSelect={onSelectProduct}
                      onInfo={onProductInfo}
                      isSelected={product.id === selectedProductId}
                    />
                  ))
                )}
              </div>
            </AnimatePresence>
          )}
        </div>
      )}

      {/* Open Food Facts Results */}
      {showOff && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-75">
          {filter === 'all' && (
            <SectionHeader
              icon={Globe}
              title="Produits de marque"
              count={offResults.length}
              color="bg-green-500"
            />
          )}

          {offError ? (
            <div className="text-sm text-red-500 py-2">{offError}</div>
          ) : (
            <AnimatePresence mode="popLayout">
              <div className="space-y-2">
                {isLoadingOff && offResults.length === 0 ? (
                  <>
                    <ProductSkeleton />
                    <ProductSkeleton />
                  </>
                ) : (
                  offResults.map((product) => (
                    <ProductComponent
                      key={product.id}
                      product={product}
                      onSelect={onSelectProduct}
                      onInfo={onProductInfo}
                      isSelected={product.id === selectedProductId}
                    />
                  ))
                )}
              </div>
            </AnimatePresence>
          )}
        </div>
      )}

      {/* Loading more indicator */}
      {isLoading && hasResults && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-4 text-sm text-stone-500"
        >
          Chargement de plus de résultats...
        </motion.div>
      )}
    </div>
  );
}

export default SearchResults;
