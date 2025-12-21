'use client';

import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';

function AuthErrorContent() {
    const searchParams = useSearchParams();
    const error = searchParams.get('error');

    const errorMessages: Record<string, { title: string; description: string }> = {
        Configuration: {
            title: 'Erreur de configuration',
            description: "Il y a un probleme avec la configuration de l'authentification. Veuillez contacter le support.",
        },
        AccessDenied: {
            title: 'Acces refuse',
            description: "Vous n'avez pas la permission d'acceder a cette ressource.",
        },
        Verification: {
            title: 'Erreur de verification',
            description: 'Le lien de verification a expire ou est invalide. Veuillez demander un nouveau lien.',
        },
        OAuthSignin: {
            title: 'Erreur de connexion OAuth',
            description: 'Impossible de demarrer le processus de connexion. Veuillez reessayer.',
        },
        OAuthCallback: {
            title: 'Erreur de callback',
            description: "Une erreur s'est produite lors de la connexion avec le fournisseur externe.",
        },
        OAuthCreateAccount: {
            title: 'Erreur de creation de compte',
            description: 'Impossible de creer un compte avec ce fournisseur. Essayez une autre methode.',
        },
        EmailCreateAccount: {
            title: 'Erreur de creation de compte',
            description: 'Impossible de creer un compte avec cet email. Essayez une autre methode.',
        },
        Callback: {
            title: 'Erreur de connexion',
            description: "Une erreur s'est produite lors de la connexion. Veuillez reessayer.",
        },
        OAuthAccountNotLinked: {
            title: 'Compte non lie',
            description: 'Cet email est deja associe a un autre compte. Connectez-vous avec la methode originale.',
        },
        EmailSignin: {
            title: 'Erreur email',
            description: "Impossible d'envoyer l'email de connexion. Verifiez votre adresse email.",
        },
        CredentialsSignin: {
            title: 'Identifiants incorrects',
            description: 'Email ou mot de passe incorrect. Veuillez verifier vos informations.',
        },
        SessionRequired: {
            title: 'Session requise',
            description: 'Vous devez etre connecte pour acceder a cette page.',
        },
        Default: {
            title: 'Erreur',
            description: "Une erreur inattendue s'est produite. Veuillez reessayer.",
        },
    };

    const currentError = errorMessages[error || 'Default'] || errorMessages.Default;

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full"
            >
                <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
                    {/* Icon */}
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertTriangle className="w-10 h-10 text-red-600" />
                    </div>

                    {/* Title */}
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        {currentError.title}
                    </h1>

                    {/* Description */}
                    <p className="text-gray-600 mb-8">
                        {currentError.description}
                    </p>

                    {/* Error code */}
                    {error && (
                        <p className="text-xs text-gray-400 mb-6">
                            Code: {error}
                        </p>
                    )}

                    {/* Actions */}
                    <div className="space-y-3">
                        <Link
                            href="/auth/login"
                            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Reessayer
                        </Link>

                        <Link
                            href="/"
                            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Retour a l'accueil
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

export default function AuthErrorPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" />
            </div>
        }>
            <AuthErrorContent />
        </Suspense>
    );
}
