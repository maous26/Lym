"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useOnboardingStore } from '@/store/onboarding-store';
import { PersonalizedMessage } from '@/components/features/dashboard/PersonalizedMessage';
import { WeeklyOverview } from '@/components/features/dashboard/WeeklyOverview';
import { MonthlyStats } from '@/components/features/dashboard/MonthlyStats';
import { MacroBreakdown } from '@/components/features/dashboard/MacroBreakdown';
import { AIInsights } from '@/components/features/dashboard/AIInsights';
import { BottomNav } from '@/components/ui/BottomNav';
import { Plus, UtensilsCrossed } from 'lucide-react';
import { motion } from 'framer-motion';

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

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 gap-3 mb-6"
        >
          <button
            onClick={() => router.push('/meals')}
            className="glass rounded-2xl p-4 flex items-center gap-3 hover:scale-[1.02] transition-transform"
          >
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
              <UtensilsCrossed className="h-6 w-6 text-white" />
            </div>
            <div className="text-left">
              <p className="font-bold text-gray-900">Journal</p>
              <p className="text-xs text-gray-500">Mes repas</p>
            </div>
          </button>

          <button
            onClick={() => router.push('/meals/add?type=snack&date=' + new Date().toISOString().split('T')[0])}
            className="glass rounded-2xl p-4 flex items-center gap-3 hover:scale-[1.02] transition-transform"
          >
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
              <Plus className="h-6 w-6 text-white" />
            </div>
            <div className="text-left">
              <p className="font-bold text-gray-900">Ajouter</p>
              <p className="text-xs text-gray-500">Un aliment</p>
            </div>
          </button>
        </motion.div>

        {/* Weekly Overview */}
        <WeeklyOverview />

        {/* AI Insights */}
        <AIInsights />

        {/* Macro Breakdown */}
        <MacroBreakdown />

        {/* Monthly Stats */}
        <MonthlyStats />
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
