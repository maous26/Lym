// CIQUAL French Food Database Search Service
// Uses the official ANSES CIQUAL database for accurate French nutritional data

import ciqualRaw from '@/data/Table_Ciqual_2020_Complete.json';
import Fuse from 'fuse.js';
import { Product } from '@/types/product';

// Parse CIQUAL values which can be strings with special characters
const parseValue = (val: string | number | undefined | null): number => {
  if (typeof val === 'number') return val;
  if (!val || val === '-' || val === 'traces' || val === 'N') return 0;

  // Handle "< 0.5" or "> 100" formats
  const clean = String(val)
    .replace(',', '.')
    .replace('<', '')
    .replace('>', '')
    .replace('~', '')
    .trim();

  const parsed = parseFloat(clean);
  return isNaN(parsed) ? 0 : parsed;
};

// Transform raw CIQUAL data to Product type (cached on module load)
const ciqualProducts: Product[] = ((ciqualRaw as any).data as any[]).map((item) => {
  const p = item.produit;
  const m = item.macronutriments;
  const v = item.vitamines || {};
  const mi = item.mineraux || {};

  // Parse macronutrients
  const proteins = parseValue(m?.proteines);
  const carbs = parseValue(m?.glucides);
  const fats = parseValue(m?.lipides);
  const fiber = parseValue(m?.fibres);
  const sugar = parseValue(m?.sucres);

  // Use energy from file if available, otherwise calculate using Atwater factors
  const energyFromFile = parseValue(m?.energie);
  const calories = energyFromFile > 0
    ? Math.round(energyFromFile)
    : Math.round((proteins * 4) + (carbs * 4) + (fats * 9) + (fiber * 2));

  // Parse sodium (mg) and convert to g for consistency
  const sodiumMg = parseValue(mi?.sodium);
  const sodium = sodiumMg / 1000;

  return {
    id: `ciqual_${p.code}`,
    name: p.nom || 'Inconnu',
    source: 'CIQUAL' as const,
    calories,
    proteins: Math.round(proteins * 10) / 10,
    carbs: Math.round(carbs * 10) / 10,
    fats: Math.round(fats * 10) / 10,
    fiber: fiber > 0 ? Math.round(fiber * 10) / 10 : undefined,
    sugar: sugar > 0 ? Math.round(sugar * 10) / 10 : undefined,
    sodium: sodium > 0 ? Math.round(sodium * 100) / 100 : undefined,
    image: undefined,
    brand: undefined,
    nutriscore: undefined,
  };
});

// Configure Fuse.js for fuzzy search
const fuse = new Fuse(ciqualProducts, {
  keys: [
    { name: 'name', weight: 1 },
  ],
  threshold: 0.35,        // Allow some fuzziness
  distance: 150,          // Allow for longer product names
  minMatchCharLength: 2,  // Minimum characters to match
  includeScore: true,     // Include relevance score
  ignoreLocation: true,   // Search anywhere in string
  useExtendedSearch: true,
});

// Search CIQUAL database
export const searchCiqual = (query: string, limit: number = 20): Product[] => {
  if (!query || query.length < 2) return [];

  const normalizedQuery = query
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, ''); // Remove accents for better matching

  // Use extended search for better results
  const results = fuse.search(normalizedQuery, { limit: limit * 2 });

  // Sort by score and filter
  return results
    .filter(result => (result.score ?? 1) < 0.5) // Only good matches
    .sort((a, b) => (a.score ?? 1) - (b.score ?? 1))
    .slice(0, limit)
    .map(result => result.item);
};

// Get product by ID
export const getCiqualProduct = (id: string): Product | undefined => {
  return ciqualProducts.find(p => p.id === id);
};

// Get all CIQUAL products (for category browsing)
export const getAllCiqualProducts = (): Product[] => {
  return ciqualProducts;
};

// Search with category filter
export const searchCiqualByCategory = (
  query: string,
  categoryKeywords: string[],
  limit: number = 20
): Product[] => {
  const results = searchCiqual(query, limit * 3);

  if (categoryKeywords.length === 0) return results.slice(0, limit);

  return results
    .filter(product => {
      const nameLower = product.name.toLowerCase();
      return categoryKeywords.some(kw => nameLower.includes(kw.toLowerCase()));
    })
    .slice(0, limit);
};

// Get popular/common products
export const getPopularCiqualProducts = (): Product[] => {
  const popularKeywords = [
    'pain', 'riz', 'pâtes', 'poulet', 'bœuf', 'saumon',
    'lait', 'yaourt', 'fromage', 'œuf', 'pomme', 'banane',
    'tomate', 'salade', 'carotte', 'pomme de terre'
  ];

  const results: Product[] = [];
  const seen = new Set<string>();

  for (const keyword of popularKeywords) {
    const products = searchCiqual(keyword, 2);
    for (const product of products) {
      if (!seen.has(product.id)) {
        seen.add(product.id);
        results.push(product);
      }
    }
  }

  return results.slice(0, 20);
};

// Get products count
export const getCiqualProductsCount = (): number => {
  return ciqualProducts.length;
};
