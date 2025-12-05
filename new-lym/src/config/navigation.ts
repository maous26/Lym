import { Home, Utensils, Bot, TrendingUp, User, ShoppingCart, Users } from 'lucide-react';

export interface NavItem {
  name: string;
  href: string;
  icon: typeof Home;
  requiresAuth?: boolean;
  requiresPlan?: 'PREMIUM' | 'FAMILY';
}

export const BOTTOM_NAV_ITEMS: NavItem[] = [
  {
    name: 'Accueil',
    href: '/dashboard',
    icon: Home,
    requiresAuth: true,
  },
  {
    name: 'Repas',
    href: '/meals',
    icon: Utensils,
    requiresAuth: true,
  },
  {
    name: 'Coach',
    href: '/coach',
    icon: Bot,
    requiresAuth: true,
  },
  {
    name: 'Progrès',
    href: '/progress',
    icon: TrendingUp,
    requiresAuth: true,
  },
  {
    name: 'Profil',
    href: '/profile',
    icon: User,
    requiresAuth: true,
  },
];

export const SECONDARY_NAV_ITEMS: NavItem[] = [
  {
    name: 'Recettes',
    href: '/recipes',
    icon: Utensils,
    requiresAuth: true,
  },
  {
    name: 'Courses',
    href: '/shopping',
    icon: ShoppingCart,
    requiresAuth: true,
    requiresPlan: 'PREMIUM',
  },
  {
    name: 'Famille',
    href: '/family',
    icon: Users,
    requiresAuth: true,
    requiresPlan: 'FAMILY',
  },
];

export const AUTH_ROUTES = ['/login', '/signup', '/verify'];
export const ONBOARDING_ROUTES = ['/plan-selection', '/setup'];
export const PROTECTED_ROUTES = [
  '/dashboard',
  '/meals',
  '/recipes',
  '/coach',
  '/progress',
  '/profile',
  '/shopping',
  '/family',
];
