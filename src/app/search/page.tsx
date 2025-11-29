"use client";

import { SearchBar } from '@/components/features/search/SearchBar';
import { SearchResults } from '@/components/features/search/SearchResults';
import { BottomNav } from '@/components/ui/BottomNav';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SearchPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 pb-32">
            <header className="sticky top-0 z-50 glass border-b-0 rounded-b-3xl px-6 pt-8 pb-6 mb-6">
                <button
                    onClick={() => router.back()}
                    className="mb-4 text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-2"
                >
                    <ArrowLeft className="h-5 w-5" />
                    <span className="font-medium">Retour</span>
                </button>

                <h1 className="text-2xl font-extrabold text-gray-900 mb-6">
                    Recherche d'aliments
                </h1>
                <SearchBar />
            </header>

            <main className="container mx-auto px-4 max-w-md">
                <SearchResults />
            </main>

            <BottomNav />
        </div>
    );
}
