// LYM Design System - Premium Nutrition App Theme
// Inspired by the onboarding design: natural gradients, warm colors, elegant feel

export const theme = {
  // Core brand colors - Natural & Wellness palette
  colors: {
    // Primary - Emerald (Health, Growth, Nature)
    primary: {
      50: '#ecfdf5',
      100: '#d1fae5',
      200: '#a7f3d0',
      300: '#6ee7b7',
      400: '#34d399',
      500: '#10b981', // Main brand color
      600: '#059669',
      700: '#047857',
      800: '#065f46',
      900: '#064e3b',
    },
    // Secondary - Amber (Energy, Warmth, Vitality)
    secondary: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b', // Main accent
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
    },
    // Accent - Teal (Balance, Calm, Trust)
    accent: {
      50: '#f0fdfa',
      100: '#ccfbf1',
      200: '#99f6e4',
      300: '#5eead4',
      400: '#2dd4bf',
      500: '#14b8a6', // Secondary accent
      600: '#0d9488',
      700: '#0f766e',
      800: '#115e59',
      900: '#134e4a',
    },
    // Rose - Family, Love, Care
    rose: {
      50: '#fff1f2',
      100: '#ffe4e6',
      200: '#fecdd3',
      300: '#fda4af',
      400: '#fb7185',
      500: '#f43f5e',
      600: '#e11d48',
      700: '#be123c',
      800: '#9f1239',
      900: '#881337',
    },
    // Lime - Fresh, Organic
    lime: {
      50: '#f7fee7',
      100: '#ecfccb',
      200: '#d9f99d',
      300: '#bef264',
      400: '#a3e635',
      500: '#84cc16',
      600: '#65a30d',
      700: '#4d7c0f',
      800: '#3f6212',
      900: '#365314',
    },
    // Neutral - Stone (Warm grays for text and backgrounds)
    stone: {
      50: '#fafaf9',
      100: '#f5f5f4',
      200: '#e7e5e4',
      300: '#d6d3d1',
      400: '#a8a29e',
      500: '#78716c',
      600: '#57534e',
      700: '#44403c',
      800: '#292524',
      900: '#1c1917',
    },
  },

  // Gradients for different contexts
  gradients: {
    // Onboarding slides
    nature: 'from-emerald-50 via-white to-amber-50',
    energy: 'from-amber-50 via-white to-orange-50',
    balance: 'from-teal-50 via-white to-emerald-50',
    fresh: 'from-lime-50 via-white to-green-50',
    family: 'from-rose-50 via-white to-amber-50',
    // UI gradients
    primaryButton: 'from-emerald-500 to-emerald-600',
    secondaryButton: 'from-amber-500 to-amber-600',
    accentButton: 'from-teal-500 to-teal-600',
    // Card backgrounds
    glassLight: 'from-white/80 to-white/60',
    glassDark: 'from-stone-900/80 to-stone-900/60',
    // Hero sections
    heroNutrition: 'from-emerald-600 via-teal-500 to-emerald-400',
    heroFamily: 'from-rose-500 via-amber-400 to-rose-400',
    heroCoach: 'from-teal-600 via-emerald-500 to-lime-400',
  },

  // Shadow system
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    // Colored shadows for buttons
    emerald: '0 12px 35px -10px rgba(16, 185, 129, 0.5)',
    amber: '0 12px 35px -10px rgba(245, 158, 11, 0.5)',
    teal: '0 12px 35px -10px rgba(20, 184, 166, 0.5)',
    rose: '0 12px 35px -10px rgba(244, 63, 94, 0.5)',
    // Glass shadow
    glass: '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
  },

  // Border radius
  radius: {
    none: '0',
    sm: '0.375rem',
    DEFAULT: '0.5rem',
    md: '0.75rem',
    lg: '1rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '2rem',
    '4xl': '2.5rem',
    full: '9999px',
  },

  // Typography
  fonts: {
    sans: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
    display: '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    mono: '"SF Mono", "Fira Code", "Fira Mono", Menlo, Monaco, monospace',
  },

  // Animation durations
  animation: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
    slower: '700ms',
    slowest: '1000ms',
  },

  // Spacing scale (mobile-first)
  spacing: {
    safeTop: 'env(safe-area-inset-top)',
    safeBottom: 'env(safe-area-inset-bottom)',
    safeLeft: 'env(safe-area-inset-left)',
    safeRight: 'env(safe-area-inset-right)',
  },
} as const;

// Slide configurations for onboarding and marketing
export const onboardingSlides = [
  {
    title: "Mieux manger devient une seconde nature.",
    subtitle: "LYM t'accompagne dans ton quotidien, sans pression ni obsession.",
    icon: "🌱",
    gradient: "from-emerald-50 via-white to-amber-50",
    accent: "#10B981",
    accentName: "emerald",
  },
  {
    title: "LYM comprend tes repas.",
    subtitle: "Photo, voix ou recettes en ligne : LYM comprend ce que tu manges, simplement.",
    icon: "📸",
    gradient: "from-amber-50 via-white to-orange-50",
    accent: "#F59E0B",
    accentName: "amber",
  },
  {
    title: "Un soutien bienveillant, jour après jour.",
    subtitle: "Ton coach IA t'accompagne dans la durée, selon ton rythme et tes envies.",
    icon: "💚",
    gradient: "from-teal-50 via-white to-emerald-50",
    accent: "#14B8A6",
    accentName: "teal",
  },
  {
    title: "Ta vie devient plus légère.",
    subtitle: "Listes de courses intelligentes, planification familiale, portions adaptées — tout converge vers ton équilibre.",
    icon: "✨",
    gradient: "from-lime-50 via-white to-green-50",
    accent: "#84CC16",
    accentName: "lime",
  },
  {
    title: "Et ceux que tu aimes en profitent aussi.",
    subtitle: "Un même repas, des portions adaptées à chaque membre de la famille.",
    icon: "👨‍👩‍👧‍👦",
    gradient: "from-rose-50 via-white to-amber-50",
    accent: "#F43F5E",
    accentName: "rose",
  },
] as const;

// Placeholder illustrations for different contexts
export const placeholderIllustrations = {
  // Food categories
  vegetables: { icon: "🥬", colors: ["#22c55e", "#16a34a"], label: "Légumes" },
  fruits: { icon: "🍎", colors: ["#ef4444", "#f97316"], label: "Fruits" },
  proteins: { icon: "🥩", colors: ["#dc2626", "#b91c1c"], label: "Protéines" },
  grains: { icon: "🌾", colors: ["#d97706", "#b45309"], label: "Céréales" },
  dairy: { icon: "🥛", colors: ["#3b82f6", "#60a5fa"], label: "Produits laitiers" },
  fish: { icon: "🐟", colors: ["#0ea5e9", "#0284c7"], label: "Poissons" },

  // Actions
  camera: { icon: "📸", colors: ["#8b5cf6", "#7c3aed"], label: "Scanner" },
  voice: { icon: "🎙️", colors: ["#ec4899", "#db2777"], label: "Vocal" },
  search: { icon: "🔍", colors: ["#6366f1", "#4f46e5"], label: "Rechercher" },

  // Features
  coach: { icon: "💚", colors: ["#14b8a6", "#0d9488"], label: "Coach IA" },
  planning: { icon: "📅", colors: ["#10b981", "#059669"], label: "Planning" },
  shopping: { icon: "🛒", colors: ["#f59e0b", "#d97706"], label: "Courses" },
  weight: { icon: "⚖️", colors: ["#8b5cf6", "#7c3aed"], label: "Poids" },
  family: { icon: "👨‍👩‍👧‍👦", colors: ["#f43f5e", "#e11d48"], label: "Famille" },
  progress: { icon: "📊", colors: ["#06b6d4", "#0891b2"], label: "Progrès" },

  // Meals
  breakfast: { icon: "🌅", colors: ["#fbbf24", "#f59e0b"], label: "Petit-déjeuner" },
  lunch: { icon: "☀️", colors: ["#f97316", "#ea580c"], label: "Déjeuner" },
  snack: { icon: "🍪", colors: ["#a78bfa", "#8b5cf6"], label: "Collation" },
  dinner: { icon: "🌙", colors: ["#6366f1", "#4f46e5"], label: "Dîner" },

  // Empty states
  noMeals: { icon: "🍽️", colors: ["#d1d5db", "#9ca3af"], label: "Aucun repas" },
  noRecipes: { icon: "📖", colors: ["#d1d5db", "#9ca3af"], label: "Aucune recette" },
  noData: { icon: "📭", colors: ["#d1d5db", "#9ca3af"], label: "Aucune donnée" },

  // Success states
  success: { icon: "✅", colors: ["#22c55e", "#16a34a"], label: "Succès" },
  achievement: { icon: "🏆", colors: ["#fbbf24", "#f59e0b"], label: "Objectif atteint" },
  streak: { icon: "🔥", colors: ["#f97316", "#ea580c"], label: "Série" },
} as const;

export type PlaceholderKey = keyof typeof placeholderIllustrations;
