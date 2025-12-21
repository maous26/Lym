// Open Food Facts API Service
// Searches the French Open Food Facts database for packaged products

import { Product } from '@/types/product';

// Use French API endpoint
const OFF_API_URL = 'https://fr.openfoodfacts.org/cgi/search.pl';
const OFF_PRODUCT_URL = 'https://fr.openfoodfacts.org/api/v2/product';

// Search request timeout
const SEARCH_TIMEOUT = 10000; // 10 seconds

// Fetch with timeout utility
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeout: number = SEARCH_TIMEOUT): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

// Parse Open Food Facts product to our Product type
const parseOFFProduct = (p: any): Product | null => {
  // Require a name
  const name = p.product_name_fr || p.product_name;
  if (!name) return null;

  // Get nutriments
  const n = p.nutriments || {};

  // Check for minimum nutrition data
  const calories = Math.round(n['energy-kcal_100g'] || n['energy-kcal'] || 0);
  if (calories === 0 && !n.proteins_100g && !n.carbohydrates_100g) {
    return null; // Skip products without nutritional data
  }

  return {
    id: `off_${p.code || p._id}`,
    name,
    source: 'OFF' as const,
    calories,
    proteins: Math.round((n.proteins_100g || 0) * 10) / 10,
    carbs: Math.round((n.carbohydrates_100g || 0) * 10) / 10,
    fats: Math.round((n.fat_100g || 0) * 10) / 10,
    fiber: n.fiber_100g ? Math.round(n.fiber_100g * 10) / 10 : undefined,
    sugar: n.sugars_100g ? Math.round(n.sugars_100g * 10) / 10 : undefined,
    sodium: n.sodium_100g ? Math.round(n.sodium_100g * 100) / 100 : undefined,
    image: p.image_front_small_url || p.image_url || p.image_front_url,
    brand: p.brands,
    nutriscore: p.nutriscore_grade?.toUpperCase(),
  };
};

// Search Open Food Facts
export const searchOpenFoodFacts = async (
  query: string,
  limit: number = 20
): Promise<Product[]> => {
  if (!query || query.length < 2) return [];

  try {
    const params = new URLSearchParams({
      search_terms: query,
      search_simple: '1',
      action: 'process',
      json: '1',
      page_size: String(limit * 2), // Get extra to filter
      // Filter for French products
      tagtype_0: 'countries',
      tag_contains_0: 'contains',
      tag_0: 'france',
      // Fields to retrieve
      fields: [
        'code',
        'product_name',
        'product_name_fr',
        'brands',
        'image_url',
        'image_front_url',
        'image_front_small_url',
        'nutriscore_grade',
        'nutriments',
        'countries_tags',
        'categories_tags',
      ].join(','),
    });

    const response = await fetchWithTimeout(`${OFF_API_URL}?${params}`);

    if (!response.ok) {
      throw new Error(`OFF API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.products || !Array.isArray(data.products)) {
      return [];
    }

    // Parse and filter products
    const products: Product[] = [];
    for (const p of data.products) {
      // Check if sold in France
      const countries = p.countries_tags || [];
      const isFrench = countries.length === 0 || countries.some((c: string) =>
        c.includes('france') || c === 'en:france' || c === 'fr:france'
      );

      if (!isFrench) continue;

      const product = parseOFFProduct(p);
      if (product) {
        products.push(product);
      }

      if (products.length >= limit) break;
    }

    return products;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.warn('OFF search timeout');
    } else {
      console.error('OFF Search Error:', error);
    }
    return [];
  }
};

// Get product by barcode
export const getProductByBarcode = async (barcode: string): Promise<Product | null> => {
  try {
    const response = await fetchWithTimeout(
      `${OFF_PRODUCT_URL}/${barcode}.json?fields=code,product_name,product_name_fr,brands,image_url,image_front_url,image_front_small_url,nutriscore_grade,nutriments`
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    if (data.status !== 1 || !data.product) {
      return null;
    }

    return parseOFFProduct(data.product);
  } catch (error) {
    console.error('OFF Barcode lookup error:', error);
    return null;
  }
};

// Search with filters
export const searchOpenFoodFactsFiltered = async (
  query: string,
  filters: {
    nutriscore?: string[];
    maxCalories?: number;
    minProtein?: number;
    categories?: string[];
  },
  limit: number = 20
): Promise<Product[]> => {
  // Start with basic search
  const products = await searchOpenFoodFacts(query, limit * 2);

  // Apply client-side filters
  return products
    .filter(p => {
      // Nutriscore filter
      if (filters.nutriscore?.length && p.nutriscore) {
        if (!filters.nutriscore.includes(p.nutriscore)) return false;
      }

      // Calories filter
      if (filters.maxCalories && p.calories > filters.maxCalories) {
        return false;
      }

      // Protein filter
      if (filters.minProtein && p.proteins < filters.minProtein) {
        return false;
      }

      return true;
    })
    .slice(0, limit);
};

// Get trending/popular products (based on scan count - approximated by recent additions)
export const getTrendingProducts = async (): Promise<Product[]> => {
  try {
    const response = await fetchWithTimeout(
      `${OFF_API_URL}?action=process&json=1&page_size=30&sort_by=scans_n&tagtype_0=countries&tag_contains_0=contains&tag_0=france&fields=code,product_name,product_name_fr,brands,image_front_small_url,nutriscore_grade,nutriments`
    );

    if (!response.ok) return [];

    const data = await response.json();
    if (!data.products) return [];

    const products: Product[] = [];
    for (const p of data.products) {
      const product = parseOFFProduct(p);
      if (product) {
        products.push(product);
        if (products.length >= 20) break;
      }
    }

    return products;
  } catch {
    return [];
  }
};
