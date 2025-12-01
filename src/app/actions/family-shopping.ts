'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import type { FamilyShoppingList, ShoppingItem } from '@/types/family';

// ==========================================
// LISTE DE COURSES FAMILIALE INTELLIGENTE
// ==========================================

/**
 * Générer une liste de courses depuis un plan familial
 * Avec agrégation intelligente des ingrédients
 */
export async function generateFamilyShoppingList(params: {
    familyId: string;
    mealPlanId?: string;
    weekStartDate?: Date;
}) {
    try {
        const startDate = params.weekStartDate || new Date();

        // 1. Récupérer le plan de repas
        let mealPlan;
        if (params.mealPlanId) {
            mealPlan = await prisma.familyMealPlan.findUnique({
                where: { id: params.mealPlanId },
            });
        } else {
            // Prendre le plan actif
            mealPlan = await prisma.familyMealPlan.findFirst({
                where: {
                    familyId: params.familyId,
                    status: 'active',
                },
                orderBy: { createdAt: 'desc' },
            });
        }

        if (!mealPlan) {
            return { success: false, error: 'Aucun plan de repas trouvé' };
        }

        // 2. Parser le plan
        const planData = JSON.parse(mealPlan.planData);

        // 3. Extraire et agréger tous les ingrédients
        const aggregatedIngredients = await aggregateIngredients(planData);

        // 4. Catégoriser les ingrédients
        const categorizedItems = categorizeIngredients(aggregatedIngredients);

        // 5. Créer la liste de courses
        const shoppingList = await prisma.familyShoppingList.create({
            data: {
                familyId: params.familyId,
                name: `Courses semaine ${startDate.toLocaleDateString('fr-FR')}`,
                weekStartDate: startDate,
                items: JSON.stringify(categorizedItems),
                categories: JSON.stringify(SHOPPING_CATEGORIES),
                estimatedCost: estimateTotalCost(categorizedItems),
                status: 'active',
            },
        });

        revalidatePath(`/family/${params.familyId}/shopping`);
        return { 
            success: true, 
            shoppingList,
            items: categorizedItems,
            stats: {
                totalItems: categorizedItems.length,
                estimatedCost: estimateTotalCost(categorizedItems),
            },
        };
    } catch (error) {
        console.error('Error generating shopping list:', error);
        return { success: false, error: 'Erreur lors de la génération' };
    }
}

/**
 * Agréger les ingrédients de tous les membres et tous les jours
 */
async function aggregateIngredients(planData: any): Promise<Map<string, ShoppingItem>> {
    const ingredientsMap = new Map<string, ShoppingItem>();

    // Parcourir tous les membres
    Object.values(planData.members).forEach((memberPlan: any) => {
        // Parcourir tous les jours
        memberPlan.days.forEach((day: any) => {
            // Parcourir tous les repas
            Object.values(day.meals).forEach((meal: any) => {
                // Parcourir tous les ingrédients
                meal.ingredients?.forEach((ingredient: any) => {
                    const key = normalizeIngredientName(ingredient.name);

                    if (ingredientsMap.has(key)) {
                        // Agréger les quantités
                        const existing = ingredientsMap.get(key)!;
                        
                        // Si même unité, additionner
                        if (existing.unit === ingredient.unit) {
                            existing.quantity += ingredient.quantity;
                        } else {
                            // Convertir en unité commune si possible
                            const converted = convertUnits(
                                ingredient.quantity,
                                ingredient.unit,
                                existing.unit
                            );
                            if (converted !== null) {
                                existing.quantity += converted;
                            } else {
                                // Créer une nouvelle ligne si unités incompatibles
                                const newKey = `${key}_${ingredient.unit}`;
                                ingredientsMap.set(newKey, {
                                    id: newKey,
                                    ingredient: ingredient.name,
                                    quantity: ingredient.quantity,
                                    unit: ingredient.unit,
                                    category: ingredient.category || 'Autre',
                                    checked: false,
                                    priority: 'normal',
                                });
                            }
                        }
                    } else {
                        // Ajouter nouvel ingrédient
                        ingredientsMap.set(key, {
                            id: key,
                            ingredient: ingredient.name,
                            quantity: ingredient.quantity,
                            unit: ingredient.unit,
                            category: ingredient.category || categorizeIngredient(ingredient.name),
                            checked: false,
                            priority: 'normal',
                        });
                    }
                });
            });
        });
    });

    return ingredientsMap;
}

/**
 * Normaliser le nom d'un ingrédient pour l'agrégation
 */
function normalizeIngredientName(name: string): string {
    return name
        .toLowerCase()
        .trim()
        .replace(/[éèê]/g, 'e')
        .replace(/[àâ]/g, 'a')
        .replace(/\s+/g, '_');
}

/**
 * Convertir entre unités compatibles
 */
function convertUnits(quantity: number, fromUnit: string, toUnit: string): number | null {
    const conversions: Record<string, Record<string, number>> = {
        'g': { 'kg': 0.001, 'g': 1 },
        'kg': { 'g': 1000, 'kg': 1 },
        'ml': { 'l': 0.001, 'ml': 1 },
        'l': { 'ml': 1000, 'l': 1 },
        'cl': { 'ml': 10, 'l': 0.01, 'cl': 1 },
    };

    if (conversions[fromUnit]?.[toUnit]) {
        return quantity * conversions[fromUnit][toUnit];
    }

    return null; // Unités incompatibles
}

/**
 * Catégories de courses (disposition rayon supermarché)
 */
const SHOPPING_CATEGORIES = [
    'Fruits & Légumes',
    'Boulangerie',
    'Crémerie',
    'Viandes & Poissons',
    'Épicerie Salée',
    'Épicerie Sucrée',
    'Surgelés',
    'Boissons',
    'Hygiène & Entretien',
    'Autre',
];

/**
 * Catégoriser un ingrédient
 */
function categorizeIngredient(name: string): string {
    const normalized = name.toLowerCase();

    const categories: Record<string, string[]> = {
        'Fruits & Légumes': ['tomate', 'carotte', 'pomme', 'banane', 'salade', 'oignon', 'poivron', 'courgette', 'aubergine', 'citron', 'orange'],
        'Boulangerie': ['pain', 'baguette', 'brioche', 'croissant'],
        'Crémerie': ['lait', 'yaourt', 'fromage', 'beurre', 'crème', 'œuf', 'oeufs'],
        'Viandes & Poissons': ['poulet', 'bœuf', 'porc', 'agneau', 'saumon', 'thon', 'cabillaud', 'viande'],
        'Épicerie Salée': ['riz', 'pâtes', 'huile', 'sel', 'poivre', 'farine', 'conserve'],
        'Épicerie Sucrée': ['sucre', 'chocolat', 'confiture', 'miel', 'biscuit'],
        'Surgelés': ['glace', 'surgelé', 'légumes surgelés'],
        'Boissons': ['eau', 'jus', 'soda', 'café', 'thé'],
    };

    for (const [category, keywords] of Object.entries(categories)) {
        if (keywords.some(keyword => normalized.includes(keyword))) {
            return category;
        }
    }

    return 'Autre';
}

/**
 * Catégoriser les items pour l'affichage
 */
function categorizeIngredients(ingredientsMap: Map<string, ShoppingItem>): ShoppingItem[] {
    const items = Array.from(ingredientsMap.values());
    
    // Trier par catégorie puis par nom
    return items.sort((a, b) => {
        const catCompare = SHOPPING_CATEGORIES.indexOf(a.category) - SHOPPING_CATEGORIES.indexOf(b.category);
        if (catCompare !== 0) return catCompare;
        return a.ingredient.localeCompare(b.ingredient);
    });
}

/**
 * Estimer le coût total
 */
function estimateTotalCost(items: ShoppingItem[]): number {
    // Estimation basique par catégorie
    const categoryPrices: Record<string, number> = {
        'Fruits & Légumes': 2.5,
        'Boulangerie': 1.5,
        'Crémerie': 3,
        'Viandes & Poissons': 8,
        'Épicerie Salée': 2,
        'Épicerie Sucrée': 2.5,
        'Surgelés': 4,
        'Boissons': 1.5,
        'Autre': 3,
    };

    return items.reduce((total, item) => {
        return total + (categoryPrices[item.category] || 3);
    }, 0);
}

/**
 * Mettre à jour un item de la liste
 */
export async function updateShoppingItem(
    shoppingListId: string,
    itemId: string,
    updates: {
        checked?: boolean;
        quantity?: number;
        assignedTo?: string;
        actualPrice?: number;
    }
) {
    try {
        const shoppingList = await prisma.familyShoppingList.findUnique({
            where: { id: shoppingListId },
        });

        if (!shoppingList) {
            return { success: false, error: 'Liste non trouvée' };
        }

        const items: ShoppingItem[] = JSON.parse(shoppingList.items);
        const itemIndex = items.findIndex(i => i.id === itemId);

        if (itemIndex === -1) {
            return { success: false, error: 'Item non trouvé' };
        }

        // Mettre à jour l'item
        items[itemIndex] = {
            ...items[itemIndex],
            ...updates,
            ...(updates.checked && { checkedAt: new Date(), checkedBy: 'current_user' }),
        };

        // Calculer le coût total si prix ajouté
        let actualCost = shoppingList.actualCost || 0;
        if (updates.actualPrice !== undefined) {
            actualCost = items.reduce((sum, i) => sum + (i.actualPrice || 0), 0);
        }

        // Sauvegarder
        const updated = await prisma.familyShoppingList.update({
            where: { id: shoppingListId },
            data: {
                items: JSON.stringify(items),
                actualCost: actualCost > 0 ? actualCost : undefined,
                lastModifiedBy: 'current_user', // TODO: Remplacer par vrai userId
            },
        });

        revalidatePath(`/family/${shoppingList.familyId}/shopping`);
        return { success: true, shoppingList: updated };
    } catch (error) {
        console.error('Error updating shopping item:', error);
        return { success: false, error: 'Erreur lors de la mise à jour' };
    }
}

/**
 * Marquer la liste comme terminée
 */
export async function completeShoppingList(shoppingListId: string) {
    try {
        const updated = await prisma.familyShoppingList.update({
            where: { id: shoppingListId },
            data: {
                status: 'completed',
                completedAt: new Date(),
            },
        });

        revalidatePath(`/family/${updated.familyId}/shopping`);
        return { success: true, shoppingList: updated };
    } catch (error) {
        console.error('Error completing shopping list:', error);
        return { success: false, error: 'Erreur lors de la validation' };
    }
}

