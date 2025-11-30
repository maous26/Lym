export interface Product {
    id: string;
    name: string;
    source: 'CIQUAL' | 'OFF' | 'AI';
    calories: number; // kcal per 100g
    proteins: number;
    carbs: number;
    fats: number;
    image?: string;
    brand?: string;
    nutriscore?: string;
    recipeId?: string; // ID de la recette dans la base de données (pour les feedbacks)
}

export interface SearchFilters {
    category?: string;
    minProtein?: number;
    maxCalories?: number;
}
