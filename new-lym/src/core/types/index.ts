// Re-export all types
export * from './next-auth.d';

// Common API response type
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Pagination
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Nutrition data
export interface NutritionData {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
}

// Ingredient type for recipes
export interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
}

// Coach message
export interface CoachMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// Date range
export interface DateRange {
  start: Date;
  end: Date;
}
