'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Minus, Plus, Scale, Info, Check } from 'lucide-react';
import type { Product } from '@/types/product';
import {
  MeasurementUnit,
  detectProductUnit,
  getUnitConfig,
  getCommonPortions,
  formatQuantity,
  toEquivalentGrams,
  getAvailableUnits,
} from '@/lib/unit-utils';
import {
  detectCookingState,
  getCookingInfoMessage,
  requiresCookingConsideration,
  CookingState,
} from '@/lib/cooking-utils';

interface QuantitySelectorProps {
  product: Product;
  onConfirm: (quantity: number, unit: MeasurementUnit, equivalentGrams: number) => void;
  onCancel: () => void;
  className?: string;
}

export function QuantitySelector({
  product,
  onConfirm,
  onCancel,
  className,
}: QuantitySelectorProps) {
  // Detect defaults
  const defaultUnit = detectProductUnit(product.name);
  const unitConfig = getUnitConfig(defaultUnit);
  const portions = getCommonPortions(product.name);
  const cookingState = detectCookingState(product.name);
  const cookingInfo = getCookingInfoMessage(product.name, cookingState);
  const hasCookingConsideration = requiresCookingConsideration(product.name);

  // State
  const [quantity, setQuantity] = useState(unitConfig.defaultQuantity);
  const [unit, setUnit] = useState<MeasurementUnit>(defaultUnit);
  const [selectedPortion, setSelectedPortion] = useState<number | null>(null);

  // Available units for this product
  const availableUnits = getAvailableUnits(product.name);

  // Calculate nutrition based on quantity
  const equivalentGrams = toEquivalentGrams(product.name, quantity, unit);
  const ratio = equivalentGrams / 100;
  const nutrition = {
    calories: Math.round(product.calories * ratio),
    proteins: Math.round(product.proteins * ratio * 10) / 10,
    carbs: Math.round(product.carbs * ratio * 10) / 10,
    fats: Math.round(product.fats * ratio * 10) / 10,
  };

  // Update quantity when unit changes
  useEffect(() => {
    const config = getUnitConfig(unit);
    setQuantity(config.defaultQuantity);
    setSelectedPortion(null);
  }, [unit]);

  // Handlers
  const handleDecrement = () => {
    const config = getUnitConfig(unit);
    const newValue = Math.max(config.minQuantity, quantity - config.step);
    setQuantity(newValue);
    setSelectedPortion(null);
  };

  const handleIncrement = () => {
    const config = getUnitConfig(unit);
    const newValue = Math.min(config.maxQuantity, quantity + config.step);
    setQuantity(newValue);
    setSelectedPortion(null);
  };

  const handlePortionSelect = (grams: number, index: number) => {
    if (unit === 'g' || unit === 'ml') {
      setQuantity(grams);
    } else {
      // For units, convert grams back to unit count
      const unitWeight = equivalentGrams / quantity;
      setQuantity(Math.round((grams / unitWeight) * 10) / 10);
    }
    setSelectedPortion(index);
  };

  const handleConfirm = () => {
    onConfirm(quantity, unit, equivalentGrams);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className={cn(
        'bg-white rounded-3xl shadow-lg border border-stone-100 overflow-hidden',
        className
      )}
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-stone-100">
        <h3 className="font-semibold text-stone-800 line-clamp-1">
          {product.name}
        </h3>
        {product.brand && (
          <div className="text-sm text-stone-500">{product.brand}</div>
        )}
      </div>

      {/* Quantity input */}
      <div className="p-5">
        {/* Unit selector */}
        {availableUnits.length > 1 && (
          <div className="flex gap-2 mb-4">
            {availableUnits.map((u) => {
              const config = getUnitConfig(u);
              return (
                <motion.button
                  key={u}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setUnit(u)}
                  className={cn(
                    'flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-colors',
                    unit === u
                      ? 'bg-primary-100 text-primary-700 ring-2 ring-primary-200'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  )}
                >
                  {config.label}
                </motion.button>
              );
            })}
          </div>
        )}

        {/* Quantity stepper */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleDecrement}
            disabled={quantity <= getUnitConfig(unit).minQuantity}
            className="w-12 h-12 rounded-xl bg-stone-100 flex items-center justify-center text-stone-600 hover:bg-stone-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Minus className="w-5 h-5" />
          </motion.button>

          <div className="text-center min-w-[120px]">
            <motion.div
              key={quantity}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-3xl font-bold text-stone-800"
            >
              {formatQuantity(quantity, unit)}
            </motion.div>
            <div className="text-sm text-stone-500 mt-1">
              {unit !== 'g' && `≈ ${Math.round(equivalentGrams)}g`}
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleIncrement}
            disabled={quantity >= getUnitConfig(unit).maxQuantity}
            className="w-12 h-12 rounded-xl bg-stone-100 flex items-center justify-center text-stone-600 hover:bg-stone-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Quick portions */}
        {portions.length > 0 && (
          <div className="mb-6">
            <div className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-2 px-1">
              Portions suggérées
            </div>
            <div className="flex flex-wrap gap-2">
              {portions.map((portion, index) => (
                <motion.button
                  key={portion.label}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handlePortionSelect(portion.grams, index)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm transition-colors',
                    selectedPortion === index
                      ? 'bg-primary-100 text-primary-700 ring-2 ring-primary-200'
                      : 'bg-stone-50 text-stone-600 hover:bg-stone-100'
                  )}
                >
                  {portion.icon && <span>{portion.icon}</span>}
                  <span>{portion.label}</span>
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Cooking info */}
        {cookingInfo && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="flex items-start gap-2 p-3 bg-amber-50 rounded-xl mb-4"
          >
            <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-amber-800">{cookingInfo}</span>
          </motion.div>
        )}

        {/* Nutrition preview */}
        <div className="bg-stone-50 rounded-2xl p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-stone-600">
              Valeurs nutritionnelles
            </span>
            <div className="flex items-center gap-1 text-xs text-stone-500">
              <Scale className="w-3 h-3" />
              <span>pour {Math.round(equivalentGrams)}g</span>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3">
            <div className="text-center">
              <div className="text-lg font-bold text-amber-600">
                {nutrition.calories}
              </div>
              <div className="text-xs text-stone-500">kcal</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-rose-600">
                {nutrition.proteins}g
              </div>
              <div className="text-xs text-stone-500">Prot.</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-amber-600">
                {nutrition.carbs}g
              </div>
              <div className="text-xs text-stone-500">Gluc.</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">
                {nutrition.fats}g
              </div>
              <div className="text-xs text-stone-500">Lip.</div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl bg-stone-100 text-stone-600 font-medium hover:bg-stone-200 transition-colors"
          >
            Annuler
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleConfirm}
            className="flex-1 py-3 rounded-xl bg-primary-600 text-white font-medium hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
          >
            <Check className="w-5 h-5" />
            <span>Ajouter</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

export default QuantitySelector;
