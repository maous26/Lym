"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useOnboardingStore } from '@/store/onboarding-store';
import { PersonalizedMessage } from '@/components/features/dashboard/PersonalizedMessage';
import { WeeklyOverview } from '@/components/features/dashboard/WeeklyOverview';
import { MonthlyStats } from '@/components/features/dashboard/MonthlyStats';
import { MacroBreakdown } from '@/components/features/dashboard/MacroBreakdown';
import { AIInsights } from '@/components/features/dashboard/AIInsights';
import { CommunityWidget } from '@/components/features/dashboard/CommunityWidget';

export default function Home() {
  const { profile } = useOnboardingStore();
  const router = useRouter();

  useEffect(() => {
    if (!profile.name) {
      router.push('/onboarding');
    }
  }, [profile.name, router]);

  if (!profile.name) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 pb-32">
      <div className="container mx-auto px-4 max-w-md pt-8">
        {/* Personalized Greeting */}
        <PersonalizedMessage />

        {/* Community Widget */}
        <CommunityWidget />

        {/* Weekly Overview */}
        <WeeklyOverview />

        {/* AI Insights */}
        <AIInsights />

        {/* Macro Breakdown */}
        <MacroBreakdown />

        {/* Monthly Stats */}
        <MonthlyStats />
      </div>
    </div>
  );
}
