"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/user-store';
import { PersonalizedMessage } from '@/components/features/dashboard/PersonalizedMessage';
import { WeeklyOverview } from '@/components/features/dashboard/WeeklyOverview';
import { MonthlyStats } from '@/components/features/dashboard/MonthlyStats';
import { MacroBreakdown } from '@/components/features/dashboard/MacroBreakdown';
import { AIInsights } from '@/components/features/dashboard/AIInsights';
import { CommunityWidget } from '@/components/features/dashboard/CommunityWidget';
import { WeightQuickCard } from '@/components/features/dashboard/WeightQuickCard';
import { FamilyModeWidget } from '@/components/features/dashboard/FamilyModeWidget';
import {
  FamilySummaryWidget,
  FamilyMealPlanWidget,
  FamilyShoppingWidget,
  FamilyCoachWidget,
  FamilyNutritionAlertsWidget,
} from '@/components/features/dashboard/FamilyHomeWidgets';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const { activeMode, _hasHydrated, hasSoloProfile, hasFamilyProfile } = useUserStore();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // Si pas de profil du tout, rediriger vers l'authentification
    if (_hasHydrated && !hasSoloProfile() && !hasFamilyProfile() && !isRedirecting) {
      setIsRedirecting(true);
      router.push('/auth/login');
    }
  }, [_hasHydrated, hasSoloProfile, hasFamilyProfile, isRedirecting, router]);

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

  // Show loading while redirecting
  if (isRedirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          <p className="text-gray-600">Redirection...</p>
        </div>
      </div>
    );
  }

  // Mode Famille : Dashboard différent
  if (activeMode === 'family') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 pb-32">
        <div className="container mx-auto px-4 max-w-md pt-8">
          {/* Résumé Famille */}
          <FamilySummaryWidget />

          {/* Plan de Repas */}
          <FamilyMealPlanWidget />

          {/* Liste de Courses */}
          <FamilyShoppingWidget />

          {/* Coach IA Famille */}
          <FamilyCoachWidget />

          {/* Alertes Nutrition */}
          <FamilyNutritionAlertsWidget />
        </div>
      </div>
    );
  }

  // Mode Solo : Dashboard classique
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 pb-32">
      <div className="container mx-auto px-4 max-w-md pt-8">
        {/* Personalized Greeting */}
        <PersonalizedMessage />

        {/* Family Mode Widget */}
        <FamilyModeWidget />

        {/* Weight Quick Access */}
        <WeightQuickCard />

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
