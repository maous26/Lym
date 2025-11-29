export interface Product {
    id: string;
    name: string;
    source: 'CIQUAL' | 'OFF';
    calories: number; // kcal per 100g
    proteins: number;
    carbs: number;
    fats: number;
    image?: string;
    brand?: string;
    nutriscore?: string;
}

export interface SearchFilters {
    category?: string;
    minProtein?: number;
    maxCalories?: number;
}
