export type MeasurementUnit = 'g' | 'ml' | 'unit';

export interface UnitConversion {
    unit: MeasurementUnit;
    label: string;
    defaultQuantity: number;
    step: number;
    equivalentGrams?: number; // For conversion to base nutritional values
}

// Detect appropriate unit based on product name and category
export const detectProductUnit = (productName: string, category?: string): MeasurementUnit => {
    const nameLower = productName.toLowerCase();

    // Liquids (ml/cl)
    const liquidKeywords = [
        'jus', 'lait', 'eau', 'boisson', 'smoothie', 'soupe', 'bouillon',
        'huile', 'vinaigre', 'sauce', 'sirop', 'café', 'thé', 'vin', 'bière',
        'yaourt liquide', 'kéfir', 'limonade', 'soda'
    ];

    if (liquidKeywords.some(keyword => nameLower.includes(keyword))) {
        return 'ml';
    }

    // Unit-based items (fruits, eggs, etc.)
    const unitKeywords = [
        'pomme', 'poire', 'banane', 'orange', 'kiwi', 'pêche', 'abricot',
        'œuf', 'oeuf', 'tranche', 'biscuit', 'cookie', 'madeleine',
        'croissant', 'pain au', 'tartine', 'toast'
    ];

    if (unitKeywords.some(keyword => nameLower.includes(keyword))) {
        return 'unit';
    }

    // Default to grams
    return 'g';
};

// Get unit configuration
export const getUnitConfig = (unit: MeasurementUnit): UnitConversion => {
    const configs: Record<MeasurementUnit, UnitConversion> = {
        g: {
            unit: 'g',
            label: 'grammes',
            defaultQuantity: 100,
            step: 10,
        },
        ml: {
            unit: 'ml',
            label: 'millilitres',
            defaultQuantity: 250,
            step: 50,
            equivalentGrams: 1, // 1ml ≈ 1g for most liquids
        },
        unit: {
            unit: 'unit',
            label: 'unité(s)',
            defaultQuantity: 1,
            step: 1,
            equivalentGrams: 150, // Average weight for a fruit/item
        },
    };

    return configs[unit];
};

// Get common portions for unit-based items
export const getCommonPortions = (productName: string): { label: string; grams: number }[] => {
    const nameLower = productName.toLowerCase();

    // Fruits
    if (nameLower.includes('pomme')) return [{ label: '1 pomme moyenne', grams: 150 }];
    if (nameLower.includes('banane')) return [{ label: '1 banane moyenne', grams: 120 }];
    if (nameLower.includes('orange')) return [{ label: '1 orange moyenne', grams: 180 }];
    if (nameLower.includes('kiwi')) return [{ label: '1 kiwi', grams: 70 }];
    if (nameLower.includes('poire')) return [{ label: '1 poire moyenne', grams: 160 }];

    // Eggs
    if (nameLower.includes('œuf') || nameLower.includes('oeuf')) {
        return [
            { label: '1 œuf moyen', grams: 60 },
            { label: '2 œufs', grams: 120 },
        ];
    }

    // Bread
    if (nameLower.includes('pain')) {
        return [
            { label: '1 tranche', grams: 30 },
            { label: '2 tranches', grams: 60 },
        ];
    }

    // Liquids
    if (nameLower.includes('lait') || nameLower.includes('jus')) {
        return [
            { label: '1 verre (250ml)', grams: 250 },
            { label: '1 bol (300ml)', grams: 300 },
        ];
    }

    return [];
};

// Format quantity display
export const formatQuantity = (quantity: number, unit: MeasurementUnit): string => {
    if (unit === 'unit') {
        return `${quantity} ${quantity > 1 ? 'unités' : 'unité'}`;
    }
    return `${quantity}${unit}`;
};
