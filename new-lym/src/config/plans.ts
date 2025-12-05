export type PlanType = 'BASIC' | 'PREMIUM' | 'FAMILY';

export interface PlanFeature {
  name: string;
  included: boolean;
  limit?: string;
}

export interface Plan {
  id: PlanType;
  name: string;
  tagline: string;
  price: number;
  period: string;
  features: PlanFeature[];
  popular?: boolean;
  cta: string;
}

export const PLANS: Plan[] = [
  {
    id: 'BASIC',
    name: 'Basic',
    tagline: 'Pour démarrer votre parcours santé',
    price: 0,
    period: 'Gratuit',
    cta: 'Commencer gratuitement',
    features: [
      { name: 'Planification de repas manuelle', included: true },
      { name: 'Plan 7 jours de test', included: true, limit: '1 seul plan' },
      { name: 'Coach IA', included: true, limit: 'Version limitée' },
      { name: 'Tableaux de bord & suivi', included: true },
      { name: 'Partage de recettes', included: true },
      { name: 'Génération de repas par IA', included: false },
      { name: 'Photos de plats générées', included: false },
      { name: 'Liste de courses intelligente', included: false },
      { name: 'Mode famille', included: false },
    ],
  },
  {
    id: 'PREMIUM',
    name: 'Premium',
    tagline: 'L\'expérience nutrition complète',
    price: 9.99,
    period: '/mois',
    popular: true,
    cta: 'Essai gratuit 7 jours',
    features: [
      { name: 'Planification de repas manuelle', included: true },
      { name: 'Plans 7 jours illimités', included: true },
      { name: 'Coach IA complet', included: true },
      { name: 'Tableaux de bord & suivi', included: true },
      { name: 'Partage de recettes', included: true },
      { name: 'Génération de repas par IA', included: true },
      { name: 'Photos de plats générées', included: true },
      { name: 'Liste de courses intelligente', included: true },
      { name: 'Mode famille', included: false },
    ],
  },
  {
    id: 'FAMILY',
    name: 'Family',
    tagline: 'Toute la famille réunie autour de la table',
    price: 14.99,
    period: '/mois',
    cta: 'Essai gratuit 7 jours',
    features: [
      { name: 'Tout Premium inclus', included: true },
      { name: 'Jusqu\'à 6 membres', included: true },
      { name: 'Plans repas multi-profils', included: true },
      { name: 'Liste de courses partagée', included: true },
      { name: 'Suivi nutritionnel par membre', included: true },
      { name: 'Coach IA famille', included: true },
      { name: 'Challenges familiaux', included: true },
      { name: 'Notifications intelligentes', included: true },
      { name: 'Gestion des allergies croisées', included: true },
    ],
  },
];

export const getPlanById = (id: PlanType): Plan | undefined => {
  return PLANS.find(plan => plan.id === id);
};

export const canAccessFeature = (
  userPlan: PlanType,
  feature: 'ai_generation' | 'unlimited_plans' | 'family_mode' | 'shopping_list'
): boolean => {
  const planHierarchy: Record<PlanType, number> = {
    BASIC: 0,
    PREMIUM: 1,
    FAMILY: 2,
  };

  const featureRequirements: Record<string, PlanType> = {
    ai_generation: 'PREMIUM',
    unlimited_plans: 'PREMIUM',
    shopping_list: 'PREMIUM',
    family_mode: 'FAMILY',
  };

  const requiredPlan = featureRequirements[feature];
  return planHierarchy[userPlan] >= planHierarchy[requiredPlan];
};
