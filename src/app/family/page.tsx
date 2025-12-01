'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFamilyStore } from '@/store/family-store';
import { getFamily } from '@/app/actions/family';
import { getActiveFamilyMealPlan } from '@/app/actions/family-meal-planning';
import { getFamilyNotifications } from '@/app/actions/family-coach';
import { FamilyDashboard } from '@/components/features/family/FamilyDashboard';
import { FamilyNotifications } from '@/components/features/family/FamilyNotifications';
import { BottomNav } from '@/components/ui/BottomNav';
import { Users, Settings, Plus, Calendar, ShoppingCart, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function FamilyPage() {
    const router = useRouter();
    const { family, setFamily, setMembers, setActiveMealPlan, isFamilyMode } = useFamilyStore();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'dashboard' | 'notifications'>('dashboard');

    useEffect(() => {
        loadFamilyData();
    }, []);

    const loadFamilyData = async () => {
        if (!isFamilyMode || !family?.id) {
            router.push('/');
            return;
        }

        try {
            setIsLoading(true);

            // Charger données famille
            const [familyResult, mealPlanResult, notificationsResult] = await Promise.all([
                getFamily(family.id),
                getActiveFamilyMealPlan(family.id),
                getFamilyNotifications({ familyId: family.id, unreadOnly: true, limit: 10 }),
            ]);

            if (familyResult.success && familyResult.family) {
                setFamily(familyResult.family as any);
                setMembers(familyResult.family.members as any[]);
            }

            if (mealPlanResult.success && mealPlanResult.mealPlan) {
                setActiveMealPlan(mealPlanResult.mealPlan as any);
            }

            if (notificationsResult.success && notificationsResult.notifications) {
                setNotifications(notificationsResult.notifications);
            }
        } catch (error) {
            console.error('Error loading family data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-600">Chargement de votre famille...</p>
                </div>
            </div>
        );
    }

    if (!family) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center">
                <div className="text-center p-6">
                    <Users size={64} className="mx-auto text-gray-300 mb-4" />
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Aucune famille</h2>
                    <p className="text-gray-600 mb-6">Créez votre famille pour commencer</p>
                    <button
                        onClick={() => router.push('/onboarding')}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-semibold"
                    >
                        Créer ma famille
                    </button>
                </div>
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
                            <button
                                onClick={() => router.push('/')}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <ArrowLeft size={20} />
                            </button>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <Users size={24} className="text-purple-600" />
                                    {family.name}
                                </h1>
                                <p className="text-xs text-gray-500">Mode Famille actif</p>
                            </div>
                        </div>
                        <button
                            onClick={() => router.push('/family/settings')}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <Settings size={20} className="text-gray-600" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="max-w-2xl mx-auto px-4 py-4">
                <div className="flex bg-white rounded-xl p-1 shadow-sm mb-6">
                    <button
                        onClick={() => setActiveTab('dashboard')}
                        className={cn(
                            "flex-1 py-2.5 rounded-lg font-medium text-sm transition-all",
                            activeTab === 'dashboard'
                                ? 'bg-purple-500 text-white shadow-md'
                                : 'text-gray-600 hover:bg-gray-50'
                        )}
                    >
                        <Users size={16} className="inline mr-2" />
                        Tableau de bord
                    </button>
                    <button
                        onClick={() => setActiveTab('notifications')}
                        className={cn(
                            "flex-1 py-2.5 rounded-lg font-medium text-sm transition-all relative",
                            activeTab === 'notifications'
                                ? 'bg-purple-500 text-white shadow-md'
                                : 'text-gray-600 hover:bg-gray-50'
                        )}
                    >
                        <Bell size={16} className="inline mr-2" />
                        Coach
                        {notifications.length > 0 && (
                            <span className="absolute top-1 right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                                {notifications.length}
                            </span>
                        )}
                    </button>
                </div>

                {/* Content */}
                {activeTab === 'dashboard' ? (
                    <FamilyDashboard />
                ) : (
                    <FamilyNotifications
                        notifications={notifications}
                        onNotificationRead={loadFamilyData}
                    />
                )}
            </div>

            {/* FAB Actions */}
            <div className="fixed bottom-24 right-6 flex flex-col gap-3 z-40">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => router.push('/family/shopping')}
                    className="w-14 h-14 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full shadow-xl flex items-center justify-center hover:shadow-2xl transition-shadow"
                    title="Liste de courses"
                >
                    <ShoppingCart size={24} />
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => router.push('/family/plan')}
                    className="w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full shadow-xl flex items-center justify-center hover:shadow-2xl transition-shadow"
                    title="Nouveau plan"
                >
                    <Calendar size={24} />
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => router.push('/family/add-member')}
                    className="w-14 h-14 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full shadow-xl flex items-center justify-center hover:shadow-2xl transition-shadow"
                    title="Ajouter un membre"
                >
                    <Plus size={24} />
                </motion.button>
            </div>

            <BottomNav />
        </div>
    );
}

