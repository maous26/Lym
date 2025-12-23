'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';

type TimeRange = '7days' | '30days' | '90days' | '1year' | 'all';

interface DailyMacros {
  date: string;
  proteins: number;
  carbs: number;
  fats: number;
  calories: number;
}

interface MacronutrientsChartWidgetProps {
  data: DailyMacros[];
  onViewDetails?: () => void;
  className?: string;
}

const TIME_RANGE_LABELS: Record<TimeRange, string> = {
  '7days': '7 jours',
  '30days': '30 jours',
  '90days': '90 jours',
  '1year': '1 an',
  'all': 'Tout',
};

// Couleurs des macros (comme sur la capture)
const MACRO_COLORS = {
  proteins: '#EC4899', // Rose/Pink
  carbs: '#3B82F6',    // Bleu
  fats: '#22C55E',     // Vert
};

const MACRO_LABELS = {
  proteins: 'Protein',
  carbs: 'Carbs',
  fats: 'Fat',
};

export function MacronutrientsChartWidget({
  data,
  onViewDetails,
  className,
}: MacronutrientsChartWidgetProps) {
  const [selectedRange, setSelectedRange] = useState<TimeRange>('30days');

  // Filtrer les données selon la période sélectionnée
  const filteredData = useMemo(() => {
    const now = new Date();
    let daysToShow: number;

    switch (selectedRange) {
      case '7days':
        daysToShow = 7;
        break;
      case '30days':
        daysToShow = 30;
        break;
      case '90days':
        daysToShow = 90;
        break;
      case '1year':
        daysToShow = 365;
        break;
      case 'all':
        return data;
      default:
        daysToShow = 30;
    }

    const cutoffDate = new Date(now);
    cutoffDate.setDate(cutoffDate.getDate() - daysToShow);

    return data.filter((d) => new Date(d.date) >= cutoffDate);
  }, [data, selectedRange]);

  // Calculer les moyennes
  const averages = useMemo(() => {
    if (filteredData.length === 0) {
      return { proteins: 0, carbs: 0, fats: 0, calories: 0 };
    }

    const totals = filteredData.reduce(
      (acc, d) => ({
        proteins: acc.proteins + d.proteins,
        carbs: acc.carbs + d.carbs,
        fats: acc.fats + d.fats,
        calories: acc.calories + d.calories,
      }),
      { proteins: 0, carbs: 0, fats: 0, calories: 0 }
    );

    return {
      proteins: Math.round(totals.proteins / filteredData.length),
      carbs: Math.round(totals.carbs / filteredData.length),
      fats: Math.round(totals.fats / filteredData.length),
      calories: Math.round(totals.calories / filteredData.length),
    };
  }, [filteredData]);

  // Calculer la plage de dates
  const dateRange = useMemo(() => {
    if (filteredData.length === 0) return '';

    const dates = filteredData.map((d) => new Date(d.date));
    const minDate = new Date(Math.min(...dates.map((d) => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map((d) => d.getTime())));

    const formatDate = (date: Date) => {
      const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
      return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
    };

    return `${formatDate(minDate)} - ${formatDate(maxDate)}`;
  }, [filteredData]);

  // Calculer la hauteur max pour l'échelle
  const maxCalories = useMemo(() => {
    if (filteredData.length === 0) return 2500;
    return Math.max(...filteredData.map((d) => d.calories), 2500);
  }, [filteredData]);

  // Dernier jour pour le Nutrition Log
  const lastDay = filteredData.length > 0 ? filteredData[filteredData.length - 1] : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('bg-white rounded-3xl shadow-card overflow-hidden', className)}
    >
      {/* Header bleu */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-3">
        <div className="flex items-center justify-between">
          <button
            onClick={onViewDetails}
            className="text-white/80 text-sm flex items-center gap-1"
          >
            &lt; Retour
          </button>
          <h2 className="text-white font-semibold text-lg">Macronutriments</h2>
          <div className="w-16" /> {/* Spacer */}
        </div>
      </div>

      {/* Légende des macros et moyennes */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center justify-between">
          <span className="text-stone-500 font-medium">MOY.</span>
          <div className="flex items-center gap-4">
            {/* Protein */}
            <div className="flex items-center gap-2">
              <span
                className="px-3 py-1 rounded-full text-xs font-semibold text-white"
                style={{ backgroundColor: MACRO_COLORS.proteins }}
              >
                {MACRO_LABELS.proteins}
              </span>
            </div>
            {/* Carbs */}
            <div className="flex items-center gap-2">
              <span
                className="px-3 py-1 rounded-full text-xs font-semibold text-white"
                style={{ backgroundColor: MACRO_COLORS.carbs }}
              >
                {MACRO_LABELS.carbs}
              </span>
            </div>
            {/* Fat */}
            <div className="flex items-center gap-2">
              <span
                className="px-3 py-1 rounded-full text-xs font-semibold text-white"
                style={{ backgroundColor: MACRO_COLORS.fats }}
              >
                {MACRO_LABELS.fats}
              </span>
            </div>
            {/* kCal */}
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold text-white bg-orange-400">
                kCal
              </span>
            </div>
          </div>
        </div>

        {/* Valeurs moyennes */}
        <div className="flex items-center justify-between mt-2">
          <span className="text-stone-400 text-sm"></span>
          <div className="flex items-center gap-4 text-sm font-bold">
            <span style={{ color: MACRO_COLORS.proteins }}>{averages.proteins} g</span>
            <span style={{ color: MACRO_COLORS.carbs }}>{averages.carbs} g</span>
            <span style={{ color: MACRO_COLORS.fats }}>{averages.fats} g</span>
            <span className="text-orange-500">{averages.calories} kCal</span>
          </div>
        </div>

        {/* Plage de dates */}
        <div className="mt-3 text-stone-600 font-medium text-sm">{dateRange}</div>
      </div>

      {/* Graphique en barres */}
      <div className="px-4 py-2">
        <div className="relative h-48">
          {/* Lignes de grille horizontales */}
          <div className="absolute inset-0 flex flex-col justify-between">
            {[maxCalories, maxCalories * 0.8, maxCalories * 0.6, maxCalories * 0.4, maxCalories * 0.2, 0].map(
              (val, i) => (
                <div key={i} className="flex items-center">
                  <div className="flex-1 border-t border-stone-100" />
                  <span className="text-[10px] text-stone-400 ml-1 w-8 text-right">
                    {Math.round(val)}
                  </span>
                </div>
              )
            )}
          </div>

          {/* Barres */}
          <div className="absolute inset-0 flex items-end justify-around pr-10">
            {filteredData.slice(-30).map((day, index) => {
              const totalHeight = (day.calories / maxCalories) * 100;
              const proteinHeight = (day.proteins * 4 / day.calories) * totalHeight || 0;
              const carbsHeight = (day.carbs * 4 / day.calories) * totalHeight || 0;
              const fatsHeight = (day.fats * 9 / day.calories) * totalHeight || 0;

              return (
                <motion.div
                  key={day.date}
                  initial={{ height: 0 }}
                  animate={{ height: `${totalHeight}%` }}
                  transition={{ duration: 0.5, delay: index * 0.02 }}
                  className="w-2 flex flex-col-reverse rounded-t overflow-hidden"
                  style={{ minWidth: '4px', maxWidth: '12px' }}
                >
                  {/* Fats (vert) - en bas */}
                  <div
                    style={{
                      height: `${fatsHeight}%`,
                      backgroundColor: MACRO_COLORS.fats,
                    }}
                  />
                  {/* Carbs (bleu) - au milieu */}
                  <div
                    style={{
                      height: `${carbsHeight}%`,
                      backgroundColor: MACRO_COLORS.carbs,
                    }}
                  />
                  {/* Proteins (rose) - en haut */}
                  <div
                    style={{
                      height: `${proteinHeight}%`,
                      backgroundColor: MACRO_COLORS.proteins,
                    }}
                  />
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Labels de dates en bas */}
        <div className="flex justify-between px-2 mt-2 text-[10px] text-stone-400">
          {filteredData.length > 0 && (
            <>
              <span>
                {new Date(filteredData[Math.floor(filteredData.length * 0.33)]?.date || '').toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' })}
              </span>
              <span>
                {new Date(filteredData[Math.floor(filteredData.length * 0.66)]?.date || '').toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' })}
              </span>
              <span>
                {new Date(filteredData[filteredData.length - 1]?.date || '').toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' })}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Sélecteur de période */}
      <div className="flex justify-center gap-2 px-4 py-3 border-t border-stone-100">
        {(Object.keys(TIME_RANGE_LABELS) as TimeRange[]).map((range) => (
          <button
            key={range}
            onClick={() => setSelectedRange(range)}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-medium transition-all',
              selectedRange === range
                ? 'bg-stone-100 text-stone-900 border border-stone-300'
                : 'text-blue-500 hover:bg-blue-50'
            )}
          >
            {TIME_RANGE_LABELS[range]}
          </button>
        ))}
      </div>

      {/* Nutrition Log - Dernier jour */}
      {lastDay && (
        <div className="px-4 py-4 border-t border-stone-100">
          <h3 className="font-bold text-stone-900 text-lg mb-3">Nutrition Log</h3>
          <button
            onClick={onViewDetails}
            className="w-full flex items-center justify-between py-2 hover:bg-stone-50 rounded-lg transition-colors"
          >
            <div className="flex flex-col items-start">
              <span className="text-stone-500 text-sm">
                {new Date(lastDay.date).toLocaleDateString('fr-FR', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
              <div className="flex items-center gap-4 mt-1">
                <span className="flex items-center gap-1">
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                    style={{ backgroundColor: MACRO_COLORS.proteins }}
                  >
                    P
                  </span>
                  <span style={{ color: MACRO_COLORS.proteins }} className="font-semibold">
                    {lastDay.proteins}
                  </span>
                </span>
                <span className="flex items-center gap-1">
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                    style={{ backgroundColor: MACRO_COLORS.carbs }}
                  >
                    C
                  </span>
                  <span style={{ color: MACRO_COLORS.carbs }} className="font-semibold">
                    {lastDay.carbs}
                  </span>
                </span>
                <span className="flex items-center gap-1">
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                    style={{ backgroundColor: MACRO_COLORS.fats }}
                  >
                    F
                  </span>
                  <span style={{ color: MACRO_COLORS.fats }} className="font-semibold">
                    {lastDay.fats}
                  </span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white bg-orange-400">

                  </span>
                  <span className="text-orange-500 font-semibold">{lastDay.calories}</span>
                </span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-stone-400" />
          </button>
        </div>
      )}
    </motion.div>
  );
}

export default MacronutrientsChartWidget;
