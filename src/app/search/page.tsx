'use client';

import { useState } from 'react';
import { BottomNav } from '@/components/ui/BottomNav';
import { SearchBar } from '@/components/features/search/SearchBar';
import { SearchResults } from '@/components/features/search/SearchResults';
import { QuantitySelector } from '@/components/features/search/QuantitySelector';
import { useSearchStore, selectIsLoading, ProductTypeFilter } from '@/store/search-store';
import { useMealStore } from '@/store/meal-store';
import { ArrowLeft, Database, Globe, Layers } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import type { Product } from '@/types/product';
import type { FoodItem, MealItem, NutritionInfo } from '@/types/meal';
import type { MeasurementUnit } from '@/lib/unit-utils';

export default function SearchPage() {
    const router = useRouter();
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    // Search store
    const query = useSearchStore((state) => state.query);
    const ciqualResults = useSearchStore((state) => state.ciqualResults);
    const offResults = useSearchStore((state) => state.offResults);
    const isLoadingCiqual = useSearchStore((state) => state.isLoadingCiqual);
    const isLoadingOff = useSearchStore((state) => state.isLoadingOff);
    const ciqualError = useSearchStore((state) => state.ciqualError);
    const offError = useSearchStore((state) => state.offError);
    const recentSearches = useSearchStore((state) => state.recentSearches);
    const searchWithDebounce = useSearchStore((state) => state.searchWithDebounce);
    const setQuery = useSearchStore((state) => state.setQuery);
    const clearResults = useSearchStore((state) => state.clearResults);
    const isLoading = useSearchStore(selectIsLoading);
    const productTypeFilter = useSearchStore((state) => state.productTypeFilter);
    const setProductTypeFilter = useSearchStore((state) => state.setProductTypeFilter);

    // Meal store
    const addMeal = useMealStore((state) => state.addMeal);

    // Convert Product to FoodItem
    const productToFoodItem = (product: Product, serving: number): FoodItem => ({
        id: product.id,
        name: product.name,
        brand: product.brand,
        serving,
        servingUnit: 'g',
        nutrition: {
            calories: product.calories,
            proteins: product.proteins,
            carbs: product.carbs,
            fats: product.fats,
            fiber: product.fiber,
            sugar: product.sugar,
            sodium: product.sodium,
        },
        imageUrl: product.image,
        source: product.source === 'CIQUAL' ? 'ciqual' : product.source === 'OFF' ? 'openfoodfacts' : 'manual',
    });

    const handleProductSelect = (product: Product) => {
        setSelectedProduct(product);
    };

    const handleQuantityConfirm = (quantity: number, unit: MeasurementUnit, equivalentGrams: number) => {
        if (!selectedProduct) return;

        const foodItem = productToFoodItem(selectedProduct, equivalentGrams);
        const mealItem: MealItem = {
            id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            food: foodItem,
            quantity: 1,
            customServing: equivalentGrams,
        };

        // Add as a snack by default
        const today = new Date().toISOString().split('T')[0];
        addMeal({
            id: `meal-${Date.now()}`,
            type: 'snack',
            date: today,
            time: new Date().toTimeString().slice(0, 5),
            items: [mealItem],
            totalNutrition: foodItem.nutrition,
            source: 'manual',
            isPlanned: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });

        setSelectedProduct(null);
        clearResults();
        router.push('/meals');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 pb-32">
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-stone-100 px-4 pt-6 pb-4">
                <button
                    onClick={() => router.back()}
                    className="mb-4 text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-2"
                >
                    <ArrowLeft className="h-5 w-5" />
                    <span className="font-medium">Retour</span>
                </button>

                <h1 className="text-2xl font-extrabold text-gray-900 mb-4">
                    Recherche d'aliments
                </h1>

                <SearchBar
                    value={query}
                    onChange={setQuery}
                    onSearch={searchWithDebounce}
                    onClear={clearResults}
                    isLoading={isLoading}
                    autoFocus
                />

                {/* Product Type Filter */}
                <div className="flex gap-2 mt-4">
                    <button
                        onClick={() => setProductTypeFilter('all')}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-all ${
                            productTypeFilter === 'all'
                                ? 'bg-gray-900 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        <Layers size={16} />
                        Tous
                    </button>
                    <button
                        onClick={() => setProductTypeFilter('generic')}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-all ${
                            productTypeFilter === 'generic'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        <Database size={16} />
                        Génériques
                    </button>
                    <button
                        onClick={() => setProductTypeFilter('branded')}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-all ${
                            productTypeFilter === 'branded'
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        <Globe size={16} />
                        Marques
                    </button>
                </div>
            </header>

            <main className="container mx-auto px-4 max-w-md py-4">
                <SearchResults
                    query={query}
                    ciqualResults={ciqualResults}
                    offResults={offResults}
                    recentSearches={recentSearches}
                    isLoadingCiqual={isLoadingCiqual}
                    isLoadingOff={isLoadingOff}
                    ciqualError={ciqualError}
                    offError={offError}
                    onSelectProduct={handleProductSelect}
                    onRecentSearchClick={searchWithDebounce}
                />
            </main>

            {/* Quantity Selector Modal */}
            <AnimatePresence>
                {selectedProduct && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center"
                        onClick={() => setSelectedProduct(null)}
                    >
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-lg"
                        >
                            <QuantitySelector
                                product={selectedProduct}
                                onConfirm={handleQuantityConfirm}
                                onCancel={() => setSelectedProduct(null)}
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <BottomNav />
        </div>
    );
}
