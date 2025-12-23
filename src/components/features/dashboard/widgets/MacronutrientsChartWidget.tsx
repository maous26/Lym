'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

type TimeRange = '7days' | '30days' | '90days' | '1year' | 'all';
type MacroFilter = 'all' | 'proteins' | 'carbs' | 'fats';

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
  proteins: '#EC4899',
  carbs: '#3B82F6',
  fats: '#22C55E',
  calories: '#F97316',
};

// Labels en français
const MACRO_LABELS: Record<MacroFilter | 'calories', string> = {
  all: 'Tous',
  proteins: 'Protéines',
  carbs: 'Glucides',
  fats: 'Lipides',
  calories: 'kCal',
};

export function MacronutrientsChartWidget({
  data,
  className,
}: MacronutrientsChartWidgetProps) {
  const [selectedRange, setSelectedRange] = useState<TimeRange>('30days');
  const [selectedMacro, setSelectedMacro] = useState<MacroFilter>('all');

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

  // Formater les données pour Recharts
  const chartData = useMemo(() => {
    return filteredData.map((d) => ({
      ...d,
      date: new Date(d.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
      fullDate: d.date,
    }));
  }, [filteredData]);

  // Calculer les moyennes - seulement sur les jours avec des données
  const averages = useMemo(() => {
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

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-stone-200">
          <p className="font-semibold text-stone-700 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: <span className="font-bold">{entry.value} {entry.name === 'Calories' ? 'kcal' : 'g'}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Déterminer les barres à afficher
  const renderBars = () => {
    if (selectedMacro === 'all') {
      return (
        <>
          <Bar
            dataKey="proteins"
            name="Protéines"
            fill={MACRO_COLORS.proteins}
            stackId="stack"
            radius={[0, 0, 0, 0]}
          />
          <Bar
            dataKey="carbs"
            name="Glucides"
            fill={MACRO_COLORS.carbs}
            stackId="stack"
            radius={[0, 0, 0, 0]}
          />
          <Bar
            dataKey="fats"
            name="Lipides"
            fill={MACRO_COLORS.fats}
            stackId="stack"
            radius={[4, 4, 0, 0]}
          />
        </>
      );
    }

    return (
      <Bar
        dataKey={selectedMacro}
        name={MACRO_LABELS[selectedMacro]}
        fill={MACRO_COLORS[selectedMacro]}
        radius={[4, 4, 0, 0]}
      />
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('bg-white rounded-3xl shadow-card overflow-hidden', className)}
    >
      {/* Header */}
      <div className="px-4 pt-4 pb-2">
        <h2 className="text-lg font-bold text-stone-800">Macronutriments</h2>
      </div>

      {/* Filtres macros - cliquables */}
      <div className="px-4 pb-2">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Protéines */}
          <button
            onClick={() => setSelectedMacro(selectedMacro === 'proteins' ? 'all' : 'proteins')}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-semibold transition-all',
              selectedMacro === 'proteins'
                ? 'ring-2 ring-offset-1 ring-pink-400 scale-105'
                : 'opacity-80 hover:opacity-100'
            )}
            style={{
              backgroundColor: MACRO_COLORS.proteins,
              color: 'white'
            }}
          >
            {MACRO_LABELS.proteins}
          </button>

          {/* Glucides */}
          <button
            onClick={() => setSelectedMacro(selectedMacro === 'carbs' ? 'all' : 'carbs')}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-semibold transition-all',
              selectedMacro === 'carbs'
                ? 'ring-2 ring-offset-1 ring-blue-400 scale-105'
                : 'opacity-80 hover:opacity-100'
            )}
            style={{
              backgroundColor: MACRO_COLORS.carbs,
              color: 'white'
            }}
          >
            {MACRO_LABELS.carbs}
          </button>

          {/* Lipides */}
          <button
            onClick={() => setSelectedMacro(selectedMacro === 'fats' ? 'all' : 'fats')}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-semibold transition-all',
              selectedMacro === 'fats'
                ? 'ring-2 ring-offset-1 ring-green-400 scale-105'
                : 'opacity-80 hover:opacity-100'
            )}
            style={{
              backgroundColor: MACRO_COLORS.fats,
              color: 'white'
            }}
          >
            {MACRO_LABELS.fats}
          </button>

          {/* kCal - affiche tous */}
          <button
            onClick={() => setSelectedMacro('all')}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-semibold transition-all',
              selectedMacro === 'all'
                ? 'ring-2 ring-offset-1 ring-orange-400 scale-105'
                : 'opacity-80 hover:opacity-100'
            )}
            style={{
              backgroundColor: MACRO_COLORS.calories,
              color: 'white'
            }}
          >
            {MACRO_LABELS.calories}
          </button>
        </div>

        {/* Moyennes */}
        <div className="flex items-center gap-4 mt-3 text-sm">
          <span className="text-stone-500">Moyenne :</span>
          {selectedMacro === 'all' || selectedMacro === 'proteins' ? (
            <span style={{ color: MACRO_COLORS.proteins }} className="font-bold">
              {averages.proteins}g P
            </span>
          ) : null}
          {selectedMacro === 'all' || selectedMacro === 'carbs' ? (
            <span style={{ color: MACRO_COLORS.carbs }} className="font-bold">
              {averages.carbs}g G
            </span>
          ) : null}
          {selectedMacro === 'all' || selectedMacro === 'fats' ? (
            <span style={{ color: MACRO_COLORS.fats }} className="font-bold">
              {averages.fats}g L
            </span>
          ) : null}
          <span style={{ color: MACRO_COLORS.calories }} className="font-bold">
            {averages.calories} kcal
          </span>
        </div>
      </div>

      {/* Graphique Recharts */}
      <div className="px-2 py-2">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: '#9ca3af' }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#9ca3af' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}${selectedMacro === 'all' ? 'g' : ''}`}
            />
            <Tooltip content={<CustomTooltip />} />
            {renderBars()}
          </BarChart>
        </ResponsiveContainer>
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
                ? 'bg-stone-800 text-white'
                : 'text-stone-500 hover:bg-stone-100'
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
