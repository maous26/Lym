'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Bell, Settings } from 'lucide-react';
import { Avatar } from '@/core/components/ui';
import { cn } from '@/core/lib/cn';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  showNotifications?: boolean;
  showSettings?: boolean;
  className?: string;
}

export function Header({
  title,
  showNotifications = true,
  showSettings = false,
  className,
}: HeaderProps) {
  const { data: session } = useSession();

  return (
    <header className={cn('sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100', className)}>
      <div className="flex items-center justify-between h-16 px-4 max-w-lg mx-auto">
        {/* Left: Avatar or Logo */}
        <div className="flex items-center gap-3">
          {session?.user ? (
            <Link href="/profile">
              <Avatar
                src={session.user.image}
                alt={session.user.name || 'User'}
                fallback={session.user.name || session.user.email}
                size="md"
              />
            </Link>
          ) : (
            <Link href="/" className="text-2xl font-bold text-emerald-600">
              LYM
            </Link>
          )}
          {title && (
            <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {showNotifications && session && (
            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
              <Bell className="w-5 h-5" />
            </button>
          )}
          {showSettings && session && (
            <Link
              href="/profile"
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Settings className="w-5 h-5" />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
