'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { WeeklyPlanGenerator } from '@/components/features/ai/WeeklyPlanGenerator';

export default function PlanPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 pb-24">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => router.back()}
              className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-stone-600"
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>
            <div>
              <h1 className="text-xl font-bold text-stone-800">Plan Repas</h1>
              <p className="text-xs text-stone-500">Génération IA personnalisée</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <WeeklyPlanGenerator
          onPlanGenerated={(plan) => {
            console.log('Plan generated:', plan);
          }}
        />
      </div>
    </div>
  );
}
