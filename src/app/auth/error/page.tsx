'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowLeft } from 'lucide-react';

const errorMessages: Record<string, { title: string; description: string }> = {
    access_denied: {
        title: 'Accès Refusé',
        description: 'Vous avez refusé la connexion. Veuillez réessayer.',
    },
    callback_route_error: {
        title: 'Erreur de Callback',
        description: 'Une erreur est survenue lors du traitement de votre demande.',
    },
    oauthsignin: {
        title: 'Erreur OAuth',
        description: 'Une erreur est survenue lors de la connexion avec Google.',
    },
    oauthcallback: {
        title: 'Erreur de Callback OAuth',
        description: 'Une erreur est survenue lors du traitement de votre connexion Google.',
    },
    emailsignin: {
        title: 'Erreur Email',
        description: 'Une erreur est survenue lors du traitement de votre email.',
    },
    emailcallback: {
        title: 'Erreur de Vérification Email',
        description: 'Le lien de vérification est invalide ou a expiré.',
    },
    default: {
        title: 'Erreur d\'Authentification',
        description: 'Une erreur est survenue. Veuillez réessayer.',
    },
};

export default function ErrorPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const error = searchParams.get('error') || 'default';

    const errorInfo = errorMessages[error.toLowerCase()] || errorMessages.default;

    const handleRetry = () => {
        router.push('/auth/login');
    };

    const handleGoHome = () => {
        router.push('/');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-12 px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md mx-auto w-full"
            >
                <div className="bg-white rounded-3xl shadow-2xl p-8 space-y-6 text-center">
                    {/* Icon */}
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="flex justify-center"
                    >
                        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                            <AlertCircle size={40} className="text-red-600" />
                        </div>
                    </motion.div>

                    {/* Content */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="space-y-2"
                    >
                        <h2 className="text-3xl font-bold text-gray-900">{errorInfo.title}</h2>
                        <p className="text-gray-600">{errorInfo.description}</p>
                    </motion.div>

                    {/* Error Code */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200"
                    >
                        <p className="text-xs text-gray-500">Code d'erreur</p>
                        <p className="font-mono text-sm text-gray-900 break-all">{error}</p>
                    </motion.div>

                    {/* Actions */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="space-y-3 pt-4"
                    >
                        <button
                            onClick={handleRetry}
                            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold hover:shadow-lg transition-all"
                        >
                            Réessayer
                        </button>
                        <button
                            onClick={handleGoHome}
                            className="w-full py-3 px-4 rounded-xl bg-gray-200 text-gray-900 font-semibold hover:bg-gray-300 transition-all flex items-center justify-center gap-2"
                        >
                            <ArrowLeft size={18} />
                            Retour à l'accueil
                        </button>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
}
