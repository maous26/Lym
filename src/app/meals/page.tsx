"use client";

import { BottomNav } from '@/components/ui/BottomNav';
import { DateSelector } from '@/components/features/meals/DateSelector';
import { DailyNutritionSummary } from '@/components/features/meals/DailyNutritionSummary';
import { MealSection } from '@/components/features/meals/MealSection';
import { motion } from 'framer-motion';
import { UtensilsCrossed } from 'lucide-react';

export default function MealsPage() {
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
                            <h1 className="text-2xl font-bold text-gray-900">Journal Alimentaire</h1>
                            <p className="text-sm text-gray-500">Suivez vos repas quotidiens</p>
                        </div>
                    </div>
                </motion.div>

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
            </div>

            <BottomNav />
        </div>
    );
}
