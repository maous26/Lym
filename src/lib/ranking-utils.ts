/**
 * Utilitaires pour le système de ranking
 */

export const LEVEL_THRESHOLDS = {
    1: 0,      // Apprenti: 0-299 pts
    2: 300,    // Confirmé: 300-999 pts
    3: 1000,   // Expert: 1000+ pts
};

/**
 * Déterminer le niveau basé sur les points
 */
export function calculateLevel(points: number): number {
    if (points >= LEVEL_THRESHOLDS[3]) return 3;
    if (points >= LEVEL_THRESHOLDS[2]) return 2;
    return 1;
}

/**
 * Obtenir le nom du niveau
 */
export function getLevelName(level: number): string {
    const names: Record<number, string> = {
        1: 'Apprenti Chef',
        2: 'Chef Confirmé',
        3: 'Chef Expert',
    };
    return names[level] || 'Apprenti Chef';
}

/**
 * Obtenir les infos de niveau pour l'affichage
 */
export function getLevelInfo(level: number): { name: string; nextLevel: number | null; pointsNeeded: number } {
    const name = getLevelName(level);
    const nextLevel = level < 3 ? level + 1 : null;
    const pointsNeeded = nextLevel ? LEVEL_THRESHOLDS[nextLevel as keyof typeof LEVEL_THRESHOLDS] : 0;
    
    return { name, nextLevel, pointsNeeded };
}

