import ciqualRaw from '@/data/Table_Ciqual_2020V2.json';
import Fuse from 'fuse.js';
import { Product } from '@/types/product';

const parseValue = (val: string | number | undefined): number => {
    if (typeof val === 'number') return val;
    if (!val || val === '-' || val === 'traces') return 0;

    // Handle "< 0.5" -> 0.5
    const clean = val.replace(',', '.').replace('<', '').replace('>', '').trim();
    return parseFloat(clean) || 0;
};

// Transform raw data to Product type once
const ciqualProducts: Product[] = (ciqualRaw.data as any[]).map((item) => {
    const p = item.produit;
    const m = item.macronutriments;

    // Calculate calories (approximate if not present, usually 4*P + 4*C + 9*F)
    // Ciqual usually has energy field but let's check. 
    // The sample didn't show energy. Let's calculate: 4*P + 4*C + 9*F
    const proteins = parseValue(m.proteines);
    const carbs = parseValue(m.glucides);
    const fats = parseValue(m.lipides);
    const calories = (proteins * 4) + (carbs * 4) + (fats * 9);

    return {
        id: `ciqual_${p.code}`,
        name: p.nom,
        source: 'CIQUAL',
        calories: Math.round(calories),
        proteins,
        carbs,
        fats,
        image: undefined, // Ciqual has no images
        brand: undefined,
        nutriscore: undefined,
    };
});

const fuse = new Fuse(ciqualProducts, {
    keys: ['name'],
    threshold: 0.3, // Fuzzy match
    distance: 100,
});

export const searchCiqual = (query: string): Product[] => {
    if (!query) return [];
    return fuse.search(query).map(result => result.item).slice(0, 20);
};
