'use client';

import { useMemo } from 'react';
import { useMealStore } from '@/store/meal-store';
import { useUserStore } from '@/store/user-store';
import { calculatePlaisirCredit, getPlaisirMessage, type PlaisirCreditData } from '@/lib/plaisir-credit';

interface UsePlaisirCreditReturn extends PlaisirCreditData {
  message: {
    title: string;
    subtitle: string;
    message: string;
    badgeText: string;
  };
  dailyTarget: number;
}

/**
 * Hook pour accéder aux données du Crédit Plaisir
 * Calcule automatiquement le crédit basé sur les 7 derniers jours
 */
export function usePlaisirCredit(): UsePlaisirCreditReturn {
  const meals = useMealStore((state) => state.meals);
  const soloNutritionalNeeds = useUserStore((state) => state.soloNutritionalNeeds);

  const dailyTarget = soloNutritionalNeeds?.calories || 2000;

  const creditData = useMemo(() => {
    return calculatePlaisirCredit(meals, dailyTarget);
  }, [meals, dailyTarget]);

  const message = useMemo(() => {
    return getPlaisirMessage(
      creditData.currentCredit,
      creditData.creditRequired,
      creditData.isReady
    );
  }, [creditData.currentCredit, creditData.creditRequired, creditData.isReady]);

  return {
    ...creditData,
    message,
    dailyTarget,
  };
}

export default usePlaisirCredit;
