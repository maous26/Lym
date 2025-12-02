'use client';

import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { AlertCircle } from 'lucide-react';
import { Suspense } from 'react';

function ErrorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const error = searchParams.get('error');

  const errorMessages: { [key: string]: string } = {
    OAuthSignin: 'Erreur lors de la connexion avec OAuth',
    OAuthCallback: 'Erreur lors du callback OAuth',
    OAuthCreateAccount: 'Impossible de créer un compte avec OAuth',
    EmailCreateAccount: 'Impossible de créer un compte avec cet email',
    Callback: 'Erreur lors du callback',
    OAuthAccountNotLinked: 'Le compte n\'est pas lié à ce provider',
    EmailSignInError: 'Erreur lors de l\'envoi de l\'email',
    CredentialsSignin: 'Email ou mot de passe invalide',
    default: 'Une erreur s\'est produite lors de la connexion',
  };

  const message = errorMessages[error as string] || errorMessages.default;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <AlertCircle className="w-16 h-16 text-red-500" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Erreur d'authentification</h1>
            <p className="text-gray-600">{message}</p>

            <div className="pt-4 space-y-3">
              <button
                onClick={() => router.push('/auth/login')}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold hover:shadow-lg transition-all"
              >
                Retour à la connexion
              </button>
              <button
                onClick={() => router.push('/')}
                className="w-full py-3 px-4 rounded-xl border-2 border-gray-200 hover:bg-gray-50 text-gray-900 font-semibold transition-all"
              >
                Aller à l'accueil
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ErrorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center"><div className="text-gray-600">Chargement...</div></div>}>
      <ErrorContent />
    </Suspense>
  );
}
