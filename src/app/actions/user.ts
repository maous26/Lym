'use server';

import prisma from '@/lib/prisma';
import { UserProfile } from '@/types/user';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// ==========================================
// USER ACTIONS
// ==========================================

export async function getUserProfile(userId?: string): Promise<{ success: boolean; profile?: UserProfile }> {
    try {
        const id = userId;
        if (!id) return { success: false };

        const user = await prisma.user.findUnique({
            where: { id },
            include: {
                // Include related data if needed
            }
        });

        if (!user) return { success: false };

        // Map Prisma user to UserProfile type
        const profile: UserProfile = {
            id: user.id,
            email: user.email || undefined,
            firstName: user.firstName || user.name?.split(' ')[0] || '',
            lastName: user.lastName || user.name?.split(' ').slice(1).join(' ') || '',
            avatarUrl: user.image || undefined,
            birthDate: user.birthDate?.toISOString(),
            gender: user.gender as any,
            height: user.height || undefined,
            weight: user.weight || undefined,
            targetWeight: user.targetWeight || undefined,
            activityLevel: user.activityLevel as any,
            goal: user.goal as any,

            // Goals
            dailyCaloriesTarget: user.dailyCaloriesTarget || undefined,
            proteinTarget: user.proteinTarget || undefined,
            carbsTarget: user.carbsTarget || undefined,
            fatTarget: user.fatTarget || undefined,

            // Diet
            dietType: user.dietType as any,
            allergies: user.allergies ? JSON.parse(user.allergies) : [],
            intolerances: user.intolerances ? JSON.parse(user.intolerances) : [],
            dislikedFoods: user.dislikedFoods ? JSON.parse(user.dislikedFoods) : [],
            likedFoods: user.likedFoods ? JSON.parse(user.likedFoods) : [],

            // Cooking
            cookingSkillLevel: user.cookingSkillLevel as any,
            cookingTimeWeekday: user.cookingTimeWeekday || undefined,
            cookingTimeWeekend: user.cookingTimeWeekend || undefined,
            weeklyBudget: user.weeklyBudget || undefined,

            // Fasting
            fastingSchedule: user.fastingSchedule ? JSON.parse(user.fastingSchedule) : undefined,

            // State
            onboardingCompleted: user.onboardingCompleted,
            subscriptionPlan: user.subscriptionPlan as any,

            createdAt: user.createdAt.toISOString(),
            updatedAt: user.updatedAt.toISOString(),
        };

        return { success: true, profile };
    } catch (error) {
        console.error('Error fetching user profile:', error);
        return { success: false };
    }
}

export async function updateUserProfile(userId: string, updates: Partial<UserProfile>) {
    try {
        // Prepare data for Prisma
        const data: any = { ...updates };

        // Handle JSON fields
        if (updates.allergies) data.allergies = JSON.stringify(updates.allergies);
        if (updates.intolerances) data.intolerances = JSON.stringify(updates.intolerances);
        if (updates.dislikedFoods) data.dislikedFoods = JSON.stringify(updates.dislikedFoods);
        if (updates.likedFoods) data.likedFoods = JSON.stringify(updates.likedFoods);
        if (updates.fastingSchedule) data.fastingSchedule = JSON.stringify(updates.fastingSchedule);

        // Remove fields that shouldn't be updated directly
        delete data.id;
        delete data.email;
        delete data.createdAt;
        delete data.updatedAt;

        const user = await prisma.user.update({
            where: { id: userId },
            data
        });

        return { success: true };
    } catch (error) {
        console.error('Error updating user profile:', error);
        return { success: false, error: "Impossible de mettre à jour le profil" };
    }
}
