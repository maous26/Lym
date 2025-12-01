"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useOnboardingStore } from '@/store/onboarding-store';
import { PersonalizedMessage } from '@/components/features/dashboard/PersonalizedMessage';
import { WeeklyOverview } from '@/components/features/dashboard/WeeklyOverview';
import { MonthlyStats } from '@/components/features/dashboard/MonthlyStats';
import { MacroBreakdown } from '@/components/features/dashboard/MacroBreakdown';
import { CoachHub } from '@/components/features/dashboard/CoachHub';
import { CommunityWidget } from '@/components/features/dashboard/CommunityWidget';
import { WeightQuickCard } from '@/components/features/dashboard/WeightQuickCard';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const { profile, _hasHydrated } = useOnboardingStore();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (_hasHydrated && !profile.name && !isRedirecting) {
      setIsRedirecting(true);
      router.push('/onboarding');
    }
  }, [profile.name, router, _hasHydrated, isRedirecting]);

  // Show loading while store is hydrating
  if (!_hasHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  // Show loading while redirecting to onboarding
  if (!profile.name || isRedirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          <p className="text-gray-600">Redirection...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 pb-32">
      <div className="container mx-auto px-4 max-w-md pt-8">
        {/* Personalized Greeting */}
        <PersonalizedMessage />

        {/* Weight Quick Access */}
        <WeightQuickCard />

        {/* Community Widget */}
        <CommunityWidget />

        {/* Weekly Overview */}
        <WeeklyOverview />

        {/* Coach Hub - AI Insights */}
        <CoachHub />

        {/* Macro Breakdown */}
        <MacroBreakdown />

        {/* Monthly Stats */}
        <MonthlyStats />
      </div>
    </div>
  );
}
