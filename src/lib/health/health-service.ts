/**
 * Service de gestion des données de santé (Apple Health / Google Fit)
 * 
 * Ce service utilise le plugin Capacitor Health pour accéder aux données
 * des plateformes de santé natives.
 * 
 * Note: Le plugin @capacitor-community/health doit être installé séparément
 * pour activer l'intégration avec les plateformes de santé.
 */

// Types pour les données de santé
export interface HealthWeightData {
    weight: number;       // en kg
    bodyFat?: number;     // en %
    muscleMass?: number;  // en %
    measuredAt: Date;
    deviceName?: string;
    source: 'apple_health' | 'google_fit' | 'manual';
}

export interface HealthPermission {
    read: boolean;
    write: boolean;
}

export interface HealthPermissions {
    weight: HealthPermission;
    bodyFat: HealthPermission;
    height: HealthPermission;
}

// État de connexion aux plateformes de santé
let isHealthKitAvailable = false;
let isGoogleFitAvailable = false;
let healthPlugin: any = null;
let currentPlatform: 'ios' | 'android' | 'web' = 'web';

/**
 * Charger dynamiquement le plugin Health si disponible
 */
async function loadHealthPlugin(): Promise<any | null> {
    try {
        // Utiliser une variable pour éviter l'analyse statique du module
        const moduleName = '@capacitor-community/health';
        const module = await import(/* webpackIgnore: true */ moduleName);
        return module.Health || module.default;
    } catch (e) {
        // Plugin non installé - c'est normal en développement web
        console.log('ℹ️ Plugin Health non installé (normal en mode web)');
        return null;
    }
}

/**
 * Initialiser le service de santé
 */
export async function initHealthService(): Promise<{ 
    available: boolean; 
    platform: 'apple_health' | 'google_fit' | 'none';
}> {
    try {
        // Vérifier si on est sur mobile
        if (typeof window === 'undefined') {
            return { available: false, platform: 'none' };
        }

        // Essayer de charger Capacitor
        let platform: string = 'web';
        try {
            const { Capacitor } = await import('@capacitor/core');
            platform = Capacitor.getPlatform();
            currentPlatform = platform as 'ios' | 'android' | 'web';
        } catch {
            console.log('ℹ️ Capacitor non disponible');
            return { available: false, platform: 'none' };
        }

        // Si on est sur le web, pas de plateforme de santé
        if (platform === 'web') {
            return { available: false, platform: 'none' };
        }

        // Essayer de charger le plugin Health
        healthPlugin = await loadHealthPlugin();
        
        if (!healthPlugin) {
            return { available: false, platform: 'none' };
        }

        if (platform === 'ios') {
            try {
                isHealthKitAvailable = await healthPlugin.isAvailable();
                if (isHealthKitAvailable) {
                    console.log('✅ Apple HealthKit disponible');
                    return { available: true, platform: 'apple_health' };
                }
            } catch (e) {
                console.log('⚠️ HealthKit non disponible:', e);
            }
        } else if (platform === 'android') {
            try {
                isGoogleFitAvailable = await healthPlugin.isAvailable();
                if (isGoogleFitAvailable) {
                    console.log('✅ Google Fit disponible');
                    return { available: true, platform: 'google_fit' };
                }
            } catch (e) {
                console.log('⚠️ Google Fit non disponible:', e);
            }
        }

        return { available: false, platform: 'none' };
    } catch (error) {
        console.error('Erreur initialisation service santé:', error);
        return { available: false, platform: 'none' };
    }
}

/**
 * Demander les permissions d'accès aux données de santé
 */
export async function requestHealthPermissions(): Promise<{ granted: boolean; permissions?: HealthPermissions }> {
    if (!healthPlugin) {
        console.warn('Plugin santé non initialisé');
        return { granted: false };
    }

    try {
        const result = await healthPlugin.requestAuthorization({
            read: ['weight', 'body_fat', 'height'],
            write: ['weight'],
        });

        return { 
            granted: result.authorized,
            permissions: {
                weight: { read: true, write: true },
                bodyFat: { read: true, write: false },
                height: { read: true, write: false },
            }
        };
    } catch (error) {
        console.error('Erreur demande permissions:', error);
        return { granted: false };
    }
}

/**
 * Récupérer l'historique du poids depuis la plateforme de santé
 */
export async function fetchWeightFromHealthPlatform(
    startDate: Date,
    endDate: Date = new Date()
): Promise<HealthWeightData[]> {
    if (!healthPlugin) {
        console.warn('Plugin santé non initialisé');
        return [];
    }

    try {
        const weightData = await healthPlugin.queryAggregated({
            sampleType: 'weight',
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            bucket: 'day',
        });

        const bodyFatData = await healthPlugin.queryAggregated({
            sampleType: 'body_fat',
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            bucket: 'day',
        }).catch(() => []);

        // Fusionner les données
        const results: HealthWeightData[] = weightData.map((entry: any) => {
            const date = new Date(entry.startDate);
            const bodyFat = bodyFatData.find((bf: any) => 
                new Date(bf.startDate).toDateString() === date.toDateString()
            );

            return {
                weight: entry.value,
                bodyFat: bodyFat?.value,
                measuredAt: date,
                source: isHealthKitAvailable ? 'apple_health' : 'google_fit',
                deviceName: entry.sourceName || undefined,
            };
        });

        return results;
    } catch (error) {
        console.error('Erreur récupération poids:', error);
        return [];
    }
}

/**
 * Écrire une mesure de poids dans la plateforme de santé
 */
export async function writeWeightToHealthPlatform(weight: number, date: Date = new Date()): Promise<boolean> {
    if (!healthPlugin) {
        console.warn('Plugin santé non initialisé');
        return false;
    }

    try {
        await healthPlugin.store({
            sampleType: 'weight',
            value: weight,
            startDate: date.toISOString(),
            endDate: date.toISOString(),
        });

        console.log('✅ Poids enregistré dans la plateforme de santé');
        return true;
    } catch (error) {
        console.error('Erreur écriture poids:', error);
        return false;
    }
}

/**
 * Vérifier si le service de santé est disponible
 */
export function isHealthServiceAvailable(): boolean {
    return isHealthKitAvailable || isGoogleFitAvailable;
}

/**
 * Obtenir le nom de la plateforme de santé
 */
export function getHealthPlatformName(): string {
    if (isHealthKitAvailable) return 'Apple Santé';
    if (isGoogleFitAvailable) return 'Google Fit';
    return 'Non disponible';
}

