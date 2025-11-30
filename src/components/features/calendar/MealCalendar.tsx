'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ChevronLeft, ChevronRight, Calendar, Flame, 
    Check, X, CalendarDays, Loader2 
} from 'lucide-react';
import { getMealsForDate, getMealStats } from '@/app/actions/meal-actions';

interface ValidatedMeal {
    id: string;
    mealName: string;
    mealType: string;
    description: string | null;
    calories: number;
    proteins: number;
    carbs: number;
    fats: number;
    status: string;
    actualDate: Date | null;
}

interface DayMeals {
    meals: ValidatedMeal[];
    totals: {
        calories: number;
        proteins: number;
        carbs: number;
        fats: number;
    };
}

export function MealCalendar() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [dayMeals, setDayMeals] = useState<DayMeals | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [weekStats, setWeekStats] = useState<any>(null);

    // Get current month's days
    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const days: (Date | null)[] = [];
        
        // Add empty days for alignment
        for (let i = 0; i < firstDay.getDay(); i++) {
            days.push(null);
        }
        
        // Add days of month
        for (let i = 1; i <= lastDay.getDate(); i++) {
            days.push(new Date(year, month, i));
        }
        
        return days;
    };

    const days = getDaysInMonth(currentDate);
    const monthName = currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

    // Navigate months
    const goToPreviousMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const goToNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    // Load meals for selected date
    const loadMealsForDate = async (date: Date) => {
        setIsLoading(true);
        setSelectedDate(date);
        
        try {
            const result = await getMealsForDate(date);
            if (result.success) {
                setDayMeals({
                    meals: result.meals || [],
                    totals: result.totals || { calories: 0, proteins: 0, carbs: 0, fats: 0 },
                });
            }
        } catch (error) {
            console.error('Error loading meals:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Load week stats
    useEffect(() => {
        const loadStats = async () => {
            const startOfWeek = new Date(currentDate);
            startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
            
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(endOfWeek.getDate() + 6);
            
            const result = await getMealStats(startOfWeek, endOfWeek);
            if (result.success) {
                setWeekStats(result.stats);
            }
        };
        
        loadStats();
    }, [currentDate]);

    // Check if date is today
    const isToday = (date: Date | null) => {
        if (!date) return false;
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };

    // Check if date is selected
    const isSelected = (date: Date | null) => {
        if (!date || !selectedDate) return false;
        return date.toDateString() === selectedDate.toDateString();
    };

    // Get meal type label
    const getMealTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            breakfast: 'Petit-déjeuner',
            lunch: 'Déjeuner',
            snack: 'Collation',
            dinner: 'Dîner',
        };
        return labels[type] || type;
    };

    // Get meal type color
    const getMealTypeColor = (type: string) => {
        const colors: Record<string, string> = {
            breakfast: 'bg-amber-100 text-amber-700',
            lunch: 'bg-green-100 text-green-700',
            snack: 'bg-purple-100 text-purple-700',
            dinner: 'bg-blue-100 text-blue-700',
        };
        return colors[type] || 'bg-gray-100 text-gray-700';
    };

    return (
        <div className="space-y-6">
            {/* Week Stats */}
            {weekStats && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-4 border border-emerald-200"
                >
                    <h3 className="text-sm font-semibold text-emerald-800 mb-3 flex items-center gap-2">
                        <Calendar size={16} />
                        Cette semaine
                    </h3>
                    <div className="grid grid-cols-4 gap-3 text-center">
                        <div className="bg-white rounded-xl p-2">
                            <div className="text-2xl font-bold text-green-600">{weekStats.validated}</div>
                            <div className="text-xs text-gray-500">Validés</div>
                        </div>
                        <div className="bg-white rounded-xl p-2">
                            <div className="text-2xl font-bold text-gray-500">{weekStats.skipped}</div>
                            <div className="text-xs text-gray-500">Sautés</div>
                        </div>
                        <div className="bg-white rounded-xl p-2">
                            <div className="text-2xl font-bold text-blue-600">{weekStats.moved}</div>
                            <div className="text-xs text-gray-500">Déplacés</div>
                        </div>
                        <div className="bg-white rounded-xl p-2">
                            <div className="text-2xl font-bold text-emerald-600">{weekStats.adherenceRate}%</div>
                            <div className="text-xs text-gray-500">Adhérence</div>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Calendar Header */}
            <div className="flex items-center justify-between">
                <button
                    onClick={goToPreviousMonth}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <ChevronLeft size={24} />
                </button>
                <h2 className="text-xl font-bold text-gray-900 capitalize">{monthName}</h2>
                <button
                    onClick={goToNextMonth}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <ChevronRight size={24} />
                </button>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-1 text-center">
                {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map((day) => (
                    <div key={day} className="text-xs font-medium text-gray-500 py-2">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
                {days.map((date, index) => (
                    <button
                        key={index}
                        onClick={() => date && loadMealsForDate(date)}
                        disabled={!date}
                        className={`
                            aspect-square flex flex-col items-center justify-center rounded-xl text-sm font-medium transition-all
                            ${!date ? 'invisible' : 'hover:bg-emerald-50'}
                            ${isToday(date) ? 'bg-emerald-500 text-white hover:bg-emerald-600' : ''}
                            ${isSelected(date) && !isToday(date) ? 'bg-emerald-100 text-emerald-700 ring-2 ring-emerald-500' : ''}
                            ${!isToday(date) && !isSelected(date) ? 'text-gray-700' : ''}
                        `}
                    >
                        {date?.getDate()}
                    </button>
                ))}
            </div>

            {/* Selected Day Meals */}
            <AnimatePresence mode="wait">
                {selectedDate && (
                    <motion.div
                        key={selectedDate.toDateString()}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-gray-900">
                                {selectedDate.toLocaleDateString('fr-FR', { 
                                    weekday: 'long', 
                                    day: 'numeric', 
                                    month: 'long' 
                                })}
                            </h3>
                            <button
                                onClick={() => {
                                    setSelectedDate(null);
                                    setDayMeals(null);
                                }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {isLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="animate-spin text-emerald-500" size={32} />
                            </div>
                        ) : dayMeals && dayMeals.meals.length > 0 ? (
                            <>
                                {/* Day Totals */}
                                <div className="bg-gray-50 rounded-xl p-3 mb-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-500">Total du jour</span>
                                        <div className="flex items-center gap-1 font-bold text-gray-900">
                                            <Flame size={16} className="text-orange-500" />
                                            {dayMeals.totals.calories} kcal
                                        </div>
                                    </div>
                                    <div className="flex gap-4 mt-2 text-xs">
                                        <span className="text-blue-600">P: {dayMeals.totals.proteins}g</span>
                                        <span className="text-green-600">G: {dayMeals.totals.carbs}g</span>
                                        <span className="text-yellow-600">L: {dayMeals.totals.fats}g</span>
                                    </div>
                                </div>

                                {/* Meals List */}
                                <div className="space-y-3">
                                    {dayMeals.meals.map((meal) => (
                                        <div
                                            key={meal.id}
                                            className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                                        >
                                            <div className={`px-2 py-1 rounded-lg text-xs font-medium ${getMealTypeColor(meal.mealType)}`}>
                                                {getMealTypeLabel(meal.mealType)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-medium text-gray-900 truncate">{meal.mealName}</h4>
                                                <p className="text-xs text-gray-500">{meal.calories} kcal</p>
                                            </div>
                                            <div className={`p-1 rounded-full ${
                                                meal.status === 'validated' ? 'bg-green-100' :
                                                meal.status === 'moved' ? 'bg-blue-100' : 'bg-gray-100'
                                            }`}>
                                                {meal.status === 'validated' ? (
                                                    <Check size={14} className="text-green-600" />
                                                ) : meal.status === 'moved' ? (
                                                    <CalendarDays size={14} className="text-blue-600" />
                                                ) : (
                                                    <X size={14} className="text-gray-400" />
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <CalendarDays size={48} className="mx-auto mb-3 opacity-30" />
                                <p>Aucun repas enregistré pour ce jour</p>
                                <p className="text-sm mt-1">Validez vos repas dans le plan 7 jours pour les voir ici</p>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

