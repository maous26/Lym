'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  Home,
  UtensilsCrossed,
  MessageCircle,
  Users,
  User,
  Plus,
  type LucideIcon,
} from 'lucide-react';

interface NavItem {
  href: string;
  icon: LucideIcon;
  label: string;
  badge?: number;
}

const navItems: NavItem[] = [
  { href: '/', icon: Home, label: 'Accueil' },
  { href: '/meals', icon: UtensilsCrossed, label: 'Repas' },
  { href: '/coach', icon: MessageCircle, label: 'Coach' },
  { href: '/profile', icon: User, label: 'Profil' },
];

const familyNavItems: NavItem[] = [
  { href: '/', icon: Home, label: 'Accueil' },
  { href: '/meals', icon: UtensilsCrossed, label: 'Repas' },
  { href: '/family', icon: Users, label: 'Famille' },
  { href: '/coach', icon: MessageCircle, label: 'Coach' },
  { href: '/profile', icon: User, label: 'Profil' },
];

export interface BottomNavProps {
  variant?: 'solo' | 'family';
  className?: string;
}

export function BottomNav({ variant = 'solo', className }: BottomNavProps) {
  const pathname = usePathname();
  const items = variant === 'family' ? familyNavItems : navItems;

  // Find active index
  const activeIndex = items.findIndex((item) => {
    if (item.href === '/') return pathname === '/';
    return pathname.startsWith(item.href);
  });

  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50',
        'bg-white/80 backdrop-blur-xl border-t border-stone-200/50',
        'pb-[env(safe-area-inset-bottom)]',
        className
      )}
    >
      <div className="flex items-center justify-around px-2 h-16">
        {items.map((item, index) => {
          const isActive = index === activeIndex;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-col items-center justify-center flex-1 h-full group"
            >
              {/* Active Indicator */}
              {isActive && (
                <motion.div
                  layoutId="activeNavIndicator"
                  className="absolute top-0 w-12 h-1 bg-primary-500 rounded-b-full"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}

              {/* Icon */}
              <motion.div
                animate={{
                  scale: isActive ? 1.1 : 1,
                  y: isActive ? -2 : 0
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              >
                <Icon
                  className={cn(
                    'w-6 h-6 transition-colors',
                    isActive ? 'text-primary-500' : 'text-stone-400 group-hover:text-stone-600'
                  )}
                />
              </motion.div>

              {/* Label */}
              <span
                className={cn(
                  'text-[10px] mt-1 font-medium transition-colors',
                  isActive ? 'text-primary-600' : 'text-stone-400 group-hover:text-stone-600'
                )}
              >
                {item.label}
              </span>

              {/* Badge */}
              {item.badge && item.badge > 0 && (
                <span className="absolute top-1 right-1/4 w-4 h-4 flex items-center justify-center text-[10px] font-bold bg-red-500 text-white rounded-full">
                  {item.badge > 9 ? '9+' : item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

// Floating Action Button for quick add
export function FloatingAddButton({ onClick }: { onClick?: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        'fixed right-4 bottom-24 z-40',
        'w-14 h-14 rounded-full flex items-center justify-center',
        'bg-gradient-to-br from-primary-500 to-primary-600',
        'shadow-btn-emerald',
        'text-white'
      )}
    >
      <Plus className="w-6 h-6" />
    </motion.button>
  );
}

export default BottomNav;
