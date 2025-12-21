// Unit utilities for smart measurement detection and conversion

export type MeasurementUnit = 'g' | 'ml' | 'unit';

export interface UnitConversion {
  unit: MeasurementUnit;
  label: string;
  labelShort: string;
  defaultQuantity: number;
  step: number;
  minQuantity: number;
  maxQuantity: number;
  equivalentGrams?: number;
}

export interface PortionPreset {
  label: string;
  grams: number;
  icon?: string;
}

// Extended liquid keywords for better detection
const LIQUID_KEYWORDS = [
  // Beverages
  'jus', 'lait', 'eau', 'boisson', 'smoothie', 'café', 'thé', 'infusion',
  'vin', 'bière', 'cidre', 'limonade', 'soda', 'cola', 'orangina',
  // Dairy liquids
  'yaourt liquide', 'kéfir', 'lait fermenté', 'lassi', 'ayran',
  // Soups & broths
  'soupe', 'bouillon', 'velouté', 'potage', 'consommé', 'bisque',
  // Cooking liquids
  'huile', 'vinaigre', 'sauce', 'sirop', 'miel liquide', 'coulis',
  'crème liquide', 'crème fraîche liquide',
  // Alcohols
  'whisky', 'vodka', 'rhum', 'gin', 'liqueur', 'cognac', 'champagne',
];

// Unit-based items with average weights
const UNIT_ITEMS: Record<string, number> = {
  // Fruits
  'pomme': 150,
  'poire': 160,
  'banane': 120,
  'orange': 180,
  'mandarine': 80,
  'clémentine': 70,
  'kiwi': 70,
  'pêche': 150,
  'nectarine': 140,
  'abricot': 45,
  'prune': 50,
  'cerise': 8,
  'fraise': 12,
  'framboise': 4,
  'myrtille': 1.5,
  'mangue': 300,
  'ananas': 900,
  'melon': 800,
  'pastèque': 2000,
  'avocat': 200,
  'citron': 80,
  'lime': 60,
  'pamplemousse': 350,
  'grenade': 200,
  'figue': 50,
  'datte': 25,
  // Vegetables
  'tomate': 120,
  'concombre': 300,
  'courgette': 200,
  'aubergine': 300,
  'poivron': 150,
  'oignon': 100,
  'échalote': 30,
  'ail gousse': 5,
  'carotte': 80,
  'pomme de terre': 150,
  'patate douce': 200,
  // Eggs
  'œuf': 60,
  'oeuf': 60,
  'œuf de caille': 12,
  // Breads & pastries
  'croissant': 60,
  'pain au chocolat': 70,
  'brioche': 50,
  'baguette': 250,
  'pain de mie tranche': 30,
  'toast': 25,
  'tartine': 30,
  'muffin': 80,
  'donut': 75,
  // Biscuits
  'biscuit': 10,
  'cookie': 30,
  'madeleine': 25,
  'financier': 30,
  'macaron': 15,
  'speculoos': 8,
};

// Detect appropriate unit based on product name
export const detectProductUnit = (productName: string, category?: string): MeasurementUnit => {
  const nameLower = productName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  // Check for liquids
  if (LIQUID_KEYWORDS.some(keyword => nameLower.includes(keyword))) {
    return 'ml';
  }

  // Check for unit items
  for (const keyword of Object.keys(UNIT_ITEMS)) {
    const keywordNormalized = keyword.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (nameLower.includes(keywordNormalized)) {
      return 'unit';
    }
  }

  // Category-based detection
  if (category) {
    const categoryLower = category.toLowerCase();
    if (categoryLower.includes('boisson') || categoryLower.includes('liquide')) {
      return 'ml';
    }
  }

  // Default to grams
  return 'g';
};

// Get estimated weight in grams for unit items
export const getUnitWeight = (productName: string): number => {
  const nameLower = productName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  for (const [keyword, weight] of Object.entries(UNIT_ITEMS)) {
    const keywordNormalized = keyword.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (nameLower.includes(keywordNormalized)) {
      return weight;
    }
  }

  return 100; // Default fallback
};

// Get unit configuration
export const getUnitConfig = (unit: MeasurementUnit): UnitConversion => {
  const configs: Record<MeasurementUnit, UnitConversion> = {
    g: {
      unit: 'g',
      label: 'grammes',
      labelShort: 'g',
      defaultQuantity: 100,
      step: 10,
      minQuantity: 5,
      maxQuantity: 2000,
    },
    ml: {
      unit: 'ml',
      label: 'millilitres',
      labelShort: 'ml',
      defaultQuantity: 250,
      step: 25,
      minQuantity: 10,
      maxQuantity: 2000,
      equivalentGrams: 1,
    },
    unit: {
      unit: 'unit',
      label: 'unité(s)',
      labelShort: 'u',
      defaultQuantity: 1,
      step: 0.5,
      minQuantity: 0.25,
      maxQuantity: 20,
    },
  };

  return configs[unit];
};

// Get common portions for products
export const getCommonPortions = (productName: string): PortionPreset[] => {
  const nameLower = productName.toLowerCase();

  // Fruits
  if (nameLower.includes('pomme')) {
    return [
      { label: '1 petite pomme', grams: 120, icon: '🍎' },
      { label: '1 moyenne', grams: 150, icon: '🍎' },
      { label: '1 grosse', grams: 200, icon: '🍎' },
    ];
  }

  if (nameLower.includes('banane')) {
    return [
      { label: '1 petite', grams: 90, icon: '🍌' },
      { label: '1 moyenne', grams: 120, icon: '🍌' },
      { label: '1 grosse', grams: 150, icon: '🍌' },
    ];
  }

  if (nameLower.includes('orange')) {
    return [
      { label: '1 moyenne', grams: 180, icon: '🍊' },
      { label: '1 grosse', grams: 250, icon: '🍊' },
    ];
  }

  // Eggs
  if (nameLower.includes('œuf') || nameLower.includes('oeuf')) {
    return [
      { label: '1 œuf moyen', grams: 60, icon: '🥚' },
      { label: '2 œufs', grams: 120, icon: '🥚' },
      { label: '3 œufs', grams: 180, icon: '🥚' },
    ];
  }

  // Bread
  if (nameLower.includes('pain') || nameLower.includes('baguette')) {
    return [
      { label: '1 tranche fine', grams: 25, icon: '🍞' },
      { label: '1 tranche', grams: 40, icon: '🍞' },
      { label: '1/4 baguette', grams: 60, icon: '🥖' },
    ];
  }

  // Dairy drinks
  if (nameLower.includes('lait')) {
    return [
      { label: '1 verre (200ml)', grams: 200, icon: '🥛' },
      { label: '1 bol (300ml)', grams: 300, icon: '🥣' },
      { label: '1 tasse (150ml)', grams: 150, icon: '☕' },
    ];
  }

  // Juices
  if (nameLower.includes('jus')) {
    return [
      { label: '1 petit verre', grams: 150, icon: '🧃' },
      { label: '1 verre (250ml)', grams: 250, icon: '🧃' },
      { label: '1 grand verre', grams: 330, icon: '🧃' },
    ];
  }

  // Yogurt
  if (nameLower.includes('yaourt') || nameLower.includes('yogourt')) {
    return [
      { label: '1 pot (125g)', grams: 125, icon: '🥛' },
      { label: '1 pot XL (180g)', grams: 180, icon: '🥛' },
    ];
  }

  // Rice & Pasta (cooked portions)
  if (nameLower.includes('riz')) {
    return [
      { label: '1 portion (150g cuit)', grams: 150, icon: '🍚' },
      { label: '1 assiette (200g)', grams: 200, icon: '🍚' },
      { label: '60g cru', grams: 60, icon: '🌾' },
    ];
  }

  if (nameLower.includes('pâtes') || nameLower.includes('pates') || nameLower.includes('spaghetti')) {
    return [
      { label: '1 portion (180g cuit)', grams: 180, icon: '🍝' },
      { label: '1 assiette (250g)', grams: 250, icon: '🍝' },
      { label: '80g cru', grams: 80, icon: '🌾' },
    ];
  }

  // Cheese
  if (nameLower.includes('fromage')) {
    return [
      { label: '1 portion (30g)', grams: 30, icon: '🧀' },
      { label: '2 portions', grams: 60, icon: '🧀' },
    ];
  }

  // Meat
  if (nameLower.includes('poulet') || nameLower.includes('viande') || nameLower.includes('bœuf') || nameLower.includes('porc')) {
    return [
      { label: '1 portion (120g)', grams: 120, icon: '🍖' },
      { label: '1 grosse portion', grams: 180, icon: '🍖' },
    ];
  }

  // Fish
  if (nameLower.includes('poisson') || nameLower.includes('saumon') || nameLower.includes('thon')) {
    return [
      { label: '1 filet (150g)', grams: 150, icon: '🐟' },
      { label: '1 portion (120g)', grams: 120, icon: '🐟' },
    ];
  }

  // Default portions
  return [
    { label: '50g', grams: 50 },
    { label: '100g', grams: 100 },
    { label: '150g', grams: 150 },
  ];
};

// Format quantity display
export const formatQuantity = (quantity: number, unit: MeasurementUnit): string => {
  if (unit === 'unit') {
    if (quantity === 0.25) return '¼';
    if (quantity === 0.5) return '½';
    if (quantity === 0.75) return '¾';
    if (quantity === 1.5) return '1½';
    if (Number.isInteger(quantity)) {
      return `${quantity} ${quantity > 1 ? 'unités' : 'unité'}`;
    }
    return `${quantity.toFixed(1)}`;
  }

  if (unit === 'ml' && quantity >= 1000) {
    return `${(quantity / 1000).toFixed(1)}L`;
  }

  if (unit === 'g' && quantity >= 1000) {
    return `${(quantity / 1000).toFixed(2)}kg`;
  }

  return `${Math.round(quantity)}${unit}`;
};

// Convert quantity to equivalent grams for nutrition calculation
export const toEquivalentGrams = (
  productName: string,
  quantity: number,
  unit: MeasurementUnit
): number => {
  switch (unit) {
    case 'g':
      return quantity;
    case 'ml':
      // For most liquids, 1ml ≈ 1g (water, milk, juice)
      // Oils are ~0.9g/ml but for simplicity we use 1:1
      return quantity;
    case 'unit':
      return quantity * getUnitWeight(productName);
    default:
      return quantity;
  }
};

// Get all available units for a product
export const getAvailableUnits = (productName: string): MeasurementUnit[] => {
  const detectedUnit = detectProductUnit(productName);

  // Always include grams as fallback
  const units: MeasurementUnit[] = ['g'];

  if (detectedUnit === 'ml') {
    units.unshift('ml');
  } else if (detectedUnit === 'unit') {
    units.unshift('unit');
  }

  return units;
};

// Parse quantity from user input
export const parseQuantityInput = (input: string): number | null => {
  const cleaned = input.trim().replace(',', '.');

  // Handle fractions
  if (cleaned === '¼' || cleaned === '1/4') return 0.25;
  if (cleaned === '½' || cleaned === '1/2') return 0.5;
  if (cleaned === '¾' || cleaned === '3/4') return 0.75;
  if (cleaned === '1½' || cleaned === '1 1/2') return 1.5;

  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
};
