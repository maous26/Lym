'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// ==========================================
// TYPES
// ==========================================

export interface WeightEntryInput {
    weight: number;
    bodyFat?: number;
    muscleMass?: number;
    waterPercentage?: number;
    source?: string;
    deviceName?: string;
    notes?: string;
    measuredAt?: Date;
    userId?: string;
}

export interface WeightStats {
    currentWeight: number | null;
    startWeight: number | null;
    lowestWeight: number | null;
    highestWeight: number | null;
    weightChange: number | null;
    averageWeight: number | null;
    totalEntries: number;
    lastUpdated: Date | null;
}

// ==========================================
// ACTIONS
// ==========================================

/**
 * Ajouter une nouvelle entrée de poids
 */
export async function addWeightEntry(input: WeightEntryInput) {
    try {
        // Calculer l'IMC si on a la taille
        let bmi: number | undefined;
        
        // On pourrait récupérer la taille depuis le profil utilisateur
        // Pour l'instant on laisse le BMI optionnel
        
        const entry = await prisma.weightEntry.create({
            data: {
                userId: input.userId || 'default',
                weight: input.weight,
                bodyFat: input.bodyFat,
                muscleMass: input.muscleMass,
                waterPercentage: input.waterPercentage,
                bmi: bmi,
                source: input.source || 'manual',
                deviceName: input.deviceName,
                notes: input.notes,
                measuredAt: input.measuredAt || new Date(),
            },
        });
        
        revalidatePath('/weight');
        revalidatePath('/profile');
        
        return { success: true, entry };
    } catch (error) {
        console.error('Error adding weight entry:', error);
        return { success: false, error: 'Échec de l\'enregistrement du poids' };
    }
}

/**
 * Récupérer l'historique du poids
 */
export async function getWeightHistory(
    userId: string = 'default',
    limit: number = 30,
    startDate?: Date,
    endDate?: Date
) {
    try {
        const where: any = { userId };
        
        if (startDate || endDate) {
            where.measuredAt = {};
            if (startDate) where.measuredAt.gte = startDate;
            if (endDate) where.measuredAt.lte = endDate;
        }
        
        const entries = await prisma.weightEntry.findMany({
            where,
            orderBy: { measuredAt: 'desc' },
            take: limit,
        });
        
        return { success: true, entries };
    } catch (error) {
        console.error('Error fetching weight history:', error);
        return { success: false, error: 'Échec de la récupération de l\'historique', entries: [] };
    }
}

/**
 * Récupérer les statistiques de poids
 */
export async function getWeightStats(userId: string = 'default'): Promise<{ success: boolean; stats: WeightStats | null }> {
    try {
        const entries = await prisma.weightEntry.findMany({
            where: { userId },
            orderBy: { measuredAt: 'asc' },
        });
        
        if (entries.length === 0) {
            return {
                success: true,
                stats: {
                    currentWeight: null,
                    startWeight: null,
                    lowestWeight: null,
                    highestWeight: null,
                    weightChange: null,
                    averageWeight: null,
                    totalEntries: 0,
                    lastUpdated: null,
                },
            };
        }
        
        const weights = entries.map(e => e.weight);
        const currentWeight = weights[weights.length - 1];
        const startWeight = weights[0];
        const lowestWeight = Math.min(...weights);
        const highestWeight = Math.max(...weights);
        const averageWeight = weights.reduce((a, b) => a + b, 0) / weights.length;
        const weightChange = currentWeight - startWeight;
        
        return {
            success: true,
            stats: {
                currentWeight,
                startWeight,
                lowestWeight,
                highestWeight,
                weightChange,
                averageWeight: Math.round(averageWeight * 10) / 10,
                totalEntries: entries.length,
                lastUpdated: entries[entries.length - 1].measuredAt,
            },
        };
    } catch (error) {
        console.error('Error fetching weight stats:', error);
        return { success: false, stats: null };
    }
}

/**
 * Supprimer une entrée de poids
 */
export async function deleteWeightEntry(entryId: string) {
    try {
        await prisma.weightEntry.delete({
            where: { id: entryId },
        });
        
        revalidatePath('/weight');
        return { success: true };
    } catch (error) {
        console.error('Error deleting weight entry:', error);
        return { success: false, error: 'Échec de la suppression' };
    }
}

/**
 * Synchroniser les données depuis les wearables (Apple Health / Google Fit)
 */
export async function syncFromHealthPlatform(
    userId: string = 'default',
    platform: 'apple_health' | 'google_fit',
    weightData: Array<{
        weight: number;
        bodyFat?: number;
        muscleMass?: number;
        measuredAt: Date;
        deviceName?: string;
    }>
) {
    try {
        // Éviter les doublons en vérifiant les dates existantes
        const existingDates = await prisma.weightEntry.findMany({
            where: {
                userId,
                source: platform,
            },
            select: { measuredAt: true },
        });
        
        const existingDateSet = new Set(
            existingDates.map(e => e.measuredAt.toISOString().split('T')[0])
        );
        
        // Filtrer les nouvelles entrées
        const newEntries = weightData.filter(
            entry => !existingDateSet.has(entry.measuredAt.toISOString().split('T')[0])
        );
        
        if (newEntries.length === 0) {
            return { success: true, synced: 0, message: 'Aucune nouvelle donnée à synchroniser' };
        }
        
        // Créer les nouvelles entrées
        await prisma.weightEntry.createMany({
            data: newEntries.map(entry => ({
                userId,
                weight: entry.weight,
                bodyFat: entry.bodyFat,
                muscleMass: entry.muscleMass,
                source: platform,
                deviceName: entry.deviceName,
                measuredAt: entry.measuredAt,
            })),
        });
        
        revalidatePath('/weight');
        
        return { 
            success: true, 
            synced: newEntries.length,
            message: `${newEntries.length} nouvelle(s) mesure(s) synchronisée(s)`
        };
    } catch (error) {
        console.error('Error syncing from health platform:', error);
        return { success: false, synced: 0, error: 'Échec de la synchronisation' };
    }
}

// ==========================================
// GESTION DES APPAREILS CONNECTÉS
// ==========================================

export async function addConnectedDevice(input: {
    userId?: string;
    deviceType: string;
    deviceBrand: string;
    deviceName: string;
    platform: string;
    permissions?: string[];
}) {
    try {
        const device = await prisma.connectedDevice.upsert({
            where: {
                userId_deviceType_deviceBrand: {
                    userId: input.userId || 'default',
                    deviceType: input.deviceType,
                    deviceBrand: input.deviceBrand,
                },
            },
            update: {
                deviceName: input.deviceName,
                isConnected: true,
                lastSyncAt: new Date(),
                permissions: input.permissions ? JSON.stringify(input.permissions) : null,
            },
            create: {
                userId: input.userId || 'default',
                deviceType: input.deviceType,
                deviceBrand: input.deviceBrand,
                deviceName: input.deviceName,
                platform: input.platform,
                permissions: input.permissions ? JSON.stringify(input.permissions) : null,
            },
        });
        
        return { success: true, device };
    } catch (error) {
        console.error('Error adding connected device:', error);
        return { success: false, error: 'Échec de l\'ajout de l\'appareil' };
    }
}

export async function getConnectedDevices(userId: string = 'default') {
    try {
        const devices = await prisma.connectedDevice.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
        
        return { success: true, devices };
    } catch (error) {
        console.error('Error fetching connected devices:', error);
        return { success: false, devices: [] };
    }
}

export async function disconnectDevice(deviceId: string) {
    try {
        await prisma.connectedDevice.update({
            where: { id: deviceId },
            data: { isConnected: false },
        });
        
        return { success: true };
    } catch (error) {
        console.error('Error disconnecting device:', error);
        return { success: false, error: 'Échec de la déconnexion' };
    }
}



