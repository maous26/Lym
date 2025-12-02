'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

// ==========================================
// PAGE DE VÉRIFICATION EMAIL - Redirection
// Cette page n'est plus utilisée car on utilise Google OAuth
// Elle redirige simplement vers la page de login
// ==========================================

export default function VerifyEmailPage() {
    const router = useRouter();

    useEffect(() => {
        // Rediriger vers la page de login après un court délai
        const timer = setTimeout(() => {
            router.push('/auth/login');
        }, 1500);

        return () => clearTimeout(timer);
    }, [router]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-12 px-4">
            <div className="text-center space-y-4">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
                <p className="text-gray-600">Redirection vers la connexion...</p>
            </div>
        </div>
    );
}
