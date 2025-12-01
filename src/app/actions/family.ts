'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import type { 
    Family, 
    FamilyMember, 
    NutritionalNeeds,
    AgeCategory 
} from '@/types/family';
import { getAge, getAgeCategory } from '@/types/family';

// ==========================================
// GESTION FAMILLE - CRUD
// ==========================================

/**
 * Créer une nouvelle famille
 */
export async function createFamily(data: {
    name: string;
    adminId: string;
    subscriptionTier?: 'starter' | 'plus' | 'premium';
    weeklyBudget?: number;
}) {
    try {
        // Générer un code d'invitation unique
        const inviteCode = generateInviteCode();
        
        const family = await prisma.family.create({
            data: {
                name: data.name,
                adminId: data.adminId,
                inviteCode,
                subscriptionTier: data.subscriptionTier || 'starter',
                weeklyBudget: data.weeklyBudget,
                maxMembers: data.subscriptionTier === 'starter' ? 3 : data.subscriptionTier === 'plus' ? 5 : 6,
            },
        });

        revalidatePath('/family');
        return { success: true, family };
    } catch (error) {
        console.error('Error creating family:', error);
        return { success: false, error: 'Impossible de créer la famille' };
    }
}

/**
 * Récupérer une famille par ID
 */
export async function getFamily(familyId: string) {
    try {
        const family = await prisma.family.findUnique({
            where: { id: familyId },
            include: {
                members: {
                    where: { isActive: true },
                    orderBy: { createdAt: 'asc' },
                },
            },
        });

        if (!family) {
            return { success: false, error: 'Famille non trouvée' };
        }

        return { success: true, family };
    } catch (error) {
        console.error('Error getting family:', error);
        return { success: false, error: 'Erreur lors de la récupération' };
    }
}

/**
 * Mettre à jour les informations de la famille
 */
export async function updateFamily(familyId: string, data: {
    name?: string;
    weeklyBudget?: number;
    sharedGoals?: string[];
}) {
    try {
        const family = await prisma.family.update({
            where: { id: familyId },
            data: {
                ...data,
                sharedGoals: data.sharedGoals ? JSON.stringify(data.sharedGoals) : undefined,
            },
        });

        revalidatePath('/family');
        return { success: true, family };
    } catch (error) {
        console.error('Error updating family:', error);
        return { success: false, error: 'Impossible de mettre à jour' };
    }
}

// ==========================================
// GESTION MEMBRES
// ==========================================

/**
 * Ajouter un membre à la famille
 */
export async function addFamilyMember(data: {
    familyId: string;
    userId: string;
    firstName: string;
    birthDate: Date;
    gender: 'male' | 'female' | 'other';
    role: 'admin' | 'parent' | 'child' | 'teen' | 'senior';
    height?: number;
    weight?: number;
    activityLevel?: 'sedentary' | 'light' | 'moderate' | 'active' | 'athlete';
    dietType?: string;
    allergies?: string[];
    intolerances?: string[];
}) {
    try {
        // Vérifier la limite de membres
        const family = await prisma.family.findUnique({
            where: { id: data.familyId },
            include: { _count: { select: { members: true } } },
        });

        if (!family) {
            return { success: false, error: 'Famille non trouvée' };
        }

        if (family._count.members >= family.maxMembers) {
            return { 
                success: false, 
                error: `Limite de ${family.maxMembers} membres atteinte. Passez à un plan supérieur.` 
            };
        }

        // Calculer les besoins nutritionnels
        const needs = calculateNutritionalNeeds({
            birthDate: data.birthDate,
            gender: data.gender,
            weight: data.weight || 70,
            height: data.height || 170,
            activityLevel: data.activityLevel || 'moderate',
        });

        const member = await prisma.familyMember.create({
            data: {
                familyId: data.familyId,
                userId: data.userId,
                firstName: data.firstName,
                birthDate: data.birthDate,
                gender: data.gender,
                role: data.role,
                height: data.height,
                weight: data.weight,
                activityLevel: data.activityLevel || 'moderate',
                dietType: data.dietType || 'omnivore',
                allergies: data.allergies ? JSON.stringify(data.allergies) : null,
                intolerances: data.intolerances ? JSON.stringify(data.intolerances) : null,
                targetCalories: needs.calories,
                targetProteins: needs.proteins,
                targetCarbs: needs.carbs,
                targetFats: needs.fats,
            },
        });

        revalidatePath(`/family/${data.familyId}`);
        return { success: true, member };
    } catch (error) {
        console.error('Error adding family member:', error);
        return { success: false, error: 'Impossible d\'ajouter le membre' };
    }
}

/**
 * Mettre à jour un membre
 */
export async function updateFamilyMember(memberId: string, data: Partial<{
    firstName: string;
    nickname: string;
    avatarUrl: string;
    height: number;
    weight: number;
    targetWeight: number;
    activityLevel: string;
    primaryGoal: string;
    allergies: string[];
    intolerances: string[];
    medicalConditions: string[];
    dietType: string;
    likedFoods: string[];
    dislikedFoods: string[];
}>) {
    try {
        // Récupérer le membre pour recalculer les besoins si nécessaire
        const currentMember = await prisma.familyMember.findUnique({
            where: { id: memberId },
        });

        if (!currentMember) {
            return { success: false, error: 'Membre non trouvé' };
        }

        let updatedData: any = { ...data };

        // Recalculer besoins nutritionnels si poids/taille/activité changent
        if (data.weight || data.height || data.activityLevel) {
            const needs = calculateNutritionalNeeds({
                birthDate: currentMember.birthDate,
                gender: currentMember.gender as 'male' | 'female' | 'other',
                weight: data.weight || currentMember.weight || 70,
                height: data.height || currentMember.height || 170,
                activityLevel: (data.activityLevel || currentMember.activityLevel) as any,
            });

            updatedData.targetCalories = needs.calories;
            updatedData.targetProteins = needs.proteins;
            updatedData.targetCarbs = needs.carbs;
            updatedData.targetFats = needs.fats;
        }

        // Convertir arrays en JSON
        if (data.allergies) updatedData.allergies = JSON.stringify(data.allergies);
        if (data.intolerances) updatedData.intolerances = JSON.stringify(data.intolerances);
        if (data.medicalConditions) updatedData.medicalConditions = JSON.stringify(data.medicalConditions);
        if (data.likedFoods) updatedData.likedFoods = JSON.stringify(data.likedFoods);
        if (data.dislikedFoods) updatedData.dislikedFoods = JSON.stringify(data.dislikedFoods);

        const member = await prisma.familyMember.update({
            where: { id: memberId },
            data: updatedData,
        });

        revalidatePath(`/family/${currentMember.familyId}`);
        return { success: true, member };
    } catch (error) {
        console.error('Error updating family member:', error);
        return { success: false, error: 'Impossible de mettre à jour' };
    }
}

/**
 * Supprimer (désactiver) un membre
 */
export async function removeFamilyMember(memberId: string) {
    try {
        const member = await prisma.familyMember.update({
            where: { id: memberId },
            data: { isActive: false },
        });

        revalidatePath(`/family/${member.familyId}`);
        return { success: true };
    } catch (error) {
        console.error('Error removing family member:', error);
        return { success: false, error: 'Impossible de supprimer' };
    }
}

// ==========================================
// INVITATIONS
// ==========================================

/**
 * Créer une invitation
 */
export async function createFamilyInvitation(data: {
    familyId: string;
    email: string;
    firstName?: string;
    role?: string;
    sentBy: string;
    message?: string;
}) {
    try {
        // Générer token unique
        const token = generateInvitationToken();
        
        // Expiration dans 7 jours
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        const invitation = await prisma.familyInvitation.create({
            data: {
                familyId: data.familyId,
                email: data.email,
                firstName: data.firstName,
                role: data.role || 'member',
                token,
                expiresAt,
                sentBy: data.sentBy,
                message: data.message,
            },
        });

        // TODO: Envoyer l'email d'invitation
        // await sendInvitationEmail(invitation);

        return { success: true, invitation, inviteLink: `/family/join/${token}` };
    } catch (error) {
        console.error('Error creating invitation:', error);
        return { success: false, error: 'Impossible de créer l\'invitation' };
    }
}

/**
 * Accepter une invitation
 */
export async function acceptFamilyInvitation(token: string, userId: string) {
    try {
        const invitation = await prisma.familyInvitation.findUnique({
            where: { token },
            include: { family: true },
        });

        if (!invitation) {
            return { success: false, error: 'Invitation non trouvée' };
        }

        if (invitation.status !== 'pending') {
            return { success: false, error: 'Invitation déjà utilisée' };
        }

        if (invitation.expiresAt < new Date()) {
            await prisma.familyInvitation.update({
                where: { id: invitation.id },
                data: { status: 'expired' },
            });
            return { success: false, error: 'Invitation expirée' };
        }

        // Marquer comme acceptée
        await prisma.familyInvitation.update({
            where: { id: invitation.id },
            data: {
                status: 'accepted',
                acceptedAt: new Date(),
            },
        });

        // Incrémenter le compteur d'invitations
        await prisma.family.update({
            where: { id: invitation.familyId },
            data: { invitesUsed: { increment: 1 } },
        });

        return { 
            success: true, 
            familyId: invitation.familyId,
            email: invitation.email,
            role: invitation.role,
        };
    } catch (error) {
        console.error('Error accepting invitation:', error);
        return { success: false, error: 'Impossible d\'accepter l\'invitation' };
    }
}

/**
 * Rejoindre une famille avec code
 */
export async function joinFamilyWithCode(inviteCode: string, userId: string) {
    try {
        const family = await prisma.family.findUnique({
            where: { inviteCode },
            include: { _count: { select: { members: true } } },
        });

        if (!family) {
            return { success: false, error: 'Code d\'invitation invalide' };
        }

        if (!family.isActive) {
            return { success: false, error: 'Cette famille n\'est plus active' };
        }

        if (family._count.members >= family.maxMembers) {
            return { success: false, error: 'Cette famille est complète' };
        }

        // Vérifier si l'utilisateur n'est pas déjà membre
        const existing = await prisma.familyMember.findFirst({
            where: {
                familyId: family.id,
                userId,
                isActive: true,
            },
        });

        if (existing) {
            return { success: false, error: 'Vous êtes déjà membre de cette famille' };
        }

        return { success: true, familyId: family.id, familyName: family.name };
    } catch (error) {
        console.error('Error joining family:', error);
        return { success: false, error: 'Impossible de rejoindre la famille' };
    }
}

// ==========================================
// CALCULS NUTRITIONNELS (MÉDICAL)
// ==========================================

/**
 * Calculer les besoins nutritionnels selon l'âge, sexe, activité
 * Basé sur les recommandations ANSES (France)
 */
export async function calculateNutritionalNeeds(params: {
    birthDate: Date;
    gender: 'male' | 'female' | 'other';
    weight: number;
    height: number;
    activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'athlete';
}): Promise<NutritionalNeeds> {
    const age = getAge(params.birthDate);
    const ageCategory = getAgeCategory(params.birthDate);
    const { gender, weight, height, activityLevel } = params;

    // Calcul métabolisme de base (Mifflin-St Jeor)
    let bmr: number;
    if (gender === 'male') {
        bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
        bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }

    // Facteur d'activité
    const activityFactors = {
        sedentary: 1.2,
        light: 1.375,
        moderate: 1.55,
        active: 1.725,
        athlete: 1.9,
    };

    let calories = Math.round(bmr * activityFactors[activityLevel]);

    // Ajustements selon l'âge
    if (ageCategory === 'child') {
        // Enfants : besoins plus élevés pour la croissance
        calories = Math.min(calories, 1400 + (age - 3) * 100);
    } else if (ageCategory === 'teen') {
        // Adolescents : pic de croissance
        calories = gender === 'male' ? 
            2200 + (age - 11) * 100 : 
            1800 + (age - 11) * 80;
    } else if (ageCategory === 'senior') {
        // Seniors : métabolisme ralenti
        calories = Math.round(calories * 0.9);
    }

    // Répartition macronutriments
    const proteins = calculateProteins(weight, ageCategory);
    const fats = Math.round((calories * 0.30) / 9); // 30% des calories
    const carbs = Math.round((calories - (proteins * 4) - (fats * 9)) / 4);

    // Micronutriments clés (ANSES)
    const calcium = calculateCalcium(age, gender);
    const iron = calculateIron(age, gender);
    const vitaminD = ageCategory === 'infant' || ageCategory === 'senior' ? 800 : 400;
    const vitaminC = 110; // mg
    const vitaminB12 = 2.4; // µg
    const zinc = gender === 'male' ? 11 : 8; // mg
    const omega3 = 250; // mg DHA+EPA

    return {
        age,
        ageCategory,
        gender,
        weight,
        height,
        activityLevel,
        calories,
        proteins,
        carbs,
        fats,
        fiber: Math.round(calories / 1000 * 14), // 14g pour 1000 kcal
        calcium,
        iron,
        vitaminD,
        vitaminC,
        vitaminB12,
        zinc,
        omega3,
    };
}

function calculateProteins(weight: number, ageCategory: AgeCategory): number {
    const proteinPerKg = {
        infant: 1.2,
        child: 1.0,
        teen: 0.9,
        adult: 0.8,
        senior: 1.0, // Prévention sarcopénie
    };
    return Math.round(weight * proteinPerKg[ageCategory]);
}

function calculateCalcium(age: number, gender: string): number {
    if (age < 4) return 500;
    if (age < 7) return 700;
    if (age < 11) return 900;
    if (age < 18) return 1200; // Pic masse osseuse
    if (age < 65) return 950;
    return 1200; // Prévention ostéoporose
}

function calculateIron(age: number, gender: string): number {
    if (age < 7) return 7;
    if (age < 11) return 8;
    if (gender === 'female' && age >= 11 && age < 50) {
        return 16; // Menstruations
    }
    return gender === 'male' ? 11 : 8;
}

// ==========================================
// UTILITAIRES
// ==========================================

function generateInviteCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

function generateInvitationToken(): string {
    return `invite_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}



