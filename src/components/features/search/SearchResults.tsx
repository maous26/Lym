"use client";

import { useSearchStore } from '@/store/search-store';
import { ProductCard } from './ProductCard';
import { Loader2 } from 'lucide-react';

export const SearchResults = () => {
    const { freshResults, processedResults, isLoadingFresh, isLoadingProcessed, query } = useSearchStore();

    if (!query) {
        return (
            <div className="text-center mt-20 text-gray-400">
                <p>Commencez à taper pour rechercher des aliments...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-24">
            {/* Fresh Products Section */}
            <section>
                <div className="flex items-center justify-between mb-4 px-2">
                    <h2 className="text-lg font-bold text-primary-800 flex items-center gap-2">
                        🌱 Produits Frais
                        {isLoadingFresh && <Loader2 className="animate-spin h-4 w-4" />}
                    </h2>
                    <span className="text-xs text-primary-600 bg-primary-100 px-2 py-1 rounded-full">
                        {freshResults.length} résultats
                    </span>
                </div>

                <div className="space-y-3">
                    {freshResults.map((product, index) => (
                        <ProductCard key={product.id} product={product} index={index} />
                    ))}
                    {!isLoadingFresh && freshResults.length === 0 && (
                        <p className="text-sm text-gray-500 italic px-2">Aucun produit frais trouvé.</p>
                    )}
                </div>
            </section>

            {/* Processed Products Section */}
            <section>
                <div className="flex items-center justify-between mb-4 px-2">
                    <h2 className="text-lg font-bold text-secondary-800 flex items-center gap-2">
                        📦 Produits Transformés
                        {isLoadingProcessed && <Loader2 className="animate-spin h-4 w-4" />}
                    </h2>
                    <span className="text-xs text-secondary-600 bg-secondary-100 px-2 py-1 rounded-full">
                        {processedResults.length} résultats
                    </span>
                </div>

                <div className="space-y-3">
                    {processedResults.map((product, index) => (
                        <ProductCard key={product.id} product={product} index={index + freshResults.length} />
                    ))}
                    {!isLoadingProcessed && processedResults.length === 0 && (
                        <p className="text-sm text-gray-500 italic px-2">Aucun produit transformé trouvé.</p>
                    )}
                </div>
            </section>
        </div>
    );
};
