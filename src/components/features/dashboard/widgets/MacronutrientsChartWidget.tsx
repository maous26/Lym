'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

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

// Couleurs des macros
const MACRO_COLORS = {
  proteins: '#EC4899', // Rose/Pink
  carbs: '#3B82F6',    // Bleu
  fats: '#22C55E',     // Vert
};

// Labels en français
const MACRO_LABELS = {
  proteins: 'Protéines',
  carbs: 'Glucides',
  fats: 'Lipides',
};

export function MacronutrientsChartWidget({
  data,
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

  // Calculer les moyennes - seulement sur les jours avec des données
  const averages = useMemo(() => {
    // Filtrer uniquement les jours avec des calories > 0
    const daysWithData = filteredData.filter((d) => d.calories > 0);

    if (daysWithData.length === 0) {
      return { proteins: 0, carbs: 0, fats: 0, calories: 0 };
    }

    const totals = daysWithData.reduce(
      (acc, d) => ({
        proteins: acc.proteins + d.proteins,
        carbs: acc.carbs + d.carbs,
        fats: acc.fats + d.fats,
        calories: acc.calories + d.calories,
      }),
      { proteins: 0, carbs: 0, fats: 0, calories: 0 }
    );

    return {
      proteins: Math.round(totals.proteins / daysWithData.length),
      carbs: Math.round(totals.carbs / daysWithData.length),
      fats: Math.round(totals.fats / daysWithData.length),
      calories: Math.round(totals.calories / daysWithData.length),
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
    const maxFromData = Math.max(...filteredData.map((d) => d.calories), 0);
    return maxFromData > 0 ? maxFromData : 2500;
  }, [filteredData]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('bg-white rounded-3xl shadow-card overflow-hidden', className)}
    >
      {/* Header bleu pastel */}
      <div className="bg-gradient-to-r from-blue-100 to-blue-200 px-4 py-3">
        <h2 className="text-blue-800 font-semibold text-lg text-center">Macronutriments</h2>
      </div>

      {/* Légende des macros */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center justify-center gap-3">
          {/* Protéines */}
          <span
            className="px-3 py-1 rounded-full text-xs font-semibold text-white"
            style={{ backgroundColor: MACRO_COLORS.proteins }}
          >
            {MACRO_LABELS.proteins}
          </span>
          {/* Glucides */}
          <span
            className="px-3 py-1 rounded-full text-xs font-semibold text-white"
            style={{ backgroundColor: MACRO_COLORS.carbs }}
          >
            {MACRO_LABELS.carbs}
          </span>
          {/* Lipides */}
          <span
            className="px-3 py-1 rounded-full text-xs font-semibold text-white"
            style={{ backgroundColor: MACRO_COLORS.fats }}
          >
            {MACRO_LABELS.fats}
          </span>
          {/* kCal */}
          <span className="px-3 py-1 rounded-full text-xs font-semibold text-white bg-orange-400">
            kCal
          </span>
        </div>

        {/* Valeurs moyennes */}
        <div className="flex items-center justify-center gap-4 mt-3 text-sm font-bold">
          <span style={{ color: MACRO_COLORS.proteins }}>{averages.proteins} g</span>
          <span style={{ color: MACRO_COLORS.carbs }}>{averages.carbs} g</span>
          <span style={{ color: MACRO_COLORS.fats }}>{averages.fats} g</span>
          <span className="text-orange-500">{averages.calories} kCal</span>
        </div>

        {/* Plage de dates */}
        <div className="mt-3 text-stone-600 font-medium text-sm text-center">{dateRange}</div>
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
              // Ne pas afficher de barre si pas de calories
              if (day.calories === 0) {
                return (
                  <div
                    key={day.date}
                    className="w-2"
                    style={{ minWidth: '4px', maxWidth: '12px' }}
                  />
                );
              }

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
                  {/* Lipides (vert) - en bas */}
                  <div
                    style={{
                      height: `${fatsHeight}%`,
                      backgroundColor: MACRO_COLORS.fats,
                    }}
                  />
                  {/* Glucides (bleu) - au milieu */}
                  <div
                    style={{
                      height: `${carbsHeight}%`,
                      backgroundColor: MACRO_COLORS.carbs,
                    }}
                  />
                  {/* Protéines (rose) - en haut */}
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
    </motion.div>
  );
}

export default MacronutrientsChartWidget;
