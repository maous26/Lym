'use client';

import { Sparkles } from 'lucide-react';
import { ChatInterface } from '@/components/features/coach/ChatInterface';

export default function CoachPage() {
    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <div className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-md mx-auto px-4 py-4">
                    <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        Lym Coach <Sparkles size={18} className="text-purple-500" />
                    </h1>
                    <p className="text-xs text-gray-500">Votre assistant nutritionnel personnel</p>
                </div>
            </div>

            <div className="max-w-md mx-auto px-4 py-6">
                <ChatInterface />
            </div>
        </div>
    );
}
