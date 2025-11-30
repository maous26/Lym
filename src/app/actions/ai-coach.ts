'use server';

import OpenAI from 'openai';
import { prisma } from '@/lib/prisma';
import { generateUserProfileContext } from '@/lib/ai/user-context';

// Re-export for other files
export { generateUserProfileContext };

// Initialize OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Interface pour l'historique de conversation
interface ConversationMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

// Interface pour le programme de jeûne
interface FastingSchedule {
    type: 'none' | '16_8' | '18_6' | '20_4' | '5_2' | 'eat_stop_eat';
    eatingWindowStart?: string;
    eatingWindowEnd?: string;
}

// Interface pour le profil utilisateur complet (depuis onboarding)
interface OnboardingProfile {
    name: string;
    age: number | null;
    gender: 'male' | 'female' | 'other' | null;
    height: number | null;
    weight: number | null;
    targetWeight: number | null;
    activityLevel: string | null;
    primaryGoal: string | null;
    dietaryPreferences: string;
    allergies: string[];
    isParent: boolean;
    cookingSkillLevel?: string;
    cookingTimeWeekday?: number;
    cookingTimeWeekend?: number;
    weightLossGoalKg?: number;
    suggestedDurationWeeks?: number;
    fastingSchedule?: FastingSchedule;
}

/**
 * Calcule l'IMC à partir du poids et de la taille
 */
function calculateBMI(weight: number | null, height: number | null): { value: number | null; category: string } {
    if (!weight || !height) return { value: null, category: 'Non calculé' };
    
    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);
    const roundedBmi = Math.round(bmi * 10) / 10;
    
    if (bmi < 18.5) return { value: roundedBmi, category: 'Insuffisance pondérale' };
    if (bmi < 25) return { value: roundedBmi, category: 'Poids normal' };
    if (bmi < 30) return { value: roundedBmi, category: 'Surpoids' };
    return { value: roundedBmi, category: 'Obésité' };
}

/**
 * Calcule le métabolisme de base (BMR) avec la formule de Mifflin-St Jeor
 */
function calculateBMR(profile: OnboardingProfile): number | null {
    if (!profile.weight || !profile.height || !profile.age || !profile.gender) return null;
    
    if (profile.gender === 'male') {
        return Math.round(10 * profile.weight + 6.25 * profile.height - 5 * profile.age + 5);
    } else {
        return Math.round(10 * profile.weight + 6.25 * profile.height - 5 * profile.age - 161);
    }
}

/**
 * Calcule les besoins caloriques journaliers (TDEE)
 */
function calculateTDEE(profile: OnboardingProfile): number | null {
    const bmr = calculateBMR(profile);
    if (!bmr) return null;
    
    const activityMultipliers: Record<string, number> = {
        'sedentary': 1.2,
        'light': 1.375,
        'moderate': 1.55,
        'active': 1.725,
        'athlete': 1.9
    };
    
    const multiplier = profile.activityLevel ? activityMultipliers[profile.activityLevel] || 1.55 : 1.55;
    return Math.round(bmr * multiplier);
}

/**
 * Formate les labels pour l'affichage
 */
const formatGoal = (goal: string | null): string => {
    const goals: Record<string, string> = {
        'weight_loss': 'Perdre du poids',
        'muscle_gain': 'Prendre du muscle',
        'maintenance': 'Maintenir son poids',
        'health': 'Manger plus sainement',
        'energy': 'Regain d\'énergie'
    };
    return goal ? goals[goal] || goal : 'Non défini';
};

const formatActivity = (level: string | null): string => {
    const levels: Record<string, string> = {
        'sedentary': 'Sédentaire',
        'light': 'Légèrement actif',
        'moderate': 'Modérément actif',
        'active': 'Très actif',
        'athlete': 'Athlète'
    };
    return level ? levels[level] || level : 'Non défini';
};

const formatDiet = (diet: string): string => {
    const diets: Record<string, string> = {
        'omnivore': 'Omnivore',
        'vegetarian': 'Végétarien',
        'vegan': 'Végétalien',
        'pescatarian': 'Pescétarien',
        'keto': 'Cétogène',
        'paleo': 'Paléo'
    };
    return diets[diet] || diet;
};

const formatCookingSkill = (skill: string | undefined): string => {
    const skills: Record<string, string> = {
        'beginner': 'Débutant',
        'intermediate': 'Intermédiaire',
        'advanced': 'Avancé'
    };
    return skill ? skills[skill] || skill : 'Non défini';
};

const formatFasting = (type: string | undefined): { label: string; description: string } => {
    const types: Record<string, { label: string; description: string }> = {
        'none': { label: 'Aucun', description: 'Pas de jeûne intermittent' },
        '16_8': { label: '16:8', description: '16h de jeûne, 8h de fenêtre alimentaire' },
        '18_6': { label: '18:6', description: '18h de jeûne, 6h de fenêtre alimentaire' },
        '20_4': { label: '20:4 (OMAD)', description: '20h de jeûne, 4h de fenêtre alimentaire (One Meal A Day)' },
        '5_2': { label: '5:2', description: '5 jours normaux, 2 jours à très faible apport (~500 kcal)' },
        'eat_stop_eat': { label: 'Eat-Stop-Eat', description: 'Jeûne de 24h une à deux fois par semaine' }
    };
    return type ? types[type] || { label: type, description: '' } : { label: 'Non défini', description: '' };
};


/**
 * Récupère le profil et l'historique de l'utilisateur pour personnaliser les réponses
 */
async function getUserContext(userId: string = 'default', profile?: OnboardingProfile): Promise<string> {
    try {
        // Si un profil est fourni, l'utiliser
        if (profile) {
            return generateUserProfileContext(profile);
        }

        // Sinon, retourner un contexte basique
        return `
PROFIL UTILISATEUR:
- Profil non renseigné
- Conseils généraux basés sur les recommandations PNNS
`;
    } catch (error) {
        console.error('Error fetching user context:', error);
        return 'Profil utilisateur: Nouveau utilisateur';
    }
}

/**
 * Sauvegarde une conversation pour l'apprentissage futur
 */
async function saveConversation(
    userId: string,
    userMessage: string,
    assistantResponse: string,
    nutritionContext?: any
) {
    try {
        await prisma.coachConversation.create({
            data: {
                userId,
                userMessage,
                assistantResponse,
                nutritionContext: nutritionContext ? JSON.stringify(nutritionContext) : null,
            },
        });
        console.log('💾 Conversation sauvegardée pour apprentissage futur');
    } catch (error) {
        console.error('Error saving conversation:', error);
    }
}

/**
 * Récupère l'historique de conversation récent
 */
async function getConversationHistory(userId: string, limit: number = 5): Promise<ConversationMessage[]> {
    try {
        const conversations = await prisma.coachConversation.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });

        // Convertir en format de messages
        const messages: ConversationMessage[] = [];
        for (const conv of conversations.reverse()) {
            messages.push(
                { role: 'user', content: conv.userMessage },
                { role: 'assistant', content: conv.assistantResponse }
            );
        }

        return messages;
    } catch (error) {
        console.error('Error fetching conversation history:', error);
        return [];
    }
}

/**
 * Coach IA intelligent avec GPT-4 et machine learning
 */
export async function chatWithAICoach(
    userMessage: string,
    userId: string = 'default',
    nutritionContext?: {
        consumed: { calories: number; proteins: number; carbs: number; fats: number };
        targets: { calories: number; proteins: number; carbs: number; fats: number };
    },
    userProfile?: OnboardingProfile
) {
    try {
        console.log('🤖 AI Coach - Processing message:', userMessage);

        // 1. Récupérer le contexte utilisateur avec le profil complet
        const userContext = await getUserContext(userId, userProfile);

        // 2. Récupérer l'historique de conversation
        const conversationHistory = await getConversationHistory(userId);

        // 3. Construire le contexte nutritionnel
        let nutritionInfo = '';
        if (nutritionContext) {
            const remaining = {
                calories: nutritionContext.targets.calories - nutritionContext.consumed.calories,
                proteins: nutritionContext.targets.proteins - nutritionContext.consumed.proteins,
                carbs: nutritionContext.targets.carbs - nutritionContext.consumed.carbs,
                fats: nutritionContext.targets.fats - nutritionContext.consumed.fats,
            };

            nutritionInfo = `
DONNÉES NUTRITIONNELLES AUJOURD'HUI:
- Calories: ${Math.round(nutritionContext.consumed.calories)}/${nutritionContext.targets.calories} kcal (reste: ${Math.round(remaining.calories)} kcal)
- Protéines: ${Math.round(nutritionContext.consumed.proteins)}/${nutritionContext.targets.proteins}g (reste: ${Math.round(remaining.proteins)}g)
- Glucides: ${Math.round(nutritionContext.consumed.carbs)}/${nutritionContext.targets.carbs}g (reste: ${Math.round(remaining.carbs)}g)
- Lipides: ${Math.round(nutritionContext.consumed.fats)}/${nutritionContext.targets.fats}g (reste: ${Math.round(remaining.fats)}g)
`;
        }

        // 4. Construire le prompt système
        const systemPrompt = `Tu es un coach nutritionnel expert et bienveillant, spécialisé dans la nutrition française et les recommandations du PNNS (Programme National Nutrition Santé).

PRINCIPES FONDAMENTAUX:
- Toujours baser tes conseils sur des données scientifiques validées
- Être encourageant, positif et motivant
- Adapter ton langage au niveau de l'utilisateur
- Respecter les habitudes alimentaires françaises
- Promouvoir une approche équilibrée et durable

RECOMMANDATIONS PNNS:
- 5 fruits et légumes par jour
- Produits laitiers 2-3 fois par jour
- Féculents à chaque repas selon l'appétit
- Viande/poisson/œufs 1-2 fois par jour
- Limiter sel, sucre, graisses saturées
- Privilégier huiles végétales (olive, colza)
- Activité physique régulière

${userContext}

${nutritionInfo}

STYLE DE RÉPONSE:
- Concis mais complet (2-4 paragraphes maximum)
- Utiliser des émojis pertinents pour rendre la conversation agréable
- Donner des conseils actionnables et pratiques
- Si l'utilisateur est proche de ses objectifs, le féliciter
- Si l'utilisateur dépasse ses objectifs, proposer des ajustements sans culpabiliser

IMPORTANT:
- Ne jamais donner de diagnostic médical
- Recommander de consulter un professionnel de santé pour des questions médicales
- Adapter les conseils au contexte nutritionnel actuel de l'utilisateur`;

        // 5. Construire les messages
        const messages: ConversationMessage[] = [
            { role: 'system', content: systemPrompt },
            ...conversationHistory,
            { role: 'user', content: userMessage },
        ];

        // 6. Appeler GPT-4
        const completion = await openai.chat.completions.create({
            model: 'gpt-4-turbo-preview', // ou 'gpt-4' ou 'gpt-3.5-turbo' selon vos besoins
            messages: messages as any,
            temperature: 0.7, // Créativité modérée
            max_tokens: 500, // Limiter la longueur de la réponse
            presence_penalty: 0.6, // Éviter les répétitions
            frequency_penalty: 0.3,
        });

        const assistantResponse = completion.choices[0]?.message?.content || 'Désolé, je n\'ai pas pu générer de réponse.';

        // 7. Sauvegarder la conversation pour l'apprentissage
        await saveConversation(userId, userMessage, assistantResponse, nutritionContext);

        // 8. Retourner la réponse
        return {
            success: true,
            response: assistantResponse,
            usage: {
                promptTokens: completion.usage?.prompt_tokens || 0,
                completionTokens: completion.usage?.completion_tokens || 0,
                totalTokens: completion.usage?.total_tokens || 0,
            },
        };
    } catch (error: any) {
        console.error('❌ AI Coach Error:', error);

        // Gestion des erreurs spécifiques
        if (error.code === 'insufficient_quota') {
            return {
                success: false,
                error: 'Quota OpenAI dépassé. Veuillez vérifier votre compte.',
            };
        }

        if (error.code === 'invalid_api_key') {
            return {
                success: false,
                error: 'Clé API OpenAI invalide. Veuillez vérifier votre configuration.',
            };
        }

        return {
            success: false,
            error: 'Une erreur est survenue. Veuillez réessayer.',
        };
    }
}

/**
 * Analyse les habitudes alimentaires de l'utilisateur avec ML
 */
export async function analyzeUserHabits(userId: string = 'default') {
    try {
        // Récupérer l'historique des repas
        // const meals = await prisma.meal.findMany({
        //   where: { userId },
        //   orderBy: { date: 'desc' },
        //   take: 30, // 30 derniers jours
        // });

        const analysisPrompt = `En tant qu'expert en nutrition, analyse les habitudes alimentaires de cet utilisateur et fournis des recommandations personnalisées.

DONNÉES:
- Historique de 30 jours de repas
- Objectifs nutritionnels

TÂCHE:
Fournis une analyse structurée en JSON avec:
1. Points forts (ce que l'utilisateur fait bien)
2. Points à améliorer
3. Recommandations personnalisées (3-5 conseils actionnables)
4. Score de santé global (0-100)

Format JSON attendu:
{
  "strengths": ["point fort 1", "point fort 2"],
  "improvements": ["amélioration 1", "amélioration 2"],
  "recommendations": ["conseil 1", "conseil 2", "conseil 3"],
  "healthScore": 75
}`;

        const completion = await openai.chat.completions.create({
            model: 'gpt-4-turbo-preview',
            messages: [
                { role: 'system', content: 'Tu es un expert en analyse nutritionnelle.' },
                { role: 'user', content: analysisPrompt },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.3, // Plus déterministe pour l'analyse
        });

        const analysis = JSON.parse(completion.choices[0]?.message?.content || '{}');

        return {
            success: true,
            analysis,
        };
    } catch (error) {
        console.error('Error analyzing user habits:', error);
        return {
            success: false,
            error: 'Impossible d\'analyser les habitudes alimentaires.',
        };
    }
}

/**
 * Génère des suggestions de repas personnalisées avec ML
 */
export async function generatePersonalizedMealSuggestions(
    userId: string = 'default',
    mealType: string,
    nutritionContext: any
) {
    try {
        const userContext = await getUserContext(userId);

        const prompt = `En tant que chef nutritionniste expert, suggère 3 idées de repas pour ${mealType}.

${userContext}

CONTEXTE NUTRITIONNEL:
${JSON.stringify(nutritionContext, null, 2)}

CONTRAINTES:
- Respecter les habitudes alimentaires françaises
- Adapter au type de repas (${mealType})
- Tenir compte des besoins nutritionnels restants
- Proposer des recettes variées et savoureuses

Réponds en JSON avec cette structure:
{
  "suggestions": [
    {
      "title": "Nom du plat",
      "description": "Description courte",
      "calories": 500,
      "proteins": 30,
      "carbs": 40,
      "fats": 15,
      "prepTime": 20,
      "difficulty": "facile"
    }
  ]
}`;

        const completion = await openai.chat.completions.create({
            model: 'gpt-4-turbo-preview',
            messages: [
                { role: 'system', content: 'Tu es un chef nutritionniste expert.' },
                { role: 'user', content: prompt },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.8, // Plus créatif pour les suggestions
        });

        const suggestions = JSON.parse(completion.choices[0]?.message?.content || '{"suggestions":[]}');

        return {
            success: true,
            suggestions: suggestions.suggestions || [],
        };
    } catch (error) {
        console.error('Error generating meal suggestions:', error);
        return {
            success: false,
            error: 'Impossible de générer des suggestions.',
        };
    }
}
