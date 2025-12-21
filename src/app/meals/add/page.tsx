'use client';

import { useState, useCallback, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  ArrowLeft,
  Search,
  Sparkles,
  Camera,
  Barcode,
  X,
  ShoppingBag,
} from 'lucide-react';
import { SearchBar } from '@/components/features/search/SearchBar';
import { SearchResults } from '@/components/features/search/SearchResults';
import { QuantitySelector } from '@/components/features/search/QuantitySelector';
import { AIMealGenerator } from '@/components/features/ai/AIMealGenerator';
import { PhotoFoodScanner } from '@/components/features/scanner/PhotoFoodScanner';
import { useSearchStore, selectIsLoading } from '@/store/search-store';
import type { AnalyzedFood } from '@/app/actions/food-scanner';
import { useMealStore } from '@/store/meal-store';
import { useUserStore, useSoloProfile } from '@/store/user-store';
import type { Product } from '@/types/product';
import type { MealType, FoodItem, MealItem, NutritionInfo } from '@/types/meal';
import type { MeasurementUnit } from '@/lib/unit-utils';

// Tab types
type InputTab = 'search' | 'ai' | 'photo' | 'barcode';

// Tab configuration
const TABS: { id: InputTab; label: string; icon: React.ElementType }[] = [
  { id: 'search', label: 'Recherche', icon: Search },
  { id: 'ai', label: 'IA', icon: Sparkles },
  { id: 'photo', label: 'Photo', icon: Camera },
  { id: 'barcode', label: 'Code-barres', icon: Barcode },
];

// Meal type labels
const MEAL_TYPE_LABELS: Record<MealType, string> = {
  breakfast: 'Petit-déjeuner',
  lunch: 'Déjeuner',
  snack: 'Collation',
  dinner: 'Dîner',
};

function AddMealContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL params
  const mealType = (searchParams.get('type') as MealType) || 'lunch';
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

  // Local state
  const [activeTab, setActiveTab] = useState<InputTab>('search');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [addedItems, setAddedItems] = useState<MealItem[]>([]);

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

  // Handlers
  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleQuantityConfirm = (quantity: number, unit: MeasurementUnit, equivalentGrams: number) => {
    if (!selectedProduct) return;

    const foodItem = productToFoodItem(selectedProduct, equivalentGrams);
    const mealItem: MealItem = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      food: foodItem,
      quantity: 1, // Already calculated in equivalentGrams
      customServing: equivalentGrams,
    };

    setAddedItems((prev) => [...prev, mealItem]);
    setSelectedProduct(null);
    clearResults();
  };

  const handleRemoveItem = (itemId: string) => {
    setAddedItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const handleSaveMeal = () => {
    if (addedItems.length === 0) return;

    // Calculate total nutrition
    const totalNutrition: NutritionInfo = addedItems.reduce<NutritionInfo>(
      (total, item) => {
        const mult = item.quantity;
        return {
          calories: total.calories + item.food.nutrition.calories * mult,
          proteins: total.proteins + item.food.nutrition.proteins * mult,
          carbs: total.carbs + item.food.nutrition.carbs * mult,
          fats: total.fats + item.food.nutrition.fats * mult,
          fiber: (total.fiber || 0) + (item.food.nutrition.fiber || 0) * mult,
          sugar: (total.sugar || 0) + (item.food.nutrition.sugar || 0) * mult,
          sodium: (total.sodium || 0) + (item.food.nutrition.sodium || 0) * mult,
        };
      },
      { calories: 0, proteins: 0, carbs: 0, fats: 0, fiber: 0, sugar: 0, sodium: 0 }
    );

    // Create and save meal
    addMeal({
      id: `meal-${Date.now()}`,
      type: mealType,
      date,
      time: new Date().toTimeString().slice(0, 5),
      items: addedItems,
      totalNutrition,
      source: 'manual',
      isPlanned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    router.back();
  };

  const handleBack = () => {
    if (selectedProduct) {
      setSelectedProduct(null);
    } else {
      router.back();
    }
  };

  // Calculate total for added items
  const totalCalories = addedItems.reduce(
    (sum, item) => sum + item.food.nutrition.calories * item.quantity,
    0
  );

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <div className="bg-white sticky top-0 z-20 border-b border-stone-100">
        <div className="flex items-center gap-3 px-4 py-3">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleBack}
            className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-stone-600"
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          <div className="flex-1">
            <h1 className="font-semibold text-stone-800">
              Ajouter un aliment
            </h1>
            <span className="text-sm text-stone-500">
              {MEAL_TYPE_LABELS[mealType]}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex px-4 gap-2 pb-3">
          {TABS.map(({ id, label, icon: Icon }) => (
            <motion.button
              key={id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab(id)}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-medium transition-colors',
                activeTab === id
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              )}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4">
        <AnimatePresence mode="wait">
          {activeTab === 'search' && (
            <motion.div
              key="search"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {/* Search Bar */}
              <SearchBar
                value={query}
                onChange={setQuery}
                onSearch={searchWithDebounce}
                onClear={clearResults}
                isLoading={isLoading}
                autoFocus
              />

              {/* Search Results */}
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
            </motion.div>
          )}

          {activeTab === 'ai' && (
            <motion.div
              key="ai"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <AIMealGenerator
                mealType={mealType}
                onAddToMeal={(recipe) => {
                  // Convert AI recipe to MealItem
                  const foodItem: FoodItem = {
                    id: `ai-${Date.now()}`,
                    name: recipe.title,
                    serving: recipe.servings || 1,
                    servingUnit: 'portion',
                    nutrition: recipe.nutrition,
                    source: 'ai',
                  };
                  const mealItem: MealItem = {
                    id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                    food: foodItem,
                    quantity: 1,
                    customServing: 1,
                  };
                  setAddedItems((prev) => [...prev, mealItem]);
                }}
              />
            </motion.div>
          )}

          {activeTab === 'photo' && (
            <motion.div
              key="photo"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <PhotoFoodScanner
                mealType={mealType}
                onFoodDetected={(foods: AnalyzedFood[], totalNutrition: NutritionInfo) => {
                  // Convert detected foods to MealItems
                  const newItems: MealItem[] = foods.map((food, index) => {
                    const foodItem: FoodItem = {
                      id: `scan-${Date.now()}-${index}`,
                      name: food.name,
                      serving: food.estimatedWeight,
                      servingUnit: 'g',
                      nutrition: food.nutrition,
                      source: 'ai',
                    };
                    return {
                      id: `${Date.now()}-${index}-${Math.random().toString(36).substring(2, 9)}`,
                      food: foodItem,
                      quantity: 1,
                      customServing: food.estimatedWeight,
                    };
                  });
                  setAddedItems((prev) => [...prev, ...newItems]);
                }}
              />
            </motion.div>
          )}

          {activeTab === 'barcode' && (
            <motion.div
              key="barcode"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-center py-12"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center mx-auto mb-4">
                <Barcode className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="font-semibold text-stone-700 mb-2">
                Scanner un code-barres
              </h3>
              <p className="text-sm text-stone-500 max-w-xs mx-auto">
                Scannez le code-barres d'un produit pour obtenir ses informations nutritionnelles.
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="mt-4 px-6 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl font-medium"
              >
                Bientôt disponible
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

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

      {/* Added Items Footer */}
      <AnimatePresence>
        {addedItems.length > 0 && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 p-4 z-30"
          >
            {/* Items preview */}
            <div className="flex items-center gap-3 mb-3 overflow-x-auto pb-2">
              {addedItems.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center gap-2 bg-stone-100 rounded-xl px-3 py-2 flex-shrink-0"
                >
                  <span className="text-sm font-medium text-stone-700 truncate max-w-[120px]">
                    {item.food.name}
                  </span>
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="w-5 h-5 rounded-full bg-stone-300 flex items-center justify-center text-stone-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </motion.div>
              ))}
            </div>

            {/* Summary and save button */}
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-stone-500" />
                  <span className="text-sm text-stone-600">
                    {addedItems.length} aliment{addedItems.length > 1 ? 's' : ''}
                  </span>
                </div>
                <div className="text-lg font-bold text-amber-600">
                  {Math.round(totalCalories)} kcal
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSaveMeal}
                className="px-8 py-3 bg-primary-600 text-white rounded-xl font-semibold shadow-lg"
              >
                Enregistrer
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AddMealPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-stone-50 flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" />
        </div>
      }
    >
      <AddMealContent />
    </Suspense>
  );
}
