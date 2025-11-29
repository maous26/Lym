"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMealStore } from '@/store/meal-store';
import { useSearchStore } from '@/store/search-store';
import { SearchBar } from '@/components/features/search/SearchBar';
import { ProductCard } from '@/components/features/search/ProductCard';
import { MealType } from '@/types/meal';
import { Product } from '@/types/product';
import { detectProductUnit, getUnitConfig, getCommonPortions, formatQuantity, MeasurementUnit } from '@/lib/unit-utils';
import { detectCookingState, getCookingConversion, getCookedPortions, getCookingInfoMessage, adjustForCooking } from '@/lib/cooking-utils';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check } from 'lucide-react';

function AddMealContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { addMeal } = useMealStore();
    const { freshResults, processedResults, query } = useSearchStore();

    const mealType = (searchParams.get('type') || 'breakfast') as MealType;
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [unit, setUnit] = useState<MeasurementUnit>('g');
    const [quantity, setQuantity] = useState<number>(100);
    const [cookingState, setCookingState] = useState<'raw' | 'cooked'>('cooked');

    const allResults = [...freshResults, ...processedResults];

    // When product is selected, detect appropriate unit and cooking state
    useEffect(() => {
        if (selectedProduct) {
            const detectedUnit = detectProductUnit(selectedProduct.name);
            setUnit(detectedUnit);
            const config = getUnitConfig(detectedUnit);
            setQuantity(config.defaultQuantity);

            // Detect cooking state
            const detectedState = detectCookingState(selectedProduct.name);
            setCookingState(detectedState);
        }
    }, [selectedProduct]);

    const handleAddMeal = () => {
        if (selectedProduct) {
            addMeal(selectedProduct, quantity, unit, mealType, date);
            router.back();
        }
    };

    const mealTypeLabels = {
        breakfast: 'Petit-déjeuner',
        lunch: 'Déjeuner',
        snack: 'Collation',
        dinner: 'Dîner',
    };

    const unitConfig = getUnitConfig(unit);
    const commonPortions = selectedProduct ? getCommonPortions(selectedProduct.name) : [];
    const cookedPortions = selectedProduct ? getCookedPortions(selectedProduct.name) : [];
    const cookingInfo = selectedProduct ? getCookingInfoMessage(selectedProduct.name, cookingState) : null;
    const showCookingToggle = selectedProduct && getCookingConversion(selectedProduct.name) !== null;

    // Calculate equivalent grams for nutrition display
    const getEquivalentGrams = () => {
        if (unit === 'g') return quantity;
        if (unit === 'ml') return quantity;
        if (unit === 'unit') {
            const nameLower = selectedProduct?.name.toLowerCase() || '';
            if (nameLower.includes('pomme')) return quantity * 150;
            if (nameLower.includes('banane')) return quantity * 120;
            if (nameLower.includes('orange')) return quantity * 180;
            if (nameLower.includes('œuf') || nameLower.includes('oeuf')) return quantity * 60;
            return quantity * 100;
        }
        return quantity;
    };

    const equivalentGrams = getEquivalentGrams();

    // Get adjusted nutritional values based on cooking state
    const getAdjustedNutrition = () => {
        if (!selectedProduct) return { calories: 0, proteins: 0, carbs: 0, fats: 0 };

        const detectedState = detectCookingState(selectedProduct.name);
        const adjusted = adjustForCooking(
            selectedProduct.name,
            selectedProduct.calories,
            selectedProduct.proteins,
            selectedProduct.carbs,
            selectedProduct.fats,
            detectedState,
            cookingState
        );

        return {
            calories: (adjusted.calories * equivalentGrams) / 100,
            proteins: (adjusted.proteins * equivalentGrams) / 100,
            carbs: (adjusted.carbs * equivalentGrams) / 100,
            fats: (adjusted.fats * equivalentGrams) / 100,
        };
    };

    const nutrition = getAdjustedNutrition();

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 pb-32">
            <div className="container mx-auto px-4 max-w-md pt-8">
                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={() => router.back()}
                        className="mb-4 text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-2"
                    >
                        <ArrowLeft className="h-5 w-5" />
                        <span className="font-medium">Retour</span>
                    </button>

                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Ajouter un aliment
                    </h1>
                    <p className="text-gray-500">
                        {mealTypeLabels[mealType]} • {new Date(date).toLocaleDateString('fr-FR')}
                    </p>
                </div>

                {/* Search */}
                <div className="mb-6">
                    <SearchBar />
                </div>

                {/* Selected Product Panel */}
                <AnimatePresence>
                    {selectedProduct && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="glass rounded-2xl p-6 mb-6 sticky top-4 z-10"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-12 w-12 rounded-xl bg-primary-100 flex items-center justify-center text-2xl shrink-0">
                                    ✓
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-gray-900 truncate">{selectedProduct.name}</h3>
                                    <p className="text-xs text-gray-500">{selectedProduct.source}</p>
                                </div>
                            </div>

                            {/* Unit Selector */}
                            {unit !== 'unit' && (
                                <div className="mb-4">
                                    <label className="text-sm font-medium text-gray-700 mb-2 block">Unité de mesure</label>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                setUnit('g');
                                                setQuantity(100);
                                            }}
                                            className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-all ${unit === 'g'
                                                ? 'bg-primary-600 text-white'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                }`}
                                        >
                                            Grammes
                                        </button>
                                        <button
                                            onClick={() => {
                                                setUnit('ml');
                                                setQuantity(250);
                                            }}
                                            className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-all ${unit === 'ml'
                                                ? 'bg-primary-600 text-white'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                }`}
                                        >
                                            Millilitres
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Common Portions */}
                            {commonPortions.length > 0 && (
                                <div className="mb-4">
                                    <label className="text-sm font-medium text-gray-700 mb-2 block">Portions courantes</label>
                                    <div className="flex flex-wrap gap-2">
                                        {commonPortions.map((portion) => (
                                            <button
                                                key={portion.label}
                                                onClick={() => {
                                                    setUnit('g');
                                                    setQuantity(portion.grams);
                                                }}
                                                className="px-3 py-2 bg-primary-50 text-primary-700 rounded-xl text-xs font-medium hover:bg-primary-100 transition-colors"
                                            >
                                                {portion.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Cooking State Toggle */}
                            {showCookingToggle && (
                                <div className="mb-4">
                                    <label className="text-sm font-medium text-gray-700 mb-2 block">État de cuisson</label>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setCookingState('raw')}
                                            className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-all ${cookingState === 'raw'
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                }`}
                                        >
                                            Cru
                                        </button>
                                        <button
                                            onClick={() => setCookingState('cooked')}
                                            className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-all ${cookingState === 'cooked'
                                                ? 'bg-orange-600 text-white'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                }`}
                                        >
                                            Cuit
                                        </button>
                                    </div>
                                    {cookingInfo && (
                                        <p className="text-xs text-gray-600 mt-2 bg-blue-50 rounded-lg px-3 py-2">
                                            {cookingInfo}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Cooked Portions */}
                            {cookedPortions.length > 0 && (
                                <div className="mb-4">
                                    <label className="text-sm font-medium text-gray-700 mb-2 block">Portions cuites</label>
                                    <div className="flex flex-wrap gap-2">
                                        {cookedPortions.map((portion) => (
                                            <button
                                                key={portion.label}
                                                onClick={() => {
                                                    setUnit('g');
                                                    setQuantity(portion.grams);
                                                    setCookingState('cooked');
                                                }}
                                                className="px-3 py-2 bg-orange-50 text-orange-700 rounded-xl text-xs font-medium hover:bg-orange-100 transition-colors"
                                            >
                                                {portion.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Quantity Selector */}
                            <div className="space-y-3">
                                <label className="text-sm font-medium text-gray-700">
                                    Quantité ({unitConfig.label})
                                </label>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setQuantity(Math.max(unitConfig.step, quantity - unitConfig.step))}
                                        className="h-10 w-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold text-gray-700"
                                    >
                                        -
                                    </button>
                                    <input
                                        type="number"
                                        value={quantity}
                                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                        step={unitConfig.step}
                                        className="flex-1 text-center text-2xl font-bold text-gray-900 bg-transparent border-b-2 border-primary-300 focus:border-primary-600 outline-none py-2"
                                    />
                                    <button
                                        onClick={() => setQuantity(quantity + unitConfig.step)}
                                        className="h-10 w-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold text-gray-700"
                                    >
                                        +
                                    </button>
                                </div>
                                <p className="text-center text-sm text-gray-600">
                                    {formatQuantity(quantity, unit)}
                                    {unit !== 'g' && ` (≈ ${equivalentGrams}g)`}
                                </p>

                                {/* Nutrition Preview */}
                                <div className="bg-primary-50 rounded-xl p-3 grid grid-cols-4 gap-2 text-center">
                                    <div>
                                        <p className="text-xs text-gray-600">Calories</p>
                                        <p className="font-bold text-primary-700">
                                            {Math.round(nutrition.calories)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-600">Protéines</p>
                                        <p className="font-bold text-blue-700">
                                            {Math.round(nutrition.proteins)}g
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-600">Glucides</p>
                                        <p className="font-bold text-green-700">
                                            {Math.round(nutrition.carbs)}g
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-600">Lipides</p>
                                        <p className="font-bold text-yellow-700">
                                            {Math.round(nutrition.fats)}g
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Add Button */}
                            <button
                                onClick={handleAddMeal}
                                className="w-full mt-4 bg-primary-600 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
                            >
                                <Check className="h-5 w-5" />
                                Ajouter au repas
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Search Results */}
                {query && (
                    <div className="space-y-3">
                        <h3 className="font-semibold text-gray-700 px-2">Résultats de recherche</h3>
                        {allResults.map((product, index) => (
                            <div
                                key={product.id}
                                onClick={() => setSelectedProduct(product)}
                                className="cursor-pointer"
                            >
                                <ProductCard product={product} index={index} />
                            </div>
                        ))}
                        {allResults.length === 0 && (
                            <p className="text-center text-gray-400 py-8">Aucun résultat trouvé</p>
                        )}
                    </div>
                )}

                {!query && !selectedProduct && (
                    <div className="text-center py-12 text-gray-400">
                        <p>Recherchez un aliment pour commencer</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function AddMealPage() {
    return (
        <Suspense fallback={<div>Chargement...</div>}>
            <AddMealContent />
        </Suspense>
    );
}
