"use client";

import { useState } from 'react';
import { BottomNav } from '@/components/ui/BottomNav';
import { DateSelector } from '@/components/features/meals/DateSelector';
import { DailyNutritionSummary } from '@/components/features/meals/DailyNutritionSummary';
import { MealSection } from '@/components/features/meals/MealSection';
import { MealCalendar } from '@/components/features/calendar/MealCalendar';
import { motion } from 'framer-motion';
import { UtensilsCrossed, Sparkles, ArrowRight, CalendarDays, BookOpen } from 'lucide-react';
import { useRouter } from 'next/navigation';

type TabType = 'journal' | 'calendar';

export default function MealsPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<TabType>('journal');

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 pb-32">
            <div className="container mx-auto px-4 max-w-md pt-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                            <UtensilsCrossed className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Mes Repas</h1>
                            <p className="text-sm text-gray-500">Journal & historique</p>
                        </div>
                    </div>
                </motion.div>

                {/* AI Planner Button */}
                <motion.button
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={() => router.push('/meals/plan')}
                    className="w-full mb-6 bg-gradient-to-r from-emerald-500 to-teal-500 text-white p-4 rounded-2xl shadow-lg shadow-emerald-200 flex items-center justify-between group"
                >
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-xl">
                            <Sparkles className="h-6 w-6 text-white" />
                        </div>
                        <div className="text-left">
                            <h3 className="font-bold text-lg">Plan 7 jours</h3>
                            <p className="text-emerald-50 text-xs">Générez vos menus avec l'IA</p>
                        </div>
                    </div>
                    <div className="bg-white/20 p-2 rounded-full group-hover:bg-white/30 transition-colors">
                        <ArrowRight className="h-5 w-5" />
                    </div>
                </motion.button>

                {/* Tab Selector */}
                <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-xl">
                    <button
                        onClick={() => setActiveTab('journal')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-medium text-sm transition-all ${
                            activeTab === 'journal'
                                ? 'bg-white text-emerald-600 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <BookOpen size={18} />
                        Journal
                    </button>
                    <button
                        onClick={() => setActiveTab('calendar')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-medium text-sm transition-all ${
                            activeTab === 'calendar'
                                ? 'bg-white text-emerald-600 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <CalendarDays size={18} />
                        Calendrier
                    </button>
                </div>

                {/* Tab Content */}
                {activeTab === 'journal' ? (
                    <motion.div
                        key="journal"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                    >
                        {/* Date Selector */}
                        <DateSelector />

                        {/* Daily Summary */}
                        <DailyNutritionSummary />

                        {/* Meal Sections */}
                        <div className="space-y-4">
                            <MealSection mealType="breakfast" />
                            <MealSection mealType="lunch" />
                            <MealSection mealType="snack" />
                            <MealSection mealType="dinner" />
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="calendar"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                    >
                        <MealCalendar />
                    </motion.div>
                )}
            </div>

            <BottomNav />
        </div>
    );
}
