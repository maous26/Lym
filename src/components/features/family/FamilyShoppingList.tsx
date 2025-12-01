'use client';

import { useState, useEffect } from 'react';
import { updateShoppingItem, completeShoppingList } from '@/app/actions/family-shopping';
import { ShoppingCart, Check, Circle, DollarSign, Users, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { ShoppingItem } from '@/types/family';

interface FamilyShoppingListProps {
    shoppingListId: string;
    items: ShoppingItem[];
    estimatedCost?: number;
    actualCost?: number;
    status: string;
    onUpdate?: () => void;
}

export function FamilyShoppingList({
    shoppingListId,
    items: initialItems,
    estimatedCost,
    actualCost,
    status,
    onUpdate,
}: FamilyShoppingListProps) {
    const [items, setItems] = useState<ShoppingItem[]>(initialItems);
    const [isUpdating, setIsUpdating] = useState(false);

    // Grouper par catégorie
    const itemsByCategory = items.reduce((acc, item) => {
        if (!acc[item.category]) {
            acc[item.category] = [];
        }
        acc[item.category].push(item);
        return acc;
    }, {} as Record<string, ShoppingItem[]>);

    const categories = Object.keys(itemsByCategory);
    const checkedCount = items.filter(i => i.checked).length;
    const progress = items.length > 0 ? Math.round((checkedCount / items.length) * 100) : 0;

    const handleToggleItem = async (itemId: string) => {
        const item = items.find(i => i.id === itemId);
        if (!item) return;

        // Mise à jour optimiste
        setItems(items.map(i => 
            i.id === itemId ? { ...i, checked: !i.checked } : i
        ));

        // Mise à jour serveur
        setIsUpdating(true);
        const result = await updateShoppingItem(shoppingListId, itemId, {
            checked: !item.checked,
        });
        setIsUpdating(false);

        if (result.success) {
            onUpdate?.();
        }
    };

    const handleComplete = async () => {
        if (window.confirm('Marquer les courses comme terminées ?')) {
            const result = await completeShoppingList(shoppingListId);
            if (result.success) {
                onUpdate?.();
            }
        }
    };

    return (
        <div className="space-y-6">
            {/* Header avec progression */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-3xl p-6 text-white shadow-xl"
            >
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <ShoppingCart size={28} />
                            Liste de Courses
                        </h2>
                        <p className="text-green-100 text-sm">{items.length} articles</p>
                    </div>
                    <div className="text-right">
                        <p className="text-3xl font-bold">{progress}%</p>
                        <p className="text-xs text-green-100">{checkedCount}/{items.length} fait</p>
                    </div>
                </div>

                {/* Barre de progression */}
                <div className="h-3 bg-white/20 rounded-full overflow-hidden mb-4">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5 }}
                        className="h-full bg-white shadow-lg"
                    />
                </div>

                {/* Budget */}
                {estimatedCost && (
                    <div className="flex items-center justify-between bg-white/10 backdrop-blur-sm rounded-xl p-3">
                        <div className="flex items-center gap-2">
                            <DollarSign size={18} />
                            <span className="text-sm">Budget estimé</span>
                        </div>
                        <span className="text-xl font-bold">{estimatedCost}€</span>
                    </div>
                )}
            </motion.div>

            {/* Items par catégorie */}
            <div className="space-y-4">
                {categories.map((category, categoryIndex) => {
                    const categoryItems = itemsByCategory[category];
                    const categoryChecked = categoryItems.filter(i => i.checked).length;

                    return (
                        <motion.div
                            key={category}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: categoryIndex * 0.05 }}
                            className="bg-white rounded-2xl border-2 border-gray-100 overflow-hidden"
                        >
                            {/* Catégorie Header */}
                            <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Package size={16} className="text-gray-600" />
                                    <h3 className="font-bold text-gray-900">{category}</h3>
                                </div>
                                <span className="text-xs text-gray-500">
                                    {categoryChecked}/{categoryItems.length}
                                </span>
                            </div>

                            {/* Items */}
                            <div className="divide-y divide-gray-50">
                                <AnimatePresence>
                                    {categoryItems.map((item, itemIndex) => (
                                        <motion.button
                                            key={item.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ delay: itemIndex * 0.02 }}
                                            onClick={() => handleToggleItem(item.id)}
                                            className={cn(
                                                "w-full px-4 py-3 flex items-center gap-3 transition-all hover:bg-gray-50",
                                                item.checked && "bg-green-50/50"
                                            )}
                                        >
                                            {/* Checkbox */}
                                            <div className={cn(
                                                "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all flex-shrink-0",
                                                item.checked
                                                    ? "bg-green-500 border-green-500"
                                                    : "border-gray-300 bg-white"
                                            )}>
                                                {item.checked && (
                                                    <motion.div
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                    >
                                                        <Check size={16} className="text-white" strokeWidth={3} />
                                                    </motion.div>
                                                )}
                                            </div>

                                            {/* Item info */}
                                            <div className="flex-1 text-left">
                                                <p className={cn(
                                                    "font-medium transition-all",
                                                    item.checked ? "text-gray-400 line-through" : "text-gray-900"
                                                )}>
                                                    {item.ingredient}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {item.quantity} {item.unit}
                                                </p>
                                            </div>

                                            {/* Prix si disponible */}
                                            {item.estimatedPrice && (
                                                <span className="text-sm font-medium text-gray-600">
                                                    {item.estimatedPrice.toFixed(2)}€
                                                </span>
                                            )}
                                        </motion.button>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Bouton terminer */}
            {status === 'active' && progress === 100 && (
                <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={handleComplete}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                >
                    <Check size={20} />
                    Terminer les courses
                </motion.button>
            )}

            {/* Info collaborative */}
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <div className="flex items-start gap-3">
                    <Users size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-medium text-blue-900">Mode collaboratif</p>
                        <p className="text-xs text-blue-700 mt-1">
                            Tous les membres de la famille peuvent cocher les articles en temps réel.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

