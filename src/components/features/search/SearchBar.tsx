"use client";

import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { useSearchStore } from '@/store/search-store';
import { useDebounce } from '@/hooks/use-debounce';
import { cn } from '@/lib/utils';

export const SearchBar = () => {
    const { search, setQuery } = useSearchStore();
    const [localQuery, setLocalQuery] = useState('');
    const debouncedQuery = useDebounce(localQuery, 500);

    useEffect(() => {
        setQuery(debouncedQuery);
        search(debouncedQuery);
    }, [debouncedQuery, search, setQuery]);

    return (
        <div className="relative w-full max-w-md mx-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
                type="text"
                className={cn(
                    "block w-full pl-10 pr-3 py-3 border-none rounded-2xl",
                    "bg-white/80 backdrop-blur-md shadow-lg",
                    "text-gray-900 placeholder-gray-400",
                    "focus:outline-none focus:ring-2 focus:ring-primary-400 focus:bg-white",
                    "transition-all duration-300 ease-in-out"
                )}
                placeholder="Rechercher un aliment (ex: Pomme, Yaourt...)"
                value={localQuery}
                onChange={(e) => setLocalQuery(e.target.value)}
            />
        </div>
    );
};
