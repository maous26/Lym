'use client';

import { useState, useEffect, useMemo, useImperativeHandle, forwardRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Scale,
  TrendingDown,
  TrendingUp,
  Minus,
  Plus,
  RefreshCw,
  Check,
  ChevronDown,
  ChevronUp,
  Target,
  Bluetooth,
  Calendar,
  Trash2,
  Edit3,
  X,
} from 'lucide-react';
import {
  addWeightEntry,
  getWeightHistory,
  getWeightStats,
  updateWeightEntry,
  deleteWeightEntry,
  syncFromHealthPlatform,
  WeightStats,
} from '@/app/actions/weight';
import { useUserStore, useSoloProfile } from '@/store/user-store';
import { cn } from '@/lib/utils';

export interface WeightTrackerRef {
  refresh: () => Promise<void>;
}

interface WeightEntry {
  id: string;
  weight: number;
  bodyFat?: number | null;
  muscleMass?: number | null;
  source: string;
  deviceName?: string | null;
  notes?: string | null;
  measuredAt: Date;
}

type TimeFilter = '7d' | '30d' | '90d';
type ModalMode = 'add' | 'edit';

// Responsive SVG Graph Component
function WeightGraph({
  data,
  targetWeight,
  timeFilter,
}: {
  data: WeightEntry[];
  targetWeight?: number;
  timeFilter: TimeFilter;
}) {
  if (data.length === 0) {
    return (
      <div className="aspect-[2/1] flex items-center justify-center bg-gray-50 rounded-xl">
        <div className="text-center">
          <Scale className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-400">Pas encore de données</p>
          <p className="text-xs text-gray-300">Ajoutez votre première pesée</p>
        </div>
      </div>
    );
  }

  // Sort data by date (oldest first)
  const sortedData = [...data].sort(
    (a, b) => new Date(a.measuredAt).getTime() - new Date(b.measuredAt).getTime()
  );

  const weights = sortedData.map((d) => d.weight);
  const minWeight = Math.min(...weights, targetWeight || Infinity) - 1;
  const maxWeight = Math.max(...weights) + 1;
  const range = maxWeight - minWeight || 1;

  // SVG dimensions - using a fixed aspect ratio viewBox
  const svgWidth = 300;
  const svgHeight = 150;
  const padding = { top: 25, right: 10, bottom: 20, left: 35 };
  const graphWidth = svgWidth - padding.left - padding.right;
  const graphHeight = svgHeight - padding.top - padding.bottom;

  const getX = (index: number) => {
    return padding.left + (index / Math.max(sortedData.length - 1, 1)) * graphWidth;
  };

  const getY = (weight: number) => {
    return padding.top + (1 - (weight - minWeight) / range) * graphHeight;
  };

  // Create SVG path with smooth curves
  const points = sortedData.map((entry, i) => {
    const x = getX(i);
    const y = getY(entry.weight);
    return { x, y, weight: entry.weight, date: entry.measuredAt, source: entry.source };
  });

  // Smooth curve path using bezier curves
  const pathD = points
    .map((p, i) => {
      if (i === 0) return `M ${p.x} ${p.y}`;
      const prev = points[i - 1];
      const cpx = (prev.x + p.x) / 2;
      return `C ${cpx} ${prev.y}, ${cpx} ${p.y}, ${p.x} ${p.y}`;
    })
    .join(' ');

  // Area fill path
  const areaD = `${pathD} L ${padding.left + graphWidth} ${padding.top + graphHeight} L ${padding.left} ${padding.top + graphHeight} Z`;

  // Generate Y-axis labels
  const yLabels: { value: number; y: number }[] = [];
  const step = range / 3;
  for (let i = 0; i <= 3; i++) {
    const value = Math.round((maxWeight - step * i) * 10) / 10;
    yLabels.push({ value, y: getY(value) });
  }

  // Generate X-axis labels based on time filter
  const getXLabels = () => {
    if (sortedData.length < 2) return [];
    const labels: { label: string; x: number }[] = [];
    const labelCount =
      timeFilter === '7d' ? Math.min(7, sortedData.length) : timeFilter === '30d' ? 5 : 4;
    const stepCount = Math.max(1, Math.floor((sortedData.length - 1) / (labelCount - 1)));

    for (let i = 0; i < sortedData.length; i += stepCount) {
      const entry = sortedData[i];
      const date = new Date(entry.measuredAt);
      let label = '';
      if (timeFilter === '7d') {
        label = date.toLocaleDateString('fr-FR', { weekday: 'short' });
      } else if (timeFilter === '30d') {
        label = date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
      } else {
        label = date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
      }
      labels.push({ label, x: getX(i) });
    }
    // Always add last point
    if (labels.length > 0 && labels[labels.length - 1].x < getX(sortedData.length - 1)) {
      const lastEntry = sortedData[sortedData.length - 1];
      const date = new Date(lastEntry.measuredAt);
      labels.push({
        label: date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
        x: getX(sortedData.length - 1),
      });
    }
    return labels;
  };

  const xLabels = getXLabels();
  const lastPoint = points[points.length - 1];
  const targetY = targetWeight ? getY(targetWeight) : null;

  return (
    <div className="w-full">
      {/* Graph container with aspect ratio */}
      <div className="relative w-full">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          preserveAspectRatio="xMidYMid meet"
          className="w-full h-auto"
          style={{ maxHeight: '200px' }}
        >
          {/* Gradient definition */}
          <defs>
            <linearGradient id="weightGradientTracker" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {yLabels.slice(1, -1).map((label, i) => (
            <line
              key={i}
              x1={padding.left}
              y1={label.y}
              x2={padding.left + graphWidth}
              y2={label.y}
              stroke="rgb(229, 231, 235)"
              strokeWidth="0.5"
            />
          ))}

          {/* Target line */}
          {targetWeight && targetY && targetY > padding.top && targetY < padding.top + graphHeight && (
            <line
              x1={padding.left}
              y1={targetY}
              x2={padding.left + graphWidth}
              y2={targetY}
              stroke="rgb(34, 197, 94)"
              strokeWidth="1"
              strokeDasharray="4,4"
            />
          )}

          {/* Area fill */}
          <path d={areaD} fill="url(#weightGradientTracker)" />

          {/* Line */}
          <path
            d={pathD}
            fill="none"
            stroke="rgb(59, 130, 246)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Points */}
          {points.map((p, i) => (
            <g key={i}>
              <circle
                cx={p.x}
                cy={p.y}
                r="4"
                fill={p.source === 'manual' ? 'rgb(59, 130, 246)' : 'rgb(34, 197, 94)'}
              />
              <circle cx={p.x} cy={p.y} r="2" fill="white" />
            </g>
          ))}

          {/* Last point tooltip - positioned as SVG element */}
          {lastPoint && (
            <g>
              {/* Tooltip background */}
              <rect
                x={Math.min(lastPoint.x - 25, svgWidth - 55)}
                y={Math.max(lastPoint.y - 30, 2)}
                width="50"
                height="20"
                rx="4"
                fill="rgb(37, 99, 235)"
              />
              {/* Tooltip arrow */}
              <polygon
                points={`${lastPoint.x - 4},${Math.max(lastPoint.y - 10, 22)} ${lastPoint.x + 4},${Math.max(lastPoint.y - 10, 22)} ${lastPoint.x},${Math.max(lastPoint.y - 5, 27)}`}
                fill="rgb(37, 99, 235)"
              />
              {/* Tooltip text */}
              <text
                x={Math.min(lastPoint.x, svgWidth - 30)}
                y={Math.max(lastPoint.y - 16, 16)}
                textAnchor="middle"
                fill="white"
                fontSize="10"
                fontWeight="600"
              >
                {lastPoint.weight.toFixed(1)} kg
              </text>
            </g>
          )}

          {/* Target label */}
          {targetWeight && targetY && targetY > padding.top && targetY < padding.top + graphHeight && (
            <g>
              <rect
                x={padding.left + graphWidth - 35}
                y={targetY - 9}
                width="38"
                height="18"
                rx="4"
                fill="rgb(240, 253, 244)"
                stroke="rgb(187, 247, 208)"
                strokeWidth="1"
              />
              <text
                x={padding.left + graphWidth - 16}
                y={targetY + 4}
                textAnchor="middle"
                fill="rgb(22, 163, 74)"
                fontSize="9"
                fontWeight="600"
              >
                {targetWeight}kg
              </text>
            </g>
          )}

          {/* Y-axis labels */}
          {yLabels.map((label, i) => (
            <text
              key={i}
              x={padding.left - 2}
              y={label.y + 3}
              textAnchor="end"
              fill="rgb(156, 163, 175)"
              fontSize="8"
            >
              {label.value}
            </text>
          ))}

          {/* X-axis labels */}
          {xLabels.slice(0, 5).map((item, i) => (
            <text
              key={i}
              x={item.x}
              y={svgHeight - 2}
              textAnchor="middle"
              fill="rgb(156, 163, 175)"
              fontSize="8"
            >
              {item.label}
            </text>
          ))}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-3 text-[10px] text-gray-500">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-blue-500" />
          <span>Manuel</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span>Balance connectée</span>
        </div>
      </div>
    </div>
  );
}

export const WeightTracker = forwardRef<WeightTrackerRef>(function WeightTracker(_props, ref) {
  const profile = useSoloProfile();
  const updateSoloProfile = useUserStore((state) => state.updateSoloProfile);
  const [entries, setEntries] = useState<WeightEntry[]>([]);
  const [stats, setStats] = useState<WeightStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>('add');
  const [editingEntry, setEditingEntry] = useState<WeightEntry | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [newWeight, setNewWeight] = useState(profile?.weight?.toString() || '70');
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('30d');

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const days = timeFilter === '7d' ? 7 : timeFilter === '30d' ? 30 : 90;
      const [historyResult, statsResult] = await Promise.all([
        getWeightHistory('default', days),
        getWeightStats('default'),
      ]);

      if (historyResult.success && historyResult.entries) {
        setEntries(historyResult.entries as WeightEntry[]);
      }
      if (statsResult.success && statsResult.stats) {
        setStats(statsResult.stats);
      }
    } catch (error) {
      console.error('Erreur chargement données poids:', error);
    } finally {
      setIsLoading(false);
    }
  }, [timeFilter]);

  // Expose refresh method via ref
  useImperativeHandle(ref, () => ({
    refresh: loadData
  }), [loadData]);

  // Auto-sync on mount if health platform is available
  useEffect(() => {
    const autoSync = async () => {
      try {
        const { initHealthService, requestHealthPermissions, fetchWeightFromHealthPlatform } =
          await import('@/lib/health/health-service');

        const { available, platform } = await initHealthService();
        if (!available) return;

        const { granted } = await requestHealthPermissions();
        if (!granted) return;

        // Fetch last 7 days of weight data for auto-sync
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);

        const healthData = await fetchWeightFromHealthPlatform(startDate);

        if (healthData.length > 0) {
          await syncFromHealthPlatform(
            'default',
            platform as 'apple_health' | 'google_fit',
            healthData
          );
          // Reload data after sync
          loadData();
        }
      } catch {
        // Silently fail - platform not available
      }
    };

    autoSync();
  }, []);

  // Charger les données
  useEffect(() => {
    loadData();
  }, [loadData]);

  const openAddModal = () => {
    setModalMode('add');
    setEditingEntry(null);
    setNewWeight(profile?.weight?.toString() || stats?.currentWeight?.toString() || '70');
    setSelectedDate(new Date().toISOString().split('T')[0]);
    setShowModal(true);
  };

  const openEditModal = (entry: WeightEntry) => {
    setModalMode('edit');
    setEditingEntry(entry);
    setNewWeight(entry.weight.toString());
    setSelectedDate(new Date(entry.measuredAt).toISOString().split('T')[0]);
    setShowModal(true);
  };

  const handleSaveWeight = async () => {
    // Handle both comma and dot as decimal separator
    const weight = parseFloat(newWeight.replace(',', '.'));
    if (isNaN(weight) || weight < 20 || weight > 300) {
      alert('Veuillez entrer un poids valide (entre 20 et 300 kg)');
      return;
    }

    setIsSaving(true);

    try {
      // Create date at noon to avoid timezone issues
      const measuredAt = new Date(selectedDate + 'T12:00:00');

      if (modalMode === 'add') {
        const result = await addWeightEntry({
          weight,
          source: 'manual',
          measuredAt,
        });

        if (result.success) {
          updateSoloProfile({ weight });
          setShowModal(false);
          loadData();
        } else {
          alert(result.error || 'Erreur lors de l\'enregistrement');
        }
      } else if (modalMode === 'edit' && editingEntry) {
        const result = await updateWeightEntry(editingEntry.id, {
          weight,
          measuredAt,
        });

        if (result.success) {
          updateSoloProfile({ weight });
          setShowModal(false);
          loadData();
        } else {
          alert(result.error || 'Erreur lors de la modification');
        }
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Une erreur est survenue');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteEntry = async (entry: WeightEntry) => {
    if (!confirm(`Supprimer la pesée du ${new Date(entry.measuredAt).toLocaleDateString('fr-FR')} ?`)) {
      return;
    }

    try {
      const result = await deleteWeightEntry(entry.id);
      if (result.success) {
        loadData();
      } else {
        alert('Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur suppression:', error);
      alert('Une erreur est survenue');
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const { initHealthService, requestHealthPermissions, fetchWeightFromHealthPlatform } =
        await import('@/lib/health/health-service');

      const { available, platform } = await initHealthService();

      if (!available) {
        alert('Aucune plateforme de santé disponible. Installez Apple Santé ou Google Fit.');
        return;
      }

      const { granted } = await requestHealthPermissions();
      if (!granted) {
        alert("Permissions refusées. Veuillez autoriser l'accès aux données de santé.");
        return;
      }

      const days = timeFilter === '7d' ? 7 : timeFilter === '30d' ? 30 : 90;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const healthData = await fetchWeightFromHealthPlatform(startDate);

      if (healthData.length > 0) {
        const { syncFromHealthPlatform } = await import('@/app/actions/weight');
        const result = await syncFromHealthPlatform(
          'default',
          platform as 'apple_health' | 'google_fit',
          healthData
        );

        if (result.success) {
          alert(`${result.message} - ${healthData.length} pesée(s) synchronisée(s)`);
          loadData();
        }
      } else {
        alert('Aucune nouvelle donnée à synchroniser');
      }
    } catch (error) {
      console.error('Erreur sync:', error);
      alert('Fonctionnalité non disponible sur cette plateforme');
    } finally {
      setIsSyncing(false);
    }
  };

  const getWeightChangeIcon = () => {
    if (!stats?.weightChange) return <Minus className="h-4 w-4 text-gray-400" />;
    if (stats.weightChange < 0) return <TrendingDown className="h-4 w-4 text-green-500" />;
    if (stats.weightChange > 0) return <TrendingUp className="h-4 w-4 text-orange-500" />;
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  const getWeightChangeText = () => {
    if (!stats?.weightChange) return '—';
    const sign = stats.weightChange > 0 ? '+' : '';
    return `${sign}${stats.weightChange.toFixed(1)} kg`;
  };

  const getWeightChangeColor = () => {
    if (!stats?.weightChange) return 'text-gray-500';
    if (profile?.goal === 'weight_loss') {
      return stats.weightChange < 0 ? 'text-green-600' : 'text-orange-600';
    }
    if (profile?.goal === 'muscle_gain') {
      return stats.weightChange > 0 ? 'text-green-600' : 'text-orange-600';
    }
    return 'text-gray-600';
  };

  const timeFilters: { label: string; value: TimeFilter }[] = [
    { label: '7j', value: '7d' },
    { label: '30j', value: '30d' },
    { label: '3m', value: '90d' },
  ];

  const connectedEntries = useMemo(
    () => entries.filter((e) => e.source !== 'manual').length,
    [entries]
  );

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-40 bg-gray-100 rounded"></div>
      </div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <Scale className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Suivi du poids</h3>
              <p className="text-xs text-gray-500">
                {stats?.lastUpdated
                  ? `Mis à jour ${new Date(stats.lastUpdated).toLocaleDateString('fr-FR')}`
                  : 'Aucune donnée'}
                {connectedEntries > 0 && (
                  <span className="ml-1 text-green-600">• {connectedEntries} sync</span>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className={cn(
              'p-2 rounded-lg transition-colors disabled:opacity-50',
              isSyncing ? 'bg-blue-50' : 'hover:bg-gray-100'
            )}
            title="Synchroniser avec Apple Santé / Google Fit"
          >
            <RefreshCw
              className={cn('h-5 w-5', isSyncing ? 'animate-spin text-blue-500' : 'text-gray-500')}
            />
          </button>
        </div>

        {/* Current Weight + Stats */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Poids actuel</p>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl sm:text-4xl font-bold text-gray-900">
                {stats?.currentWeight?.toFixed(1) || profile?.weight || '—'}
              </span>
              <span className="text-base text-gray-500">kg</span>
            </div>
          </div>
          <div
            className={cn(
              'flex items-center gap-1 px-3 py-1.5 rounded-full',
              stats?.weightChange
                ? stats.weightChange < 0
                  ? 'bg-green-100'
                  : 'bg-orange-100'
                : 'bg-gray-100'
            )}
          >
            {getWeightChangeIcon()}
            <span className={cn('text-sm font-medium', getWeightChangeColor())}>
              {getWeightChangeText()}
            </span>
          </div>
        </div>

        {/* Target Progress */}
        {profile?.targetWeight && profile.targetWeight > 0 && (
          <div className="mb-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <div className="flex items-center gap-1 text-green-700">
                <Target className="w-3 h-3" />
                <span className="font-medium">Objectif: {profile.targetWeight} kg</span>
              </div>
              <span className="font-bold text-green-600">
                {Math.max(
                  0,
                  (stats?.currentWeight || profile.weight || 0) - profile.targetWeight
                ).toFixed(1)}{' '}
                kg restants
              </span>
            </div>
            <div className="h-2 bg-green-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"
                initial={{ width: 0 }}
                animate={{
                  width: `${Math.min(
                    100,
                    Math.max(
                      0,
                      (((profile.weight || 0) - (stats?.currentWeight || profile.weight || 0)) /
                        ((profile.weight || 0) - profile.targetWeight)) *
                        100
                    )
                  )}%`,
                }}
                transition={{ duration: 0.8 }}
              />
            </div>
          </div>
        )}

        {/* Time Filter */}
        <div className="flex gap-1 p-1 bg-gray-100 rounded-xl mb-4">
          {timeFilters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setTimeFilter(filter.value)}
              className={cn(
                'flex-1 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-all',
                timeFilter === filter.value
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Weight Graph */}
        <AnimatePresence mode="wait">
          <motion.div
            key={timeFilter}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <WeightGraph
              data={entries}
              targetWeight={profile?.targetWeight}
              timeFilter={timeFilter}
            />
          </motion.div>
        </AnimatePresence>

        {/* Stats Grid */}
        {stats && stats.totalEntries > 0 && (
          <div className="grid grid-cols-3 gap-2 mt-4">
            <div className="bg-blue-50 rounded-xl p-2 sm:p-3 text-center">
              <p className="text-[10px] sm:text-xs text-blue-600 mb-0.5">Départ</p>
              <p className="font-bold text-blue-900 text-sm sm:text-base">
                {stats.startWeight?.toFixed(1)} kg
              </p>
            </div>
            <div className="bg-green-50 rounded-xl p-2 sm:p-3 text-center">
              <p className="text-[10px] sm:text-xs text-green-600 mb-0.5">Minimum</p>
              <p className="font-bold text-green-900 text-sm sm:text-base">
                {stats.lowestWeight?.toFixed(1)} kg
              </p>
            </div>
            <div className="bg-purple-50 rounded-xl p-2 sm:p-3 text-center">
              <p className="text-[10px] sm:text-xs text-purple-600 mb-0.5">Moyenne</p>
              <p className="font-bold text-purple-900 text-sm sm:text-base">
                {stats.averageWeight?.toFixed(1)} kg
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={openAddModal}
            className="flex-1 bg-blue-500 text-white py-2.5 sm:py-3 rounded-xl font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <Plus size={18} />
            Ajouter une pesée
          </button>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
          >
            {showHistory ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>

        {/* History */}
        <AnimatePresence>
          {showHistory && entries.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-4 pt-4 border-t border-gray-100 space-y-2 max-h-72 overflow-y-auto">
                {entries.slice(0, 20).map((entry, index) => {
                  const prevEntry = entries[index + 1];
                  const change = prevEntry ? entry.weight - prevEntry.weight : 0;
                  const isManual = entry.source === 'manual';

                  return (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between py-2.5 px-3 bg-gray-50 rounded-lg group"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            'w-2 h-2 rounded-full',
                            isManual ? 'bg-blue-500' : 'bg-green-500'
                          )}
                        />
                        <div>
                          <p className="font-medium text-gray-900">{entry.weight.toFixed(1)} kg</p>
                          <p className="text-xs text-gray-500">
                            {isManual ? 'Manuel' : entry.deviceName || 'Balance'}
                            {!isManual && (
                              <Bluetooth className="inline w-3 h-3 ml-1 text-green-500" />
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <p className="text-sm text-gray-600">
                            {new Date(entry.measuredAt).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'short',
                            })}
                          </p>
                          {change !== 0 && (
                            <p
                              className={cn(
                                'text-xs font-medium',
                                change < 0 ? 'text-green-500' : 'text-orange-500'
                              )}
                            >
                              {change > 0 ? '+' : ''}
                              {change.toFixed(1)} kg
                            </p>
                          )}
                        </div>
                        {/* Edit/Delete buttons - only for manual entries */}
                        {isManual && (
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => openEditModal(entry)}
                              className="p-1.5 rounded-lg hover:bg-blue-100 text-blue-600"
                              title="Modifier"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteEntry(entry)}
                              className="p-1.5 rounded-lg hover:bg-red-100 text-red-600"
                              title="Supprimer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Add/Edit Weight Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  {modalMode === 'add' ? 'Nouvelle pesée' : 'Modifier la pesée'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 rounded-lg hover:bg-gray-100"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Date Picker */}
              <div className="mb-6">
                <label className="text-sm text-gray-600 mb-2 block">Date de la pesée</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none bg-white text-gray-900"
                  />
                </div>
              </div>

              {/* Weight Input */}
              <div className="mb-8">
                <label className="text-sm text-gray-600 mb-2 block">Poids (kg)</label>
                <div className="flex items-center justify-center gap-4">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      const current = parseFloat(newWeight.replace(',', '.')) || 0;
                      setNewWeight((current - 0.1).toFixed(1));
                    }}
                    className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                  >
                    <Minus className="w-6 h-6 text-gray-600" />
                  </motion.button>
                  <div className="text-center">
                    <input
                      type="text"
                      inputMode="decimal"
                      pattern="[0-9]*[.,]?[0-9]*"
                      value={newWeight}
                      onChange={(e) => {
                        // Allow digits, dots, and commas
                        const value = e.target.value.replace(/[^0-9.,]/g, '');
                        setNewWeight(value);
                      }}
                      className="w-32 text-center text-5xl font-bold py-2 border-b-2 border-blue-500 focus:outline-none bg-transparent text-gray-800"
                    />
                    <p className="text-gray-400 mt-1">kg</p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      const current = parseFloat(newWeight.replace(',', '.')) || 0;
                      setNewWeight((current + 0.1).toFixed(1));
                    }}
                    className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                  >
                    <Plus className="w-6 h-6 text-gray-600" />
                  </motion.button>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowModal(false)}
                  disabled={isSaving}
                  className="flex-1 py-3.5 rounded-xl border border-gray-200 font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Annuler
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSaveWeight}
                  disabled={isSaving}
                  className="flex-1 py-3.5 rounded-xl bg-blue-500 text-white font-medium hover:bg-blue-600 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <Check className="w-5 h-5" />
                  )}
                  {modalMode === 'add' ? 'Enregistrer' : 'Modifier'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
});
