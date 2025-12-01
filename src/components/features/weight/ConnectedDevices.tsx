'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Bluetooth, Smartphone, Watch, Scale, Wifi, WifiOff,
    RefreshCw, Plus, Check, X, ChevronRight, Heart
} from 'lucide-react';
import { getConnectedDevices, disconnectDevice, addConnectedDevice } from '@/app/actions/weight';

interface Device {
    id: string;
    deviceType: string;
    deviceBrand: string;
    deviceName: string;
    platform: string;
    isConnected: boolean;
    lastSyncAt: Date | null;
}

const DEVICE_ICONS: Record<string, any> = {
    scale: Scale,
    watch: Watch,
    band: Watch,
    phone: Smartphone,
};

const BRAND_INFO: Record<string, { name: string; color: string; logo: string }> = {
    apple: { name: 'Apple', color: 'bg-gray-900', logo: '' },
    google: { name: 'Google Fit', color: 'bg-blue-500', logo: '🏃' },
    withings: { name: 'Withings', color: 'bg-teal-500', logo: '⚖️' },
    xiaomi: { name: 'Xiaomi/Mi Fit', color: 'bg-orange-500', logo: '🏋️' },
    garmin: { name: 'Garmin', color: 'bg-blue-700', logo: '⌚' },
    fitbit: { name: 'Fitbit', color: 'bg-cyan-500', logo: '💪' },
    samsung: { name: 'Samsung Health', color: 'bg-blue-600', logo: '📱' },
};

export function ConnectedDevices() {
    const [devices, setDevices] = useState<Device[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [healthPlatform, setHealthPlatform] = useState<'apple_health' | 'google_fit' | 'none'>('none');

    useEffect(() => {
        loadDevices();
        checkHealthPlatform();
    }, []);

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
            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
        >
            {/* Header */}
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
            </div>

            {/* Liste des appareils */}
            {devices.length > 0 ? (
                <div className="space-y-3 mb-4">
                    {devices.map((device) => {
                        const Icon = getDeviceIcon(device.deviceType);
                        const brand = BRAND_INFO[device.deviceBrand] || { name: device.deviceBrand, color: 'bg-gray-500', logo: '📱' };

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
                                                    • Sync {new Date(device.lastSyncAt).toLocaleDateString('fr-FR')}
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
                            <span className="text-lg">{brand.logo}</span>
                            <span className="text-sm font-medium text-gray-700">{brand.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Info */}
            <div className="mt-4 p-3 bg-blue-50 rounded-xl">
                <p className="text-xs text-blue-700">
                    💡 Connectez votre balance connectée ou votre app santé pour synchroniser automatiquement vos pesées.
                </p>
            </div>
        </motion.div>
    );
}


