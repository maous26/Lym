import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "LYM - Ta nutrition, simplifiée",
  description:
    "LYM t'accompagne dans ton quotidien nutritionnel avec un coach IA bienveillant, des repas adaptés et un suivi personnalisé pour toute la famille.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "LYM",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "LYM",
    title: "LYM - Ta nutrition, simplifiée",
    description:
      "Mieux manger devient une seconde nature avec LYM. Coach IA, planification familiale, et suivi nutritionnel personnalisé.",
  },
  twitter: {
    card: "summary_large_image",
    title: "LYM - Ta nutrition, simplifiée",
    description: "Mieux manger devient une seconde nature avec LYM.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafaf9" },
    { media: "(prefers-color-scheme: dark)", color: "#1c1917" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="h-full">
      <head>
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />

        {/* iOS specific meta tags */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="LYM" />

        {/* Prevent zoom on input focus on iOS */}
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body className="h-full bg-stone-50 text-stone-900 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
