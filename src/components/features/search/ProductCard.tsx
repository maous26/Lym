"use client";

import { Product } from '@/types/product';
import { motion } from 'framer-motion';
import { Leaf, Package } from 'lucide-react';

interface ProductCardProps {
    product: Product;
    index: number;
}

export const ProductCard = ({ product, index }: ProductCardProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="glass rounded-xl p-4 flex items-center gap-4 hover:scale-[1.02] transition-transform cursor-pointer"
        >
            <div className="h-16 w-16 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                {product.image ? (
                    <div className="relative h-full w-full">
                        <img
                            src={product.image}
                            alt={product.name}
                            className="h-full w-full object-cover"
                        />
                    </div>
                ) : (
                    <div className="text-primary-500">
                        {product.source === 'CIQUAL' ? <Leaf size={24} /> : <Package size={24} />}
                    </div>
                )}
            </div>

            <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-800 truncate">{product.name}</h3>
                <p className="text-xs text-gray-500 mb-1">{product.brand || (product.source === 'CIQUAL' ? 'Produit Frais' : 'Inconnu')}</p>

                <div className="flex gap-3 text-xs text-gray-600">
                    <span className="font-medium text-orange-500">{product.calories} kcal</span>
                    <span>P: {product.proteins}g</span>
                    <span>G: {product.carbs}g</span>
                    <span>L: {product.fats}g</span>
                </div>
            </div>

            {product.nutriscore && (
                <div className={`
          w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm uppercase
          ${getNutriscoreColor(product.nutriscore)}
        `}>
                    {product.nutriscore}
                </div>
            )}
        </motion.div>
    );
};

function getNutriscoreColor(score: string) {
    const s = score.toLowerCase();
    if (s === 'a') return 'bg-green-600';
    if (s === 'b') return 'bg-green-400';
    if (s === 'c') return 'bg-yellow-400';
    if (s === 'd') return 'bg-orange-400';
    if (s === 'e') return 'bg-red-500';
    return 'bg-gray-400';
}
