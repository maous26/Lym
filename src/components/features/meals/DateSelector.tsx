"use client";

import { useMealStore } from '@/store/meal-store';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export const DateSelector = () => {
    const { selectedDate, setSelectedDate } = useMealStore();

    const changeDate = (days: number) => {
        const current = new Date(selectedDate);
        current.setDate(current.getDate() + days);
        setSelectedDate(current.toISOString().split('T')[0]);
    };

    const goToToday = () => {
        setSelectedDate(new Date().toISOString().split('T')[0]);
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        if (date.toDateString() === today.toDateString()) return "Aujourd'hui";
        if (date.toDateString() === yesterday.toDateString()) return 'Hier';
        if (date.toDateString() === tomorrow.toDateString()) return 'Demain';

        return date.toLocaleDateString('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
        });
    };

    const isToday = selectedDate === new Date().toISOString().split('T')[0];

    return (
        <div className="glass rounded-2xl p-4 mb-6">
            <div className="flex items-center justify-between">
                <button
                    onClick={() => changeDate(-1)}
                    className="h-10 w-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                >
                    <ChevronLeft className="h-5 w-5 text-gray-600" />
                </button>

                <div className="flex-1 text-center">
                    <motion.h2
                        key={selectedDate}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-lg font-bold text-gray-900 capitalize"
                    >
                        {formatDate(selectedDate)}
                    </motion.h2>
                    <p className="text-xs text-gray-500 mt-1">
                        {new Date(selectedDate).toLocaleDateString('fr-FR')}
                    </p>
                </div>

                <button
                    onClick={() => changeDate(1)}
                    className="h-10 w-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                >
                    <ChevronRight className="h-5 w-5 text-gray-600" />
                </button>
            </div>

            {!isToday && (
                <button
                    onClick={goToToday}
                    className="w-full mt-3 py-2 rounded-xl bg-primary-100 text-primary-700 text-sm font-medium hover:bg-primary-200 transition-colors flex items-center justify-center gap-2"
                >
                    <CalendarIcon className="h-4 w-4" />
                    Retour à aujourd'hui
                </button>
            )}
        </div>
    );
};
