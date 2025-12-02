'use server';

import { prisma } from '@/lib/prisma';
import { models } from '@/lib/ai/config';
import { getAge, getAgeCategory, type AgeCategory } from '@/types/family';
import type { FamilyNotification } from '@/types/family';

// ==========================================
// COACH IA FAMILIAL - PERSONNALISÉ PAR MEMBRE
// ==========================================

/**
 * Générer des insights nutritionnels pour toute la famille
 */
export async function generateFamilyInsights(familyId: string) {
    try {
        // 1. Récupérer la famille et ses membres
        const family = await prisma.family.findUnique({
            where: { id: familyId },
            include: {
                members: {
                    where: { isActive: true },
                },
            },
        });

        if (!family) {
            return { success: false, error: 'Famille non trouvée' };
        }

        // 2. Récupérer les logs alimentaires récents (7 derniers jours)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const mealLogs = await prisma.familyMemberMealLog.findMany({
            where: {
                memberId: { in: family.members.map(m => m.id) },
                mealDate: { gte: sevenDaysAgo },
            },
            orderBy: { mealDate: 'desc' },
        });

        // 3. Analyser par membre
        const insights: FamilyNotification[] = [];

        for (const member of family.members) {
            const memberLogs = mealLogs.filter(log => log.memberId === member.id);
            const memberInsights = await generateMemberInsights(member, memberLogs);
            insights.push(...memberInsights);
        }

        // 4. Sauvegarder les notifications
        if (insights.length > 0) {
            await prisma.familyNotification.createMany({
                data: insights.map(insight => ({
                    familyId,
                    memberId: insight.memberId,
                    type: insight.type,
                    title: insight.title,
                    message: insight.message,
                    icon: insight.icon,
                    priority: insight.priority,
                    category: insight.category,
                    actionUrl: insight.actionUrl,
                    actionLabel: insight.actionLabel,
                })),
            });
        }

        return { success: true, insights, count: insights.length };
    } catch (error) {
        console.error('Error generating family insights:', error);
        return { success: false, error: 'Erreur lors de l\'analyse' };
    }
}

/**
 * Générer des insights pour un membre spécifique
 */
async function generateMemberInsights(member: any, mealLogs: any[]): Promise<FamilyNotification[]> {
    const insights: FamilyNotification[] = [];
    const age = getAge(member.birthDate);
    const ageCategory = getAgeCategory(member.birthDate);

    // Calculer moyennes de la semaine
    const avgCalories = mealLogs.length > 0
        ? mealLogs.reduce((sum, log) => sum + log.calories, 0) / mealLogs.length
        : 0;
    const avgProteins = mealLogs.length > 0
        ? mealLogs.reduce((sum, log) => sum + log.proteins, 0) / mealLogs.length
        : 0;

    // INSIGHTS PAR CATÉGORIE D'ÂGE

    if (ageCategory === 'child') {
        // 👶 ENFANTS (3-10 ans)
        
        // Calcium (ossification)
        const avgCalcium = mealLogs.reduce((sum, log) => sum + (log.calcium || 0), 0) / (mealLogs.length || 1);
        if (avgCalcium < 700) {
            insights.push({
                id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                familyId: '',
                memberId: member.id,
                type: 'alert',
                title: `Calcium pour ${member.firstName}`,
                message: `${member.firstName} pourrait manquer de calcium. Ajoutez plus de produits laitiers (lait, yaourt, fromage).`,
                icon: '🥛',
                priority: 'high',
                category: 'nutrition',
                actionUrl: '/recipes?filter=calcium',
                actionLabel: 'Recettes riches en calcium',
                isRead: false,
                createdAt: new Date(),
            });
        }

        // Légumes
        if (mealLogs.filter(log => log.comment?.includes('légumes')).length < 2) {
            insights.push({
                id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                familyId: '',
                memberId: member.id,
                type: 'tip',
                title: `Légumes pour ${member.firstName}`,
                message: `Essayez de rendre les légumes plus fun ! Idées : bâtonnets colorés avec sauce, légumes cachés dans les recettes.`,
                icon: '🥦',
                priority: 'normal',
                category: 'nutrition',
                isRead: false,
                createdAt: new Date(),
            });
        }
    } else if (ageCategory === 'teen') {
        // 🧒 ADOLESCENTS (11-17 ans)
        
        // Fer (surtout filles)
        if (member.gender === 'female') {
            const avgIron = mealLogs.reduce((sum, log) => sum + (log.iron || 0), 0) / (mealLogs.length || 1);
            if (avgIron < 14) {
                insights.push({
                    id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    familyId: '',
                    memberId: member.id,
                    type: 'alert',
                    title: `Fer pour ${member.firstName}`,
                    message: `${member.firstName} pourrait manquer de fer. Pensez aux viandes rouges, lentilles, épinards.`,
                    icon: '🥩',
                    priority: 'high',
                    category: 'nutrition',
                    isRead: false,
                    createdAt: new Date(),
                });
            }
        }

        // Protéines pour croissance
        if (avgProteins < (member.targetProteins || 60) * 0.8) {
            insights.push({
                id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                familyId: '',
                memberId: member.id,
                type: 'tip',
                title: `Protéines pour ${member.firstName}`,
                message: `En pleine croissance, ${member.firstName} a besoin de protéines. Pensez aux œufs, poulet, poisson.`,
                icon: '🍳',
                priority: 'normal',
                category: 'nutrition',
                isRead: false,
                createdAt: new Date(),
            });
        }
    } else if (ageCategory === 'adult') {
        // 👨 ADULTES
        
        // Objectif poids
        if (member.primaryGoal === 'weight_loss' && member.targetWeight) {
            const calorieDeficit = (member.targetCalories || 2000) - avgCalories;
            if (calorieDeficit < -200) {
                insights.push({
                    id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    familyId: '',
                    memberId: member.id,
                    type: 'alert',
                    title: 'Calories trop basses',
                    message: `${member.firstName}, vous mangez trop peu (${Math.round(avgCalories)}kcal/j). Risque de carence.`,
                    icon: '⚠️',
                    priority: 'high',
                    category: 'nutrition',
                    isRead: false,
                    createdAt: new Date(),
                });
            }
        }
    } else if (ageCategory === 'senior') {
        // 👴 SENIORS (65+)
        
        // Protéines (sarcopénie)
        const proteinPerKg = avgProteins / (member.weight || 70);
        if (proteinPerKg < 1.0) {
            insights.push({
                id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                familyId: '',
                memberId: member.id,
                type: 'alert',
                title: `Protéines pour ${member.firstName}`,
                message: `${member.firstName} devrait consommer plus de protéines (1g/kg) pour prévenir la perte musculaire.`,
                icon: '💪',
                priority: 'high',
                category: 'health',
                actionUrl: '/recipes?filter=high_protein',
                actionLabel: 'Recettes protéinées',
                isRead: false,
                createdAt: new Date(),
            });
        }

        // Hydratation
        insights.push({
            id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            familyId: '',
            memberId: member.id,
            type: 'reminder',
            title: 'Hydratation',
            message: `${member.firstName}, pensez à boire 1,5L d'eau aujourd'hui 💧`,
            icon: '💧',
            priority: 'normal',
            category: 'health',
            isRead: false,
            createdAt: new Date(),
        });
    }

    return insights;
}

/**
 * Générer un message coach personnalisé
 */
export async function generatePersonalizedCoachMessage(memberId: string) {
    try {
        const member = await prisma.familyMember.findUnique({
            where: { id: memberId },
        });

        if (!member) {
            return { success: false, error: 'Membre non trouvé' };
        }

        const age = getAge(member.birthDate);
        const ageCategory = getAgeCategory(member.birthDate);

        // Adapter le ton selon l'âge
        const tone = ageCategory === 'child' ? 'ludique et encourageant, avec emojis' :
                    ageCategory === 'teen' ? 'cool et motivant, sans infantiliser' :
                    ageCategory === 'adult' ? 'professionnel et bienveillant' :
                    'respectueux et rassurant';

        const model = models.flash;

        const prompt = `Tu es un coach nutrition expert qui s'adresse à ${member.firstName}, ${age} ans (${ageCategory}).

Profil :
- Objectif : ${member.primaryGoal || 'santé'}
- Régime : ${member.dietType}
- Activité : ${member.activityLevel}
${member.allergies ? `- Allergies : ${member.allergies}` : ''}

Génère un message de coaching personnalisé, ton ${tone}.

Le message doit :
- Être court (2-3 phrases)
- Contenir un conseil nutritionnel actionnable
- Être motivant et positif
- Adapter le vocabulaire à l'âge

Réponds en français, directement le message (pas de JSON).`;

        const result = await model.generateContent(prompt);
        const response = result.response;
        const message = response.candidates?.[0]?.content?.parts?.[0]?.text || '';

        return {
            success: true,
            message: message.trim(),
        };
    } catch (error) {
        console.error('Error generating coach message:', error);
        return { success: false, error: 'Erreur lors de la génération' };
    }
}

/**
 * Récupérer les notifications non lues d'un membre
 */
export async function getFamilyNotifications(params: {
    familyId?: string;
    memberId?: string;
    unreadOnly?: boolean;
    limit?: number;
}) {
    try {
        const notifications = await prisma.familyNotification.findMany({
            where: {
                ...(params.familyId && { familyId: params.familyId }),
                ...(params.memberId && { 
                    OR: [
                        { memberId: params.memberId },
                        { memberId: null }, // Notifications pour toute la famille
                    ],
                }),
                ...(params.unreadOnly && { isRead: false }),
            },
            orderBy: [
                { priority: 'desc' },
                { createdAt: 'desc' },
            ],
            take: params.limit || 20,
        });

        return { success: true, notifications };
    } catch (error) {
        console.error('Error getting notifications:', error);
        return { success: false, error: 'Erreur lors de la récupération' };
    }
}

/**
 * Marquer une notification comme lue
 */
export async function markNotificationRead(notificationId: string) {
    try {
        await prisma.familyNotification.update({
            where: { id: notificationId },
            data: {
                isRead: true,
                readAt: new Date(),
            },
        });

        return { success: true };
    } catch (error) {
        console.error('Error marking notification read:', error);
        return { success: false, error: 'Erreur lors de la mise à jour' };
    }
}



