// Cooking state detection and nutritional adjustments
// Handles raw vs cooked conversions for accurate tracking

export type CookingState = 'raw' | 'cooked' | 'unknown';

export interface CookingConversion {
  waterAbsorption: number;    // Weight multiplier (e.g., 2.5 = 100g raw → 250g cooked)
  calorieRatio: number;       // Calorie density ratio after cooking
  proteinLoss: number;        // Protein loss during cooking (usually minimal)
  description: string;        // French description
}

// Comprehensive cooking conversions for French cuisine
const COOKING_CONVERSIONS: Record<string, CookingConversion> = {
  // Grains & Starches
  riz: {
    waterAbsorption: 2.5,
    calorieRatio: 0.4,
    proteinLoss: 0,
    description: 'Le riz absorbe ~2.5x son poids en eau'
  },
  riz_basmati: {
    waterAbsorption: 2.3,
    calorieRatio: 0.43,
    proteinLoss: 0,
    description: 'Riz basmati, absorption légèrement moindre'
  },
  riz_complet: {
    waterAbsorption: 2.8,
    calorieRatio: 0.36,
    proteinLoss: 0,
    description: 'Riz complet absorbe plus d\'eau'
  },
  pates: {
    waterAbsorption: 2.2,
    calorieRatio: 0.45,
    proteinLoss: 0.05,
    description: 'Les pâtes doublent de volume'
  },
  spaghetti: {
    waterAbsorption: 2.2,
    calorieRatio: 0.45,
    proteinLoss: 0.05,
    description: 'Spaghetti - cuisson al dente'
  },
  quinoa: {
    waterAbsorption: 3,
    calorieRatio: 0.33,
    proteinLoss: 0,
    description: 'Le quinoa triple de volume'
  },
  semoule: {
    waterAbsorption: 2.5,
    calorieRatio: 0.4,
    proteinLoss: 0,
    description: 'Semoule de blé dur'
  },
  boulgour: {
    waterAbsorption: 2.5,
    calorieRatio: 0.4,
    proteinLoss: 0,
    description: 'Boulgour précuit'
  },
  couscous: {
    waterAbsorption: 2,
    calorieRatio: 0.5,
    proteinLoss: 0,
    description: 'Couscous grain fin'
  },
  avoine: {
    waterAbsorption: 3,
    calorieRatio: 0.33,
    proteinLoss: 0,
    description: 'Flocons d\'avoine (porridge)'
  },

  // Legumes
  lentilles: {
    waterAbsorption: 2.5,
    calorieRatio: 0.4,
    proteinLoss: 0,
    description: 'Lentilles vertes/corail'
  },
  lentilles_corail: {
    waterAbsorption: 2.3,
    calorieRatio: 0.43,
    proteinLoss: 0,
    description: 'Lentilles corail, cuisson rapide'
  },
  pois_chiches: {
    waterAbsorption: 2.5,
    calorieRatio: 0.4,
    proteinLoss: 0,
    description: 'Pois chiches secs'
  },
  haricots: {
    waterAbsorption: 2.5,
    calorieRatio: 0.4,
    proteinLoss: 0,
    description: 'Haricots secs (blancs, rouges)'
  },
  pois_casses: {
    waterAbsorption: 2.5,
    calorieRatio: 0.4,
    proteinLoss: 0,
    description: 'Pois cassés'
  },
  feves: {
    waterAbsorption: 2.3,
    calorieRatio: 0.43,
    proteinLoss: 0,
    description: 'Fèves sèches'
  },

  // Potatoes (already contain water)
  pomme_de_terre: {
    waterAbsorption: 1,
    calorieRatio: 1,
    proteinLoss: 0.05,
    description: 'Pommes de terre (pas de changement majeur)'
  },
  patate_douce: {
    waterAbsorption: 1,
    calorieRatio: 0.95,
    proteinLoss: 0,
    description: 'Patate douce (légère perte d\'eau)'
  },

  // Meat (loses water when cooked)
  viande: {
    waterAbsorption: 0.75,
    calorieRatio: 1.25,
    proteinLoss: 0.02,
    description: 'La viande perd ~25% d\'eau à la cuisson'
  },
  poulet: {
    waterAbsorption: 0.7,
    calorieRatio: 1.3,
    proteinLoss: 0.02,
    description: 'Poulet - perte d\'eau importante'
  },
  boeuf: {
    waterAbsorption: 0.75,
    calorieRatio: 1.25,
    proteinLoss: 0.02,
    description: 'Bœuf - selon la cuisson'
  },
  porc: {
    waterAbsorption: 0.75,
    calorieRatio: 1.25,
    proteinLoss: 0.02,
    description: 'Porc'
  },
  agneau: {
    waterAbsorption: 0.72,
    calorieRatio: 1.28,
    proteinLoss: 0.02,
    description: 'Agneau'
  },

  // Fish
  poisson: {
    waterAbsorption: 0.85,
    calorieRatio: 1.15,
    proteinLoss: 0.05,
    description: 'Poisson - perte d\'eau modérée'
  },
  saumon: {
    waterAbsorption: 0.8,
    calorieRatio: 1.2,
    proteinLoss: 0.05,
    description: 'Saumon'
  },
  cabillaud: {
    waterAbsorption: 0.85,
    calorieRatio: 1.15,
    proteinLoss: 0.05,
    description: 'Cabillaud - poisson maigre'
  },

  // Eggs
  oeuf: {
    waterAbsorption: 1,
    calorieRatio: 1,
    proteinLoss: 0,
    description: 'Œuf - pas de changement'
  },
};

// Keywords to detect cooking state from product name
const COOKED_KEYWORDS = [
  'cuit', 'cuite', 'cuites', 'cuits',
  'bouilli', 'bouillie', 'bouillis', 'bouillies',
  'vapeur',
  'grillé', 'grillée', 'grillés', 'grillées',
  'rôti', 'rôtie', 'rôtis', 'rôties',
  'frit', 'frite', 'frits', 'frites',
  'poêlé', 'poêlée', 'poêlés', 'poêlées',
  'braisé', 'braisée', 'braisés', 'braisées',
  'mijoté', 'mijotée', 'mijotés', 'mijotées',
  'sauté', 'sautée', 'sautés', 'sautées',
  'al dente',
];

const RAW_KEYWORDS = [
  'cru', 'crue', 'crus', 'crues',
  'sec', 'sèche', 'secs', 'sèches',
  'non cuit',
  'frais', 'fraîche',
];

// Items that are typically raw when sold
const TYPICALLY_RAW_ITEMS = [
  'riz', 'pâtes', 'pates', 'spaghetti', 'macaroni', 'tagliatelle',
  'quinoa', 'semoule', 'boulgour', 'couscous',
  'lentilles', 'pois', 'haricots', 'fèves',
];

// Detect cooking state from product name
export const detectCookingState = (productName: string): CookingState => {
  const nameLower = productName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  // Check for cooked keywords
  for (const keyword of COOKED_KEYWORDS) {
    const keywordNorm = keyword.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (nameLower.includes(keywordNorm)) {
      return 'cooked';
    }
  }

  // Check for raw keywords
  for (const keyword of RAW_KEYWORDS) {
    const keywordNorm = keyword.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (nameLower.includes(keywordNorm)) {
      return 'raw';
    }
  }

  // Check if it's a typically raw item
  for (const item of TYPICALLY_RAW_ITEMS) {
    const itemNorm = item.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (nameLower.includes(itemNorm)) {
      return 'raw';
    }
  }

  return 'unknown';
};

// Get conversion data for a product
export const getCookingConversion = (productName: string): CookingConversion | null => {
  const nameLower = productName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  // Check each conversion key
  for (const [key, conversion] of Object.entries(COOKING_CONVERSIONS)) {
    const keyNorm = key.replace(/_/g, ' ').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (nameLower.includes(keyNorm) || nameLower.includes(key.replace(/_/g, ''))) {
      return conversion;
    }
  }

  // Also check without underscores
  for (const [key, conversion] of Object.entries(COOKING_CONVERSIONS)) {
    const keyClean = key.replace(/_/g, '');
    if (nameLower.includes(keyClean)) {
      return conversion;
    }
  }

  return null;
};

// Adjust nutritional values based on cooking state transition
export const adjustForCooking = (
  productName: string,
  values: { calories: number; proteins: number; carbs: number; fats: number },
  currentState: CookingState,
  desiredState: CookingState
): { calories: number; proteins: number; carbs: number; fats: number } => {
  // No adjustment needed for same state or unknown
  if (currentState === desiredState || currentState === 'unknown' || desiredState === 'unknown') {
    return values;
  }

  const conversion = getCookingConversion(productName);
  if (!conversion) {
    return values;
  }

  const { calorieRatio, proteinLoss } = conversion;

  // Converting raw → cooked (values decrease per 100g because of water absorption)
  if (currentState === 'raw' && desiredState === 'cooked') {
    return {
      calories: values.calories * calorieRatio,
      proteins: values.proteins * calorieRatio * (1 - proteinLoss),
      carbs: values.carbs * calorieRatio,
      fats: values.fats * calorieRatio,
    };
  }

  // Converting cooked → raw (values increase per 100g)
  if (currentState === 'cooked' && desiredState === 'raw') {
    return {
      calories: values.calories / calorieRatio,
      proteins: (values.proteins / calorieRatio) / (1 - proteinLoss),
      carbs: values.carbs / calorieRatio,
      fats: values.fats / calorieRatio,
    };
  }

  return values;
};

// Convert weight between raw and cooked
export const convertWeight = (
  productName: string,
  weight: number,
  fromState: CookingState,
  toState: CookingState
): number => {
  if (fromState === toState || fromState === 'unknown' || toState === 'unknown') {
    return weight;
  }

  const conversion = getCookingConversion(productName);
  if (!conversion) {
    return weight;
  }

  // Raw → Cooked: weight increases
  if (fromState === 'raw' && toState === 'cooked') {
    return weight * conversion.waterAbsorption;
  }

  // Cooked → Raw: weight decreases
  if (fromState === 'cooked' && toState === 'raw') {
    return weight / conversion.waterAbsorption;
  }

  return weight;
};

// Get cooking state label in French
export const getCookingStateLabel = (state: CookingState): string => {
  switch (state) {
    case 'raw': return 'Cru';
    case 'cooked': return 'Cuit';
    default: return 'Non spécifié';
  }
};

// Get common cooked portions with equivalences
export const getCookedPortions = (
  productName: string
): { label: string; cookedGrams: number; rawGrams: number }[] => {
  const nameLower = productName.toLowerCase();

  if (nameLower.includes('riz')) {
    return [
      { label: '1 portion légère', cookedGrams: 150, rawGrams: 60 },
      { label: '1 portion normale', cookedGrams: 200, rawGrams: 80 },
      { label: '1 grande portion', cookedGrams: 250, rawGrams: 100 },
    ];
  }

  if (nameLower.includes('pâtes') || nameLower.includes('pates') || nameLower.includes('spaghetti')) {
    return [
      { label: '1 portion légère', cookedGrams: 180, rawGrams: 80 },
      { label: '1 portion normale', cookedGrams: 220, rawGrams: 100 },
      { label: '1 grande portion', cookedGrams: 280, rawGrams: 130 },
    ];
  }

  if (nameLower.includes('quinoa')) {
    return [
      { label: '1 portion', cookedGrams: 180, rawGrams: 60 },
      { label: '1 grande portion', cookedGrams: 240, rawGrams: 80 },
    ];
  }

  if (nameLower.includes('lentilles') || nameLower.includes('pois') || nameLower.includes('haricots')) {
    return [
      { label: '1 portion', cookedGrams: 200, rawGrams: 80 },
      { label: '1 grande portion', cookedGrams: 250, rawGrams: 100 },
    ];
  }

  if (nameLower.includes('pomme de terre') || nameLower.includes('patate')) {
    return [
      { label: '1 moyenne', cookedGrams: 150, rawGrams: 150 },
      { label: '2 moyennes', cookedGrams: 300, rawGrams: 300 },
    ];
  }

  if (nameLower.includes('poulet')) {
    return [
      { label: '1 blanc cuit', cookedGrams: 150, rawGrams: 180 },
      { label: '1 cuisse cuite', cookedGrams: 100, rawGrams: 130 },
    ];
  }

  if (nameLower.includes('saumon') || nameLower.includes('poisson')) {
    return [
      { label: '1 filet cuit', cookedGrams: 150, rawGrams: 175 },
      { label: '1 portion cuite', cookedGrams: 120, rawGrams: 140 },
    ];
  }

  return [];
};

// Generate cooking info message for display
export const getCookingInfoMessage = (
  productName: string,
  state: CookingState
): string | null => {
  const conversion = getCookingConversion(productName);
  if (!conversion) return null;

  if (state === 'raw') {
    const cookedWeight = Math.round(100 * conversion.waterAbsorption);
    const cookedCalPercent = Math.round(conversion.calorieRatio * 100);
    return `💡 100g cru → ~${cookedWeight}g cuit (${cookedCalPercent} kcal/100g cuit)`;
  }

  if (state === 'cooked') {
    const rawWeight = Math.round(100 / conversion.waterAbsorption);
    return `💡 100g cuit ≈ ${rawWeight}g cru`;
  }

  return null;
};

// Check if product requires cooking state consideration
export const requiresCookingConsideration = (productName: string): boolean => {
  return getCookingConversion(productName) !== null;
};
