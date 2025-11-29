import { create } from 'zustand';
import { Product } from '@/types/product';
import { searchCiqual } from '@/lib/search/ciqual-service';
import { searchOpenFoodFacts } from '@/lib/search/off-service';

interface SearchState {
    query: string;
    freshResults: Product[];
    processedResults: Product[];
    isLoadingFresh: boolean;
    isLoadingProcessed: boolean;

    setQuery: (query: string) => void;
    search: (query: string) => Promise<void>;
    clearResults: () => void;
}

export const useSearchStore = create<SearchState>((set, get) => ({
    query: '',
    freshResults: [],
    processedResults: [],
    isLoadingFresh: false,
    isLoadingProcessed: false,

    setQuery: (query) => set({ query }),

    search: async (query: string) => {
        if (!query.trim()) {
            get().clearResults();
            return;
        }

        set({ isLoadingFresh: true, isLoadingProcessed: true, freshResults: [], processedResults: [] });

        // 1. Search Ciqual (Sync but we treat as async for consistency or just run it)
        try {
            const ciqualResults = searchCiqual(query);
            set({ freshResults: ciqualResults, isLoadingFresh: false });
        } catch (e) {
            console.error(e);
            set({ isLoadingFresh: false });
        }

        // 2. Search OFF (Async)
        try {
            const offResults = await searchOpenFoodFacts(query);
            set({ processedResults: offResults, isLoadingProcessed: false });
        } catch (e) {
            console.error(e);
            set({ isLoadingProcessed: false });
        }
    },

    clearResults: () => set({ freshResults: [], processedResults: [], query: '' }),
}));
