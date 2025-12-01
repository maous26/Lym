'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Scale, TrendingDown, TrendingUp, Minus, Plus, 
    RefreshCw, Bluetooth, Smartphone, Check, X,
    ChevronDown, ChevronUp, Calendar
} from 'lucide-react';
import { addWeightEntry, getWeightHistory, getWeightStats, WeightStats } from '@/app/actions/weight';
import { useOnboardingStore } from '@/store/onboarding-store';

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

export function WeightTracker() {
    const { profile, updateProfile } = useOnboardingStore();
    const [entries, setEntries] = useState<WeightEntry[]>([]);
    const [stats, setStats] = useState<WeightStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [newWeight, setNewWeight] = useState(profile.weight?.toString() || '70');
    const [isSyncing, setIsSyncing] = useState(false);

    // Charger les données
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [historyResult, statsResult] = await Promise.all([
                getWeightHistory('default', 30),
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
    };

    const handleAddWeight = async () => {
        const weight = parseFloat(newWeight);
        if (isNaN(weight) || weight < 20 || weight > 300) {
            alert('Veuillez entrer un poids valide (entre 20 et 300 kg)');
            return;
        }

        const result = await addWeightEntry({
            weight,
            source: 'manual',
        });

        if (result.success) {
            // Mettre à jour le profil local
            updateProfile({ weight });
            setShowAddModal(false);
            loadData();
        }
    };

    const handleSync = async () => {
        setIsSyncing(true);
        try {
            // Dynamically import health service
            const { initHealthService, requestHealthPermissions, fetchWeightFromHealthPlatform } = 
                await import('@/lib/health/health-service');
            
            const { available, platform } = await initHealthService();
            
            if (!available) {
                alert('Aucune plateforme de santé disponible. Installez Apple Santé ou Google Fit.');
                return;
            }

            const { granted } = await requestHealthPermissions();
            if (!granted) {
                alert('Permissions refusées. Veuillez autoriser l\'accès aux données de santé.');
                return;
            }

            // Récupérer les 30 derniers jours
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - 30);
            
            const healthData = await fetchWeightFromHealthPlatform(startDate);
            
            if (healthData.length > 0) {
                // Importer et synchroniser
                const { syncFromHealthPlatform } = await import('@/app/actions/weight');
                const result = await syncFromHealthPlatform('default', platform as any, healthData);
                
                if (result.success) {
                    alert(result.message);
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

    // Calcul du changement de poids
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
        // Si objectif perte de poids, baisse = vert
        if (profile.primaryGoal === 'weight_loss') {
            return stats.weightChange < 0 ? 'text-green-600' : 'text-orange-600';
        }
        // Si objectif prise de masse, hausse = vert
        if (profile.primaryGoal === 'muscle_gain') {
            return stats.weightChange > 0 ? 'text-green-600' : 'text-orange-600';
        }
        return 'text-gray-600';
    };

    // Mini graphique simplifié
    const renderMiniGraph = () => {
        if (entries.length < 2) return null;

        const last7 = entries.slice(0, 7).reverse();
        const weights = last7.map(e => e.weight);
        const min = Math.min(...weights) - 0.5;
        const max = Math.max(...weights) + 0.5;
        const range = max - min || 1;

        return (
            <div className="flex items-end gap-1 h-12">
                {last7.map((entry, i) => {
                    const height = ((entry.weight - min) / range) * 100;
                    const isLast = i === last7.length - 1;
                    return (
                        <div
                            key={entry.id}
                            className={`flex-1 rounded-t transition-all ${
                                isLast ? 'bg-primary-500' : 'bg-primary-200'
                            }`}
                            style={{ height: `${Math.max(height, 10)}%` }}
                            title={`${entry.weight} kg`}
                        />
                    );
                })}
            </div>
        );
    };

    if (isLoading) {
        return (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-16 bg-gray-100 rounded"></div>
            </div>
        );
    }

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
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
                                    : 'Aucune donnée'
                                }
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleSync}
                        disabled={isSyncing}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
                        title="Synchroniser avec Apple Santé / Google Fit"
                    >
                        <RefreshCw className={`h-5 w-5 text-gray-500 ${isSyncing ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                {/* Poids actuel */}
                <div className="flex items-end justify-between mb-4">
                    <div>
                        <p className="text-sm text-gray-500 mb-1">Poids actuel</p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-bold text-gray-900">
                                {stats?.currentWeight?.toFixed(1) || profile.weight || '—'}
                            </span>
                            <span className="text-lg text-gray-500">kg</span>
                        </div>
                    </div>
                    <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full ${
                        stats?.weightChange 
                            ? (stats.weightChange < 0 ? 'bg-green-100' : 'bg-orange-100')
                            : 'bg-gray-100'
                    }`}>
                        {getWeightChangeIcon()}
                        <span className={`text-sm font-medium ${getWeightChangeColor()}`}>
                            {getWeightChangeText()}
                        </span>
                    </div>
                </div>

                {/* Mini graphique */}
                {entries.length >= 2 && (
                    <div className="mb-4 bg-gray-50 rounded-xl p-3">
                        <p className="text-xs text-gray-500 mb-2">7 derniers jours</p>
                        {renderMiniGraph()}
                    </div>
                )}

                {/* Statistiques */}
                {stats && stats.totalEntries > 0 && (
                    <div className="grid grid-cols-3 gap-3 mb-4">
                        <div className="bg-blue-50 rounded-xl p-3 text-center">
                            <p className="text-xs text-blue-600 mb-1">Départ</p>
                            <p className="font-bold text-blue-900">{stats.startWeight?.toFixed(1)} kg</p>
                        </div>
                        <div className="bg-green-50 rounded-xl p-3 text-center">
                            <p className="text-xs text-green-600 mb-1">Minimum</p>
                            <p className="font-bold text-green-900">{stats.lowestWeight?.toFixed(1)} kg</p>
                        </div>
                        <div className="bg-purple-50 rounded-xl p-3 text-center">
                            <p className="text-xs text-purple-600 mb-1">Moyenne</p>
                            <p className="font-bold text-purple-900">{stats.averageWeight?.toFixed(1)} kg</p>
                        </div>
                    </div>
                )}

                {/* Boutons d'action */}
                <div className="flex gap-3">
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex-1 bg-primary-500 text-white py-3 rounded-xl font-medium hover:bg-primary-600 transition-colors flex items-center justify-center gap-2"
                    >
                        <Plus size={18} />
                        Ajouter une pesée
                    </button>
                    <button
                        onClick={() => setShowHistory(!showHistory)}
                        className="px-4 py-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                    >
                        {showHistory ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                </div>

                {/* Historique déroulant */}
                <AnimatePresence>
                    {showHistory && entries.length > 0 && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="mt-4 pt-4 border-t border-gray-100 space-y-2 max-h-60 overflow-y-auto">
                                {entries.slice(0, 10).map((entry) => (
                                    <div 
                                        key={entry.id}
                                        className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2 h-2 rounded-full ${
                                                entry.source === 'manual' ? 'bg-blue-500' : 'bg-green-500'
                                            }`} />
                                            <div>
                                                <p className="font-medium text-gray-900">{entry.weight.toFixed(1)} kg</p>
                                                <p className="text-xs text-gray-500">
                                                    {entry.source === 'manual' ? 'Manuel' : entry.source}
                                                    {entry.deviceName && ` • ${entry.deviceName}`}
                                                </p>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-500">
                                            {new Date(entry.measuredAt).toLocaleDateString('fr-FR', {
                                                day: 'numeric',
                                                month: 'short'
                                            })}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Modal d'ajout */}
            <AnimatePresence>
                {showAddModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4"
                        onClick={() => setShowAddModal(false)}
                    >
                        <motion.div
                            initial={{ y: 100, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 100, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-2xl p-6 w-full max-w-md"
                        >
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Ajouter une pesée</h3>
                            
                            {/* Input poids */}
                            <div className="mb-6">
                                <label className="text-sm text-gray-600 mb-2 block">Poids (kg)</label>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setNewWeight((parseFloat(newWeight) - 0.1).toFixed(1))}
                                        className="h-12 w-12 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                                    >
                                        <Minus size={20} />
                                    </button>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={newWeight}
                                        onChange={(e) => setNewWeight(e.target.value)}
                                        className="flex-1 text-center text-3xl font-bold py-3 border border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none bg-white text-gray-900"
                                    />
                                    <button
                                        onClick={() => setNewWeight((parseFloat(newWeight) + 0.1).toFixed(1))}
                                        className="h-12 w-12 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                                    >
                                        <Plus size={20} />
                                    </button>
                                </div>
                            </div>

                            {/* Boutons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 py-3 rounded-xl border border-gray-200 font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={handleAddWeight}
                                    className="flex-1 py-3 rounded-xl bg-primary-500 text-white font-medium hover:bg-primary-600 flex items-center justify-center gap-2"
                                >
                                    <Check size={18} />
                                    Enregistrer
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}


