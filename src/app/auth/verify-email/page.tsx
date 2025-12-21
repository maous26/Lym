'use client';

import { motion } from 'framer-motion';
import { Mail, ArrowLeft, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function VerifyEmailPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full"
            >
                <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
                    {/* Icon */}
                    <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Mail className="w-10 h-10 text-primary-600" />
                    </div>

                    {/* Title */}
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Verifiez votre email
                    </h1>

                    {/* Description */}
                    <p className="text-gray-600 mb-6">
                        Nous vous avons envoye un lien de connexion par email. Cliquez sur le lien pour vous connecter.
                    </p>

                    {/* Info box */}
                    <div className="bg-blue-50 rounded-xl p-4 mb-8">
                        <p className="text-sm text-blue-700">
                            <strong>Conseil :</strong> Verifiez vos spams si vous ne trouvez pas l'email. Le lien est valide pendant 24 heures.
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3">
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Renvoyer le lien
                        </button>

                        <Link
                            href="/auth/login"
                            className="w-full flex items-center justify-center gap-2 py-3 px-4 text-gray-500 hover:text-gray-700 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Retour a la connexion
                        </Link>
                    </div>
                </div>

                {/* Help text */}
                <p className="text-center text-sm text-gray-500 mt-6">
                    Besoin d'aide ? Contactez-nous a support@lym.app
                </p>
            </motion.div>
        </div>
    );
}
