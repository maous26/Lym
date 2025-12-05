import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { MarketingCarousel, GoogleSignInButton } from '@/modules/auth/components';

export const metadata = {
  title: 'Connexion',
  description: 'Connectez-vous à LYM pour accéder à votre coach nutrition personnel.',
};

export default async function LoginPage() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-emerald-50 to-white">
      {/* Header */}
      <header className="px-6 py-4">
        <div className="text-2xl font-bold text-emerald-600">LYM</div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col">
        {/* Carousel section */}
        <div className="flex-1 min-h-[400px]">
          <MarketingCarousel />
        </div>

        {/* Login section */}
        <div className="px-6 pb-8 space-y-6">
          {/* Features list */}
          <div className="space-y-3">
            <FeatureItem icon="check" text="Plans de repas personnalisés" />
            <FeatureItem icon="check" text="Accès illimité aux recettes" />
            <FeatureItem icon="check" text="Liste de courses automatique" />
          </div>

          {/* CTA */}
          <div className="space-y-4">
            <GoogleSignInButton />

            <p className="text-center text-sm text-gray-500">
              En continuant, vous acceptez nos{' '}
              <a href="/terms" className="text-emerald-600 hover:underline">
                Conditions d&apos;utilisation
              </a>{' '}
              et notre{' '}
              <a href="/privacy" className="text-emerald-600 hover:underline">
                Politique de confidentialité
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

function FeatureItem({ icon, text }: { icon: 'check'; text: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
        <svg
          className="w-4 h-4 text-emerald-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>
      <span className="text-gray-700">{text}</span>
    </div>
  );
}
