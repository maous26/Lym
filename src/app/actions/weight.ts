'use server';

import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

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

export interface WeightEntry {
    id: string;
    userId: string;
    weight: number;
    bodyFat?: number | null;
    muscleMass?: number | null;
    waterPercentage?: number | null;
    bmi?: number | null;
    source: string;
    deviceName?: string | null;
    notes?: string | null;
    measuredAt: Date;
    createdAt: Date;
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

export interface ConnectedDeviceInput {
    userId?: string;
    deviceType: string;
    deviceBrand: string;
    deviceName: string;
    platform: string;
    permissions?: string[];
}

export interface ConnectedDevice {
    id: string;
    userId: string;
    deviceType: string;
    deviceBrand: string;
    deviceName: string | null;
    platform: string;
    isConnected: boolean;
    lastSyncAt: Date | null;
    permissions: string | null;
    createdAt: Date;
}

// ==========================================
// WEIGHT ACTIONS
// ==========================================

/**
 * Ajouter une nouvelle entrée de poids
 */
export async function addWeightEntry(input: WeightEntryInput) {
    try {
        const userId = input.userId;
        if (!userId) throw new Error("User ID is required");

        const entry = await prisma.weightEntry.create({
            data: {
                userId,
                weight: input.weight,
                bodyFat: input.bodyFat,
                muscleMass: input.muscleMass,
                waterPercentage: input.waterPercentage,
                source: input.source || 'manual',
                deviceName: input.deviceName,
                notes: input.notes,
                measuredAt: input.measuredAt || new Date(),
            }
        });

        // Convert Prisma dates to simpler types if needed, but Server Actions support Date
        return { success: true, entry: entry as WeightEntry };
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
        const where: Prisma.WeightEntryWhereInput = { userId };

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

        return { success: true, entries: entries as WeightEntry[] };
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
        const count = await prisma.weightEntry.count({ where: { userId } });

        if (count === 0) {
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

        // Parallel queries for stats
        const [latest, earliest, aggregate] = await Promise.all([
            prisma.weightEntry.findFirst({
                where: { userId },
                orderBy: { measuredAt: 'desc' },
            }),
            prisma.weightEntry.findFirst({
                where: { userId },
                orderBy: { measuredAt: 'asc' },
            }),
            prisma.weightEntry.aggregate({
                where: { userId },
                _min: { weight: true },
                _max: { weight: true },
                _avg: { weight: true },
            })
        ]);

        const currentWeight = latest?.weight || null;
        const startWeight = earliest?.weight || null;
        const lowestWeight = aggregate._min.weight || null;
        const highestWeight = aggregate._max.weight || null;
        const averageWeight = aggregate._avg.weight || null;
        const weightChange = (currentWeight && startWeight) ? currentWeight - startWeight : null;

        return {
            success: true,
            stats: {
                currentWeight,
                startWeight,
                lowestWeight,
                highestWeight,
                weightChange,
                averageWeight: averageWeight ? Math.round(averageWeight * 10) / 10 : null,
                totalEntries: count,
                lastUpdated: latest?.measuredAt || null,
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
export async function deleteWeightEntry(entryId: string, userId: string = 'default') {
    try {
        await prisma.weightEntry.delete({
            where: {
                id: entryId,
                userId: userId // Ensure user owns the entry (security)
            }
        });

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
        if (!weightData.length) {
            return { success: true, synced: 0, message: 'Aucune donnée à synchroniser' };
        }

        let syncedCount = 0;

        // Use transaction to ensure data integrity
        await prisma.$transaction(async (tx) => {
            for (const data of weightData) {
                // Check for duplicates
                const existing = await tx.weightEntry.findFirst({
                    where: {
                        userId,
                        source: platform,
                        measuredAt: data.measuredAt,
                    }
                });

                if (!existing) {
                    await tx.weightEntry.create({
                        data: {
                            userId,
                            weight: data.weight,
                            bodyFat: data.bodyFat,
                            muscleMass: data.muscleMass,
                            source: platform,
                            deviceName: data.deviceName,
                            measuredAt: data.measuredAt,
                        }
                    });
                    syncedCount++;
                }
            }
        });

        return {
            success: true,
            synced: syncedCount,
            message: `${syncedCount} nouvelle(s) mesure(s) synchronisée(s)`
        };
    } catch (error) {
        console.error('Error syncing from health platform:', error);
        return { success: false, synced: 0, error: 'Échec de la synchronisation' };
    }
}

// ==========================================
// CONNECTED DEVICES ACTIONS
// ==========================================

export async function addConnectedDevice(input: ConnectedDeviceInput) {
    try {
        const userId = input.userId;
        if (!userId) throw new Error("User ID is required");

        const device = await prisma.connectedDevice.upsert({
            where: {
                userId_deviceType_deviceBrand: {
                    userId,
                    deviceType: input.deviceType,
                    deviceBrand: input.deviceBrand
                }
            },
            update: {
                deviceName: input.deviceName,
                permissions: input.permissions ? JSON.stringify(input.permissions) : null,
                isConnected: true,
                lastSyncAt: new Date()
            },
            create: {
                userId,
                deviceType: input.deviceType,
                deviceBrand: input.deviceBrand,
                deviceName: input.deviceName,
                platform: input.platform,
                permissions: input.permissions ? JSON.stringify(input.permissions) : null,
                isConnected: true,
                lastSyncAt: new Date()
            }
        });

        return { success: true, device: { ...device, permissions: device.permissions } as ConnectedDevice };
    } catch (error) {
        console.error('Error adding connected device:', error);
        return { success: false, error: 'Échec de l\'ajout de l\'appareil' };
    }
}

export async function getConnectedDevices(userId: string = 'default') {
    try {
        const devices = await prisma.connectedDevice.findMany({
            where: { userId }
        });
        return { success: true, devices: devices as ConnectedDevice[] };
    } catch (error) {
        console.error('Error fetching connected devices:', error);
        return { success: false, devices: [] };
    }
}

export async function disconnectDevice(deviceId: string, userId: string = 'default') {
    try {
        await prisma.connectedDevice.update({
            where: {
                id: deviceId,
                userId // Ensure ownership
            },
            data: { isConnected: false }
        });

        return { success: true };
    } catch (error) {
        console.error('Error disconnecting device:', error);
        return { success: false, error: 'Échec de la déconnexion' };
    }
}
