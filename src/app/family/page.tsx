'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Users,
  Settings,
  Plus,
  Calendar,
  ShoppingCart,
  ArrowLeft,
  Bell,
  Sparkles,
} from 'lucide-react';
import { FamilyDashboard } from '@/components/features/family/FamilyDashboard';
import { useFamilyStore, useFamily, useFamilyNotifications } from '@/store/family-store';

type TabType = 'dashboard' | 'coach';

export default function FamilyPage() {
  const router = useRouter();
  const family = useFamily();
  const { isFamilyMode } = useFamilyStore();
  const { notifications, unreadCount } = useFamilyNotifications();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  // Redirect if not in family mode
  if (!isFamilyMode || !family) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-sm"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Users className="w-10 h-10 text-purple-600" />
          </div>
          <h2 className="text-2xl font-bold text-stone-800 mb-2">Mode Famille</h2>
          <p className="text-stone-500 mb-6">
            Créez votre famille pour gérer les repas et le suivi nutritionnel de tous vos proches.
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/onboarding/family')}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-2xl font-semibold shadow-lg"
          >
            Créer ma famille
          </motion.button>
          <button
            onClick={() => router.push('/')}
            className="mt-4 text-sm text-stone-500 hover:text-stone-700"
          >
            Retour à l'accueil
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 pb-24">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => router.push('/')}
                className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-stone-600"
              >
                <ArrowLeft className="w-5 h-5" />
              </motion.button>
              <div>
                <h1 className="text-xl font-bold text-stone-800 flex items-center gap-2">
                  <span className="text-purple-600">FamilLYM</span>
                </h1>
                <p className="text-xs text-stone-500">{family.name}</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => router.push('/family/settings')}
              className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-stone-600"
            >
              <Settings className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-2xl mx-auto px-4 py-4">
        <div className="flex bg-white rounded-2xl p-1 shadow-sm mb-6">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={cn(
              'flex-1 py-2.5 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2',
              activeTab === 'dashboard'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                : 'text-stone-600 hover:bg-stone-50'
            )}
          >
            <Users className="w-4 h-4" />
            Tableau de bord
          </button>
          <button
            onClick={() => setActiveTab('coach')}
            className={cn(
              'flex-1 py-2.5 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 relative',
              activeTab === 'coach'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                : 'text-stone-600 hover:bg-stone-50'
            )}
          >
            <Sparkles className="w-4 h-4" />
            Coach
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' ? (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <FamilyDashboard />
            </motion.div>
          ) : (
            <motion.div
              key="coach"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              {/* Coach notifications */}
              {notifications.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Bell className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-stone-700 mb-2">Aucune notification</h3>
                  <p className="text-sm text-stone-500">
                    Le coach famille vous enverra des conseils personnalisés.
                  </p>
                </div>
              ) : (
                notifications.map((notification, index) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={cn(
                      'bg-white rounded-2xl p-4 border',
                      notification.isRead ? 'border-stone-100' : 'border-purple-200 bg-purple-50/30'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          'w-10 h-10 rounded-xl flex items-center justify-center',
                          notification.priority === 'high'
                            ? 'bg-red-100 text-red-600'
                            : notification.type === 'achievement'
                            ? 'bg-amber-100 text-amber-600'
                            : 'bg-purple-100 text-purple-600'
                        )}
                      >
                        {notification.type === 'achievement' ? '🏆' : notification.type === 'tip' ? '💡' : '📌'}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-stone-800 text-sm">
                          {notification.title}
                        </h4>
                        <p className="text-xs text-stone-600 mt-1">{notification.message}</p>
                        {!notification.isRead && (
                          <span className="inline-block mt-2 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
                            Nouveau
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* FAB Actions */}
      <div className="fixed bottom-24 right-4 flex flex-col gap-3 z-40">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push('/family/shopping')}
          className="w-14 h-14 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl shadow-xl flex items-center justify-center"
        >
          <ShoppingCart className="w-6 h-6" />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push('/family/plan')}
          className="w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl shadow-xl flex items-center justify-center"
        >
          <Calendar className="w-6 h-6" />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push('/family/add-member')}
          className="w-14 h-14 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-2xl shadow-xl flex items-center justify-center"
        >
          <Plus className="w-6 h-6" />
        </motion.button>
      </div>
    </div>
  );
}
