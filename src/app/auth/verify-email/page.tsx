'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, CheckCircle, ArrowRight } from 'lucide-react';

export default function VerifyEmailPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const email = searchParams.get('email') || '';

    const handleContinue = () => {
        router.push('/auth/plan-selection');
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
                        <div className="relative w-24 h-24">
                            <div className="absolute inset-0 bg-blue-100 rounded-full" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Mail size={48} className="text-blue-600" />
                            </div>
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.8, duration: 0.4 }}
                                className="absolute bottom-0 right-0 bg-green-500 rounded-full p-2"
                            >
                                <CheckCircle size={24} className="text-white" fill="white" />
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* Content */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="space-y-2"
                    >
                        <h2 className="text-3xl font-bold text-gray-900">Vérifiez votre Email</h2>
                        <p className="text-gray-600">
                            Un lien de confirmation a été envoyé à :
                        </p>
                    </motion.div>

                    {/* Email Display */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200"
                    >
                        <p className="font-semibold text-gray-900 break-all">{email}</p>
                    </motion.div>

                    {/* Instructions */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="text-left bg-blue-50 rounded-xl p-4 space-y-2"
                    >
                        <p className="text-sm font-semibold text-gray-900">À faire :</p>
                        <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
                            <li>Vérifiez votre boîte de réception</li>
                            <li>Cliquez sur le lien "Vérifier mon email"</li>
                            <li>Vous serez redirigé pour sélectionner votre plan</li>
                        </ol>
                    </motion.div>

                    {/* Continue Button */}
                    <motion.button
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        onClick={handleContinue}
                        className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                        Je confirme mon email
                        <ArrowRight size={18} />
                    </motion.button>

                    {/* Helper Text */}
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7 }}
                        className="text-xs text-gray-500"
                    >
                        Ne voyez pas l'email ? Vérifiez vos spams
                    </motion.p>
                </div>
            </motion.div>
        </div>
    );
}
