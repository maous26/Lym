// Cooking state detection and nutritional adjustments
export type CookingState = 'raw' | 'cooked';

interface CookingConversion {
    waterAbsorption: number; // Multiplier for weight (e.g., 2.5 means 100g raw = 250g cooked)
    calorieRatio: number; // Ratio of calories after cooking (usually lower due to water)
}

// Cooking conversions for common foods
const cookingConversions: Record<string, CookingConversion> = {
    // Grains & Starches
    riz: { waterAbsorption: 2.5, calorieRatio: 0.4 }, // 100g raw rice = 250g cooked
    pates: { waterAbsorption: 2.2, calorieRatio: 0.45 },
    quinoa: { waterAbsorption: 3, calorieRatio: 0.33 },
    semoule: { waterAbsorption: 2.5, calorieRatio: 0.4 },
    boulgour: { waterAbsorption: 2.5, calorieRatio: 0.4 },

    // Legumes
    lentilles: { waterAbsorption: 2.5, calorieRatio: 0.4 },
    pois: { waterAbsorption: 2.3, calorieRatio: 0.43 },
    haricots: { waterAbsorption: 2.5, calorieRatio: 0.4 },

    // Potatoes
    pomme_de_terre: { waterAbsorption: 1, calorieRatio: 1 }, // Already contains water
    patate_douce: { waterAbsorption: 1, calorieRatio: 1 },
};

// Detect if product is in raw or cooked state
export const detectCookingState = (productName: string): CookingState => {
    const nameLower = productName.toLowerCase();

    const cookedKeywords = [
        'cuit', 'cuite', 'cuites', 'cuits',
        'bouilli', 'bouillie',
        'vapeur',
        'grillé', 'grillée',
        'rôti', 'rôtie',
        'frit', 'frite',
    ];

    const rawKeywords = ['cru', 'crue', 'crues', 'crus', 'sec', 'sèche'];

    if (cookedKeywords.some(keyword => nameLower.includes(keyword))) {
        return 'cooked';
    }

    if (rawKeywords.some(keyword => nameLower.includes(keyword))) {
        return 'raw';
    }

    // Default: assume raw for grains/legumes, cooked for others
    const grainKeywords = ['riz', 'pâtes', 'pates', 'quinoa', 'lentilles', 'pois', 'haricots'];
    if (grainKeywords.some(keyword => nameLower.includes(keyword))) {
        return 'raw';
    }

    return 'cooked'; // Default assumption
};

// Get conversion factor for a product
export const getCookingConversion = (productName: string): CookingConversion | null => {
    const nameLower = productName.toLowerCase();

    for (const [key, conversion] of Object.entries(cookingConversions)) {
        if (nameLower.includes(key)) {
            return conversion;
        }
    }

    return null;
};

// Adjust nutritional values based on cooking state
export const adjustForCooking = (
    productName: string,
    calories: number,
    proteins: number,
    carbs: number,
    fats: number,
    currentState: CookingState,
    desiredState: CookingState
): { calories: number; proteins: number; carbs: number; fats: number } => {
    // If same state, no adjustment needed
    if (currentState === desiredState) {
        return { calories, proteins, carbs, fats };
    }

    const conversion = getCookingConversion(productName);
    if (!conversion) {
        return { calories, proteins, carbs, fats };
    }

    // Converting from raw to cooked
    if (currentState === 'raw' && desiredState === 'cooked') {
        return {
            calories: calories * conversion.calorieRatio,
            proteins: proteins * conversion.calorieRatio,
            carbs: carbs * conversion.calorieRatio,
            fats: fats * conversion.calorieRatio,
        };
    }

    // Converting from cooked to raw
    if (currentState === 'cooked' && desiredState === 'raw') {
        return {
            calories: calories / conversion.calorieRatio,
            proteins: proteins / conversion.calorieRatio,
            carbs: carbs / conversion.calorieRatio,
            fats: fats / conversion.calorieRatio,
        };
    }

    return { calories, proteins, carbs, fats };
};

// Get cooking state label
export const getCookingStateLabel = (state: CookingState): string => {
    return state === 'raw' ? 'Cru' : 'Cuit';
};

// Get common cooked portions
export const getCookedPortions = (productName: string): { label: string; grams: number }[] => {
    const nameLower = productName.toLowerCase();

    if (nameLower.includes('riz')) {
        return [
            { label: '1 bol cuit (150g)', grams: 150 },
            { label: '1 assiette cuite (200g)', grams: 200 },
            { label: '60g cru → 150g cuit', grams: 150 },
        ];
    }

    if (nameLower.includes('pâtes') || nameLower.includes('pates')) {
        return [
            { label: '1 assiette cuite (200g)', grams: 200 },
            { label: '1 portion cuite (150g)', grams: 150 },
            { label: '80g cru → 180g cuit', grams: 180 },
        ];
    }

    if (nameLower.includes('pomme de terre') || nameLower.includes('patate')) {
        return [
            { label: '1 moyenne (150g)', grams: 150 },
            { label: '2 petites (200g)', grams: 200 },
        ];
    }

    if (nameLower.includes('lentilles') || nameLower.includes('haricots')) {
        return [
            { label: '1 bol cuit (200g)', grams: 200 },
            { label: '80g cru → 200g cuit', grams: 200 },
        ];
    }

    return [];
};

// Display cooking info message
export const getCookingInfoMessage = (productName: string, state: CookingState): string | null => {
    const conversion = getCookingConversion(productName);
    if (!conversion) return null;

    if (state === 'raw') {
        return `💡 Après cuisson : 100g cru ≈ ${Math.round(conversion.waterAbsorption * 100)}g cuit (${Math.round(conversion.calorieRatio * 100)}% des calories)`;
    } else {
        return `💡 Équivalent cru : 100g cuit ≈ ${Math.round(100 / conversion.waterAbsorption)}g cru`;
    }
};
