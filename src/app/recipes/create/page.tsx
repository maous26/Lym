'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateRecipePage() {
    const router = useRouter();
    
    useEffect(() => {
        // Redirect to share page instead
        router.replace('/recipes/share');
    }, [router]);

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-600">Redirection...</p>
            </div>
        </div>
    );
}
