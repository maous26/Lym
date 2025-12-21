// LYM Image Assets - Professional food & lifestyle photography
// Using high-quality Unsplash images for a premium feel

export const images = {
  // Hero & Marketing images
  hero: {
    // Main hero - healthy lifestyle
    main: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&q=80',
    // Healthy breakfast spread
    breakfast: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&q=80',
    // Family cooking together
    family: 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=800&q=80',
    // Fresh ingredients
    ingredients: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80',
    // Meal prep
    mealPrep: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=800&q=80',
  },

  // Onboarding carousel images
  onboarding: {
    // Healthy eating lifestyle
    slide1: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=600&q=80',
    // Food photography/scanning
    slide2: 'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=600&q=80',
    // Coaching/support
    slide3: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80',
    // Organized meal planning
    slide4: 'https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=600&q=80',
    // Family meal
    slide5: 'https://images.unsplash.com/photo-1547573854-74d2a71d0826?w=600&q=80',
  },

  // Food categories
  food: {
    vegetables: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&q=80',
    fruits: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=400&q=80',
    proteins: 'https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=400&q=80',
    grains: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&q=80',
    dairy: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=400&q=80',
    fish: 'https://images.unsplash.com/photo-1510130387422-82bed34b37e9?w=400&q=80',
    legumes: 'https://images.unsplash.com/photo-1515543904379-3d757afe72e4?w=400&q=80',
    nuts: 'https://images.unsplash.com/photo-1599599810694-b5b37304c041?w=400&q=80',
  },

  // Meal types
  meals: {
    breakfast: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=400&q=80',
    lunch: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80',
    dinner: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&q=80',
    snack: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&q=80',
  },

  // Lifestyle & Features
  lifestyle: {
    cooking: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80',
    shopping: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=80',
    exercise: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&q=80',
    meditation: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&q=80',
    familyMeal: 'https://images.unsplash.com/photo-1529543544277-750e0a85a45a?w=600&q=80',
    balance: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80',
  },

  // Avatars & People
  avatars: {
    coach: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&q=80',
    nutritionist: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&q=80',
    chef: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=200&q=80',
  },

  // Empty states and placeholders
  placeholders: {
    recipe: 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=400&q=80',
    meal: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80',
    user: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80',
  },

  // Seasonal/themed backgrounds
  backgrounds: {
    spring: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=1200&q=80',
    summer: 'https://images.unsplash.com/photo-1464347744102-11db6282f854?w=1200&q=80',
    autumn: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&q=80',
    winter: 'https://images.unsplash.com/photo-1482049016gy-97f7e7b00a43?w=1200&q=80',
    neutral: 'https://images.unsplash.com/photo-1495195134817-aeb325a55b65?w=1200&q=80',
  },
} as const;

// Gradient overlays for images
export const imageOverlays = {
  dark: 'bg-gradient-to-t from-black/60 via-black/20 to-transparent',
  light: 'bg-gradient-to-t from-white/80 via-white/40 to-transparent',
  emerald: 'bg-gradient-to-t from-emerald-900/60 via-emerald-900/20 to-transparent',
  amber: 'bg-gradient-to-t from-amber-900/60 via-amber-900/20 to-transparent',
  primary: 'bg-gradient-to-br from-primary-500/40 to-primary-700/60',
} as const;

// Image aspect ratios for consistent sizing
export const imageAspects = {
  square: 'aspect-square',
  video: 'aspect-video',
  portrait: 'aspect-[3/4]',
  landscape: 'aspect-[4/3]',
  wide: 'aspect-[16/9]',
  ultrawide: 'aspect-[21/9]',
  card: 'aspect-[4/5]',
  hero: 'aspect-[16/10]',
} as const;
