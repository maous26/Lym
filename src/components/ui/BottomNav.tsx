"use client";

import { Home, UtensilsCrossed, BarChart3, User, Bot } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const navItems = [
    { icon: Home, label: 'Accueil', path: '/' },
    { icon: UtensilsCrossed, label: 'Repas', path: '/meals' },
    { icon: Bot, label: 'Coach', path: '/coach' },
    { icon: BarChart3, label: 'Progrès', path: '/progress' },
    { icon: User, label: 'Profil', path: '/profile' },
];

export const BottomNav = () => {
    const pathname = usePathname();
    const router = useRouter();

    if (pathname.startsWith('/onboarding')) return null;

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 pb-safe">
            <div className="max-w-md mx-auto px-4 pb-4">
                <motion.div
                    initial={{ y: 100 }}
                    animate={{ y: 0 }}
                    className="glass rounded-3xl px-6 py-3 shadow-2xl"
                >
                    <div className="flex items-center justify-around">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.path;

                            return (
                                <button
                                    key={item.path}
                                    onClick={() => router.push(item.path)}
                                    className="relative flex flex-col items-center gap-1 py-2 px-3 transition-all"
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeTab"
                                            className="absolute inset-0 bg-primary-100 rounded-2xl"
                                            transition={{ type: 'spring', duration: 0.5 }}
                                        />
                                    )}
                                    <Icon
                                        className={cn(
                                            'h-6 w-6 relative z-10 transition-colors',
                                            isActive ? 'text-primary-700' : 'text-gray-400'
                                        )}
                                    />
                                    <span
                                        className={cn(
                                            'text-xs font-medium relative z-10 transition-colors',
                                            isActive ? 'text-primary-700' : 'text-gray-400'
                                        )}
                                    >
                                        {item.label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </motion.div>
            </div>
        </nav>
    );
};
