import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from '@/core/providers';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-geist-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'LYM - Votre Coach Nutrition Personnel',
    template: '%s | LYM',
  },
  description: 'Planifiez vos repas, suivez votre nutrition et atteignez vos objectifs santé avec LYM, votre coach nutrition personnel propulsé par l\'IA.',
  keywords: ['nutrition', 'repas', 'santé', 'alimentation', 'coach', 'IA', 'planification'],
  authors: [{ name: 'LYM' }],
  creator: 'LYM',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'LYM',
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: '#10B981',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={inter.variable}>
      <body className="antialiased min-h-screen bg-gray-50">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
