// Plaisir Credit - Logique de calcul pour le système de récompense
// Basé sur la philosophie "Régularité > Perfection"

export type Zone = 'green' | 'orange' | 'red';

export interface DayZoneStatus {
  date: string;
  percentage: number;
  zone: Zone;
  hasData: boolean;
  dayLabel: string; // L, M, M, J, V, S, D
}

export interface PlaisirCreditData {
  currentCredit: number;      // Nombre de jours en zone verte (0-7)
  creditRequired: number;     // Jours requis pour débloquer (default 5)
  weeklyHistory: DayZoneStatus[];
  isReady: boolean;           // true si currentCredit >= creditRequired
  percentageFilled: number;   // Pour la jauge (0-100)
}

// Labels des jours en français
const DAY_LABELS = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

/**
 * Classifie le pourcentage d'un jour dans une zone
 * - Vert (90-110%): Dans le flow, tu gagnes du crédit
 * - Orange (80-90% ou 110-120%): Écart normal, on surveille
 * - Rouge (<80% ou >120%): À garder exceptionnel
 */
export function classifyDayZone(percentage: number): Zone {
  if (percentage >= 90 && percentage <= 110) {
    return 'green';
  }
  if ((percentage >= 80 && percentage < 90) || (percentage > 110 && percentage <= 120)) {
    return 'orange';
  }
  return 'red';
}

/**
 * Obtient la couleur CSS pour une zone
 */
export function getZoneColor(zone: Zone): string {
  switch (zone) {
    case 'green':
      return 'bg-emerald-400';
    case 'orange':
      return 'bg-amber-400';
    case 'red':
      return 'bg-red-400';
    default:
      return 'bg-stone-200';
  }
}

/**
 * Interface pour les repas quotidiens depuis le store
 */
interface DailyMeals {
  breakfast?: { totalNutrition?: { calories?: number } };
  lunch?: { totalNutrition?: { calories?: number } };
  snack?: { totalNutrition?: { calories?: number } };
  dinner?: { totalNutrition?: { calories?: number } };
  totalNutrition?: { calories?: number };
}

/**
 * Calcule le crédit plaisir sur les 7 derniers jours
 * @param meals - Record des repas par date (YYYY-MM-DD)
 * @param dailyTarget - Objectif calorique journalier
 * @param creditRequired - Nombre de jours verts requis (default 5)
 */
export function calculatePlaisirCredit(
  meals: Record<string, DailyMeals>,
  dailyTarget: number,
  creditRequired: number = 5
): PlaisirCreditData {
  const today = new Date();
  const weeklyHistory: DayZoneStatus[] = [];
  let greenDays = 0;

  // Calculer pour les 7 derniers jours (du plus ancien au plus récent)
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateKey = date.toISOString().split('T')[0];
    const dayOfWeek = date.getDay();

    const dayMeals = meals[dateKey];

    // Vérifier si le jour a des données (au moins un repas)
    const hasData = Boolean(
      dayMeals && (
        dayMeals.breakfast ||
        dayMeals.lunch ||
        dayMeals.snack ||
        dayMeals.dinner
      )
    );

    // Calculer les calories consommées
    let consumed = 0;
    if (dayMeals) {
      // Utiliser totalNutrition si disponible
      if (dayMeals.totalNutrition?.calories) {
        consumed = dayMeals.totalNutrition.calories;
      } else {
        // Sinon, additionner les repas individuels
        consumed += dayMeals.breakfast?.totalNutrition?.calories || 0;
        consumed += dayMeals.lunch?.totalNutrition?.calories || 0;
        consumed += dayMeals.snack?.totalNutrition?.calories || 0;
        consumed += dayMeals.dinner?.totalNutrition?.calories || 0;
      }
    }

    const percentage = dailyTarget > 0 ? (consumed / dailyTarget) * 100 : 0;
    const zone = classifyDayZone(percentage);

    // Anti-abus: Les jours avec <50% des calories ne comptent pas comme "verts"
    // (évite la manipulation par restriction extrême)
    const isValidGreen = zone === 'green' && percentage >= 50;

    // Seuls les jours avec données et en zone verte valide comptent
    if (hasData && isValidGreen) {
      greenDays++;
    }

    weeklyHistory.push({
      date: dateKey,
      percentage: Math.round(percentage),
      zone: hasData ? zone : 'red', // Pas de données = rouge
      hasData,
      dayLabel: DAY_LABELS[dayOfWeek],
    });
  }

  const isReady = greenDays >= creditRequired;
  const percentageFilled = Math.min(100, (greenDays / creditRequired) * 100);

  return {
    currentCredit: greenDays,
    creditRequired,
    weeklyHistory,
    isReady,
    percentageFilled,
  };
}

/**
 * Génère le message marketing selon l'état du crédit
 */
export function getPlaisirMessage(
  currentCredit: number,
  creditRequired: number,
  isReady: boolean
): { title: string; subtitle: string; message: string; badgeText: string } {
  const remaining = creditRequired - currentCredit;

  if (isReady) {
    return {
      title: 'Crédit Plaisir',
      subtitle: 'Tu as gagné !',
      message: 'Bravo ! Tu as été régulier(e) cette semaine. Profite sans culpabilité !',
      badgeText: 'Prêt !',
    };
  }

  if (currentCredit >= creditRequired - 1) {
    // Presque prêt (3-4 jours)
    return {
      title: 'Crédit Plaisir',
      subtitle: 'Régularité > Perfection',
      message: `Tu y es presque ! Plus que ${remaining} jour${remaining > 1 ? 's' : ''} et tu mérites ton plaisir.`,
      badgeText: `${currentCredit}/${creditRequired}`,
    };
  }

  // En construction (0-2 jours)
  return {
    title: 'Crédit Plaisir',
    subtitle: 'LYM ne juge pas un jour, mais ta moyenne',
    message: `Continue comme ça ! Encore ${remaining} jours dans la zone verte.`,
    badgeText: `${currentCredit}/${creditRequired}`,
  };
}
