// Product types for food database and search

export interface Product {
  id: string;
  name: string;
  source: 'CIQUAL' | 'OFF' | 'AI';
  calories: number; // kcal per 100g
  proteins: number;
  carbs: number;
  fats: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  image?: string;
  brand?: string;
  nutriscore?: string;
  recipeId?: string; // ID for feedback on AI-generated recipes
}

export interface SearchFilters {
  category?: string;
  minProtein?: number;
  maxCalories?: number;
  dietType?: string;
}
