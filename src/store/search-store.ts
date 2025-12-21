// Search Store - Manages product search state across CIQUAL and OFF databases
import { create } from 'zustand';
import { Product } from '@/types/product';
import { searchCiqual, getPopularCiqualProducts } from '@/lib/search/ciqual-service';
import { searchOpenFoodFacts, getTrendingProducts } from '@/lib/search/off-service';

// Debounce delay for search
const SEARCH_DEBOUNCE_MS = 300;

// Search source type
export type SearchSource = 'all' | 'ciqual' | 'off';

// Product type filter (generic = CIQUAL, branded = OFF)
export type ProductTypeFilter = 'all' | 'generic' | 'branded';

interface SearchState {
  // Search query
  query: string;
  source: SearchSource;
  productTypeFilter: ProductTypeFilter;

  // Results
  ciqualResults: Product[];
  offResults: Product[];

  // Loading states
  isLoadingCiqual: boolean;
  isLoadingOff: boolean;

  // Error states
  ciqualError: string | null;
  offError: string | null;

  // Recent searches
  recentSearches: string[];

  // Actions
  setQuery: (query: string) => void;
  setSource: (source: SearchSource) => void;
  setProductTypeFilter: (filter: ProductTypeFilter) => void;
  search: (query: string) => Promise<void>;
  searchWithDebounce: (query: string) => void;
  clearResults: () => void;
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
  loadPopularProducts: () => Promise<void>;
}

// Debounce timer
let searchTimeout: NodeJS.Timeout | null = null;

export const useSearchStore = create<SearchState>((set, get) => ({
  // Initial state
  query: '',
  source: 'all',
  productTypeFilter: 'all',
  ciqualResults: [],
  offResults: [],
  isLoadingCiqual: false,
  isLoadingOff: false,
  ciqualError: null,
  offError: null,
  recentSearches: [],

  setQuery: (query) => set({ query }),

  setSource: (source) => set({ source }),

  setProductTypeFilter: (filter) => {
    set({ productTypeFilter: filter });
    // Re-search with current query if there is one
    const { query } = get();
    if (query.length >= 2) {
      get().search(query);
    }
  },

  search: async (query: string) => {
    if (!query.trim() || query.length < 2) {
      get().clearResults();
      return;
    }

    const { source, productTypeFilter } = get();

    // Determine which sources to search based on filter
    const shouldSearchCiqual =
      (productTypeFilter === 'all' || productTypeFilter === 'generic') &&
      (source === 'all' || source === 'ciqual');

    const shouldSearchOff =
      (productTypeFilter === 'all' || productTypeFilter === 'branded') &&
      (source === 'all' || source === 'off');

    // Set loading states
    set({
      query,
      isLoadingCiqual: shouldSearchCiqual,
      isLoadingOff: shouldSearchOff,
      ciqualError: null,
      offError: null,
      // Clear results for sources we won't search
      ciqualResults: shouldSearchCiqual ? get().ciqualResults : [],
      offResults: shouldSearchOff ? get().offResults : [],
    });

    // Parallel search with independent error handling
    const promises: Promise<void>[] = [];

    // CIQUAL search (synchronous but wrapped) - Generic products
    if (shouldSearchCiqual) {
      promises.push(
        (async () => {
          try {
            const results = searchCiqual(query);
            set({ ciqualResults: results, isLoadingCiqual: false });
          } catch (error) {
            console.error('CIQUAL search error:', error);
            set({
              ciqualResults: [],
              isLoadingCiqual: false,
              ciqualError: 'Erreur de recherche CIQUAL',
            });
          }
        })()
      );
    }

    // OFF search (asynchronous) - Branded products
    if (shouldSearchOff) {
      promises.push(
        (async () => {
          try {
            const results = await searchOpenFoodFacts(query);
            set({ offResults: results, isLoadingOff: false });
          } catch (error) {
            console.error('OFF search error:', error);
            set({
              offResults: [],
              isLoadingOff: false,
              offError: 'Erreur de recherche Open Food Facts',
            });
          }
        })()
      );
    }

    await Promise.all(promises);

    // Add to recent searches
    get().addRecentSearch(query);
  },

  searchWithDebounce: (query: string) => {
    set({ query });

    // Clear existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Set new timeout
    searchTimeout = setTimeout(() => {
      get().search(query);
    }, SEARCH_DEBOUNCE_MS);
  },

  clearResults: () => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    set({
      query: '',
      ciqualResults: [],
      offResults: [],
      isLoadingCiqual: false,
      isLoadingOff: false,
      ciqualError: null,
      offError: null,
    });
  },

  addRecentSearch: (query: string) => {
    const normalized = query.trim().toLowerCase();
    if (normalized.length < 2) return;

    set((state) => {
      const existing = state.recentSearches.filter(
        (s) => s.toLowerCase() !== normalized
      );
      const updated = [query.trim(), ...existing].slice(0, 10);

      // Persist to localStorage
      try {
        localStorage.setItem('lym-recent-searches', JSON.stringify(updated));
      } catch {
        // Ignore storage errors
      }

      return { recentSearches: updated };
    });
  },

  clearRecentSearches: () => {
    try {
      localStorage.removeItem('lym-recent-searches');
    } catch {
      // Ignore
    }
    set({ recentSearches: [] });
  },

  loadPopularProducts: async () => {
    set({ isLoadingCiqual: true, isLoadingOff: true });

    try {
      // Load CIQUAL popular products
      const ciqualPopular = getPopularCiqualProducts();
      set({ ciqualResults: ciqualPopular, isLoadingCiqual: false });
    } catch {
      set({ isLoadingCiqual: false });
    }

    try {
      // Load OFF trending products
      const offTrending = await getTrendingProducts();
      set({ offResults: offTrending, isLoadingOff: false });
    } catch {
      set({ isLoadingOff: false });
    }
  },
}));

// Initialize recent searches from localStorage
if (typeof window !== 'undefined') {
  try {
    const stored = localStorage.getItem('lym-recent-searches');
    if (stored) {
      const searches = JSON.parse(stored);
      if (Array.isArray(searches)) {
        useSearchStore.setState({ recentSearches: searches });
      }
    }
  } catch {
    // Ignore storage errors
  }
}

// Selectors for optimized re-renders
export const selectIsLoading = (state: SearchState) =>
  state.isLoadingCiqual || state.isLoadingOff;

export const selectHasResults = (state: SearchState) =>
  state.ciqualResults.length > 0 || state.offResults.length > 0;

export const selectAllResults = (state: SearchState): Product[] => {
  // Merge and deduplicate results, prioritizing CIQUAL
  const seen = new Set<string>();
  const results: Product[] = [];

  // Add CIQUAL results first (higher quality nutritional data)
  for (const product of state.ciqualResults) {
    const key = product.name.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      results.push(product);
    }
  }

  // Add OFF results
  for (const product of state.offResults) {
    const key = product.name.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      results.push(product);
    }
  }

  return results;
};
