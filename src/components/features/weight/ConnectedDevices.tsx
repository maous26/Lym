'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
    Bluetooth, Smartphone, Watch, Scale, Wifi, WifiOff,
    RefreshCw, X, Heart, Check
} from 'lucide-react';
import {
    getConnectedDevices,
    disconnectDevice,
    addConnectedDevice,
    syncFromHealthPlatform
} from '@/app/actions/weight';

interface Device {
    id: string;
    deviceType: string;
    deviceBrand: string;
    deviceName: string;
    platform: string;
    isConnected: boolean;
    lastSyncAt: Date | null;
}

interface SyncResult {
    success: boolean;
    synced: number;
    message?: string;
}

const DEVICE_ICONS: Record<string, any> = {
    scale: Scale,
    watch: Watch,
    band: Watch,
    phone: Smartphone,
};

const BRAND_INFO: Record<string, { name: string; color: string; logo: string }> = {
    apple: { name: 'Apple', color: 'bg-gray-900', logo: '' },
    google: { name: 'Google Fit', color: 'bg-blue-500', logo: '' },
    withings: { name: 'Withings', color: 'bg-teal-500', logo: '' },
    xiaomi: { name: 'Xiaomi/Mi Fit', color: 'bg-orange-500', logo: '' },
    garmin: { name: 'Garmin', color: 'bg-blue-700', logo: '' },
    fitbit: { name: 'Fitbit', color: 'bg-cyan-500', logo: '' },
    samsung: { name: 'Samsung Health', color: 'bg-blue-600', logo: '' },
};

interface ConnectedDevicesProps {
    onSyncComplete?: () => void;
    hideHeader?: boolean;
}

export function ConnectedDevices({ onSyncComplete, hideHeader = false }: ConnectedDevicesProps) {
    const [devices, setDevices] = useState<Device[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
    const [healthPlatform, setHealthPlatform] = useState<'apple_health' | 'google_fit' | 'none'>('none');

    useEffect(() => {
        loadDevices();
        checkHealthPlatform();
    }, []);

    // Auto-sync when devices are loaded and connected
    useEffect(() => {
        const connectedDevices = devices.filter(d => d.isConnected);
        if (connectedDevices.length > 0 && healthPlatform !== 'none') {
            // Auto-sync on first load only if not already syncing
            const lastSync = connectedDevices[0]?.lastSyncAt;
            const hoursSinceSync = lastSync
                ? (Date.now() - new Date(lastSync).getTime()) / (1000 * 60 * 60)
                : Infinity;

            // Auto-sync if last sync was more than 1 hour ago
            if (hoursSinceSync > 1) {
                handleSyncWeightData();
            }
        }
    }, [devices, healthPlatform]);

    const loadDevices = async () => {
        setIsLoading(true);
        const result = await getConnectedDevices();
        if (result.success && result.devices) {
            setDevices(result.devices as Device[]);
        }
        setIsLoading(false);
    };

    const checkHealthPlatform = async () => {
        try {
            const { initHealthService } = await import('@/lib/health/health-service');
            const { platform } = await initHealthService();
            setHealthPlatform(platform);
        } catch {
            setHealthPlatform('none');
        }
    };

    // Synchronize weight data from health platform
    const handleSyncWeightData = useCallback(async () => {
        if (isSyncing || healthPlatform === 'none') return;

        setIsSyncing(true);
        setSyncResult(null);

        try {
            const { initHealthService, requestHealthPermissions, fetchWeightFromHealthPlatform } =
                await import('@/lib/health/health-service');

            const { available, platform } = await initHealthService();

            if (!available) {
                setSyncResult({ success: false, synced: 0, message: 'Plateforme non disponible' });
                return;
            }

            const { granted } = await requestHealthPermissions();
            if (!granted) {
                setSyncResult({ success: false, synced: 0, message: 'Permissions refusées' });
                return;
            }

            // Fetch last 30 days of weight data
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - 30);

            const healthData = await fetchWeightFromHealthPlatform(startDate);

            if (healthData.length > 0) {
                const result = await syncFromHealthPlatform(
                    'default',
                    platform as 'apple_health' | 'google_fit',
                    healthData
                );

                setSyncResult({
                    success: result.success,
                    synced: result.synced,
                    message: result.message || result.error
                });

                // Reload devices to update lastSyncAt
                loadDevices();

                // Notify parent component to refresh weight data
                if (result.success && onSyncComplete) {
                    onSyncComplete();
                }
            } else {
                setSyncResult({ success: true, synced: 0, message: 'Aucune nouvelle donnée' });
            }
        } catch (error) {
            console.error('Erreur sync:', error);
            setSyncResult({ success: false, synced: 0, message: 'Erreur de synchronisation' });
        } finally {
            setIsSyncing(false);
            // Clear sync result after 5 seconds
            setTimeout(() => setSyncResult(null), 5000);
        }
    }, [isSyncing, healthPlatform, onSyncComplete]);

    const handleConnectHealthPlatform = async () => {
        if (healthPlatform === 'none') {
            alert('Aucune plateforme de santé disponible sur cet appareil.');
            return;
        }

        setIsSyncing(true);
        try {
            const { requestHealthPermissions } = await import('@/lib/health/health-service');
            const { granted } = await requestHealthPermissions();

            if (granted) {
                await addConnectedDevice({
                    deviceType: 'phone',
                    deviceBrand: healthPlatform === 'apple_health' ? 'apple' : 'google',
                    deviceName: healthPlatform === 'apple_health' ? 'Apple Santé' : 'Google Fit',
                    platform: healthPlatform,
                    permissions: ['weight', 'body_fat'],
                });
                loadDevices();
                alert('Connexion réussie !');
            } else {
                alert('Permission refusée. Veuillez autoriser l\'accès dans les paramètres.');
            }
        } catch (error) {
            console.error('Erreur connexion:', error);
            alert('Erreur lors de la connexion');
        } finally {
            setIsSyncing(false);
        }
    };

    const handleDisconnect = async (deviceId: string) => {
        if (confirm('Déconnecter cet appareil ?')) {
            await disconnectDevice(deviceId);
            loadDevices();
        }
    };

    const getDeviceIcon = (type: string) => {
        const Icon = DEVICE_ICONS[type] || Bluetooth;
        return Icon;
    };

    if (isLoading) {
        return (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-20 bg-gray-100 rounded"></div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={hideHeader ? "p-5" : "bg-white rounded-2xl p-5 shadow-sm border border-gray-100"}
        >
            {/* Header - hidden when used in collapsible container */}
            {!hideHeader && (
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                            <Bluetooth className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">Appareils connectés</h3>
                            <p className="text-xs text-gray-500">
                                {devices.filter(d => d.isConnected).length} appareil(s) actif(s)
                            </p>
                        </div>
                    </div>
                    {/* Sync button */}
                    {devices.filter(d => d.isConnected).length > 0 && (
                        <button
                            onClick={handleSyncWeightData}
                            disabled={isSyncing}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
                            title="Synchroniser les pesées"
                        >
                            <RefreshCw className={`h-5 w-5 ${isSyncing ? 'animate-spin text-purple-500' : 'text-gray-500'}`} />
                        </button>
                    )}
                </div>
            )}

            {/* Sync Result Banner */}
            {syncResult && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`mb-4 p-3 rounded-xl flex items-center gap-2 ${
                        syncResult.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                    }`}
                >
                    {syncResult.success ? (
                        <Check className="h-5 w-5" />
                    ) : (
                        <X className="h-5 w-5" />
                    )}
                    <span className="text-sm font-medium">
                        {syncResult.message}
                        {syncResult.synced > 0 && ` (${syncResult.synced} pesée(s))`}
                    </span>
                </motion.div>
            )}

            {/* Liste des appareils */}
            {devices.length > 0 ? (
                <div className="space-y-3 mb-4">
                    {devices.map((device) => {
                        const Icon = getDeviceIcon(device.deviceType);
                        const brand = BRAND_INFO[device.deviceBrand] || { name: device.deviceBrand, color: 'bg-gray-500', logo: '' };

                        return (
                            <div
                                key={device.id}
                                className={`flex items-center justify-between p-3 rounded-xl border ${
                                    device.isConnected ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`h-10 w-10 rounded-lg ${brand.color} flex items-center justify-center text-white`}>
                                        <Icon size={20} />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">{device.deviceName}</p>
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            {device.isConnected ? (
                                                <span className="flex items-center gap-1 text-green-600">
                                                    <Wifi size={12} /> Connecté
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-gray-400">
                                                    <WifiOff size={12} /> Déconnecté
                                                </span>
                                            )}
                                            {device.lastSyncAt && (
                                                <span>
                                                    Sync {new Date(device.lastSyncAt).toLocaleDateString('fr-FR')}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDisconnect(device.id)}
                                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-6 bg-gray-50 rounded-xl mb-4">
                    <Bluetooth className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">Aucun appareil connecté</p>
                </div>
            )}

            {/* Bouton de connexion principal */}
            {healthPlatform !== 'none' && (
                <button
                    onClick={handleConnectHealthPlatform}
                    disabled={isSyncing}
                    className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 text-white py-3 rounded-xl font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    {isSyncing ? (
                        <RefreshCw className="h-5 w-5 animate-spin" />
                    ) : (
                        <Heart className="h-5 w-5" />
                    )}
                    Connecter {healthPlatform === 'apple_health' ? 'Apple Santé' : 'Google Fit'}
                </button>
            )}

            {/* Options de connexion manuelle */}
            <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-3">Autres options de connexion</p>
                <div className="grid grid-cols-2 gap-2">
                    {Object.entries(BRAND_INFO).slice(2).map(([key, brand]) => (
                        <button
                            key={key}
                            onClick={() => {
                                alert(`L'intégration ${brand.name} sera disponible prochainement !`);
                            }}
                            className="flex items-center gap-2 p-3 rounded-xl border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors"
                        >
                            <span className="text-sm font-medium text-gray-700">{brand.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Info */}
            <div className="mt-4 p-3 bg-blue-50 rounded-xl">
                <p className="text-xs text-blue-700">
                    Connectez votre balance connectée ou votre app santé pour synchroniser automatiquement vos pesées.
                </p>
            </div>
        </motion.div>
    );
}
