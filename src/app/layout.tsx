'use client';

import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { BottomNav } from "@/components/ui/BottomNav";
import { FloatingCoachAvatar } from "@/components/features/coach/FloatingCoachAvatar";
import { usePathname } from 'next/navigation';
import { useUserStore } from '@/store/user-store';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const { _hasHydrated, hasSoloProfile, hasFamilyProfile } = useUserStore();

  // Pages sans navbar: mode-selection et accueil sans profil
  const hideNavbar =
    pathname === '/mode-selection' ||
    (pathname === '/' && (!hasSoloProfile() && !hasFamilyProfile())) ||
    pathname.startsWith('/onboarding');

  return (
    <html lang="fr">
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          inter.variable
        )}
      >
        <main className="relative flex min-h-screen flex-col overflow-hidden">
          {children}
        </main>
        {!hideNavbar && <BottomNav />}
        <FloatingCoachAvatar />
      </body>
    </html>
  );
}
