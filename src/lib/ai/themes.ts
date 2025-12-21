// Culinary themes for meal variety

export const CULINARY_THEMES = [
    "Cuisine Méditerranéenne (Italie, Grèce, Espagne)",
    "Cuisine Française Traditionnelle",
    "Saveurs Asiatiques (Japon, Thaïlande, Vietnam) adaptées",
    "Cuisine Végétale Créative",
    "Plats Mijotés et Réconfortants",
    "Cuisine du Monde (Mexique, Inde, Liban)",
    "Recettes Express et Légères",
    "Spécialités Régionales Françaises (Provence, Bretagne, Sud-Ouest)",
    "Cuisine Fusion Moderne",
    "Repas Détox et Énergie"
];

export function getRandomTheme(): string {
    return CULINARY_THEMES[Math.floor(Math.random() * CULINARY_THEMES.length)];
}

// Seasonal themes
export const SEASONAL_THEMES: Record<string, string[]> = {
    spring: [
        "Légumes printaniers (asperges, petits pois, radis)",
        "Salades fraîches et colorées",
        "Cuisine légère et vitaminée"
    ],
    summer: [
        "Cuisine méditerranéenne estivale",
        "Salades composées généreuses",
        "Grillades et barbecue healthy",
        "Smoothie bowls et fruits frais"
    ],
    autumn: [
        "Courges et légumes racines",
        "Plats mijotés réconfortants",
        "Champignons et châtaignes",
        "Saveurs d'automne"
    ],
    winter: [
        "Cuisine réconfortante et chaleureuse",
        "Gratins et plats au four",
        "Soupes et veloutés",
        "Agrumes et vitamines hivernales"
    ]
};

export function getCurrentSeason(): 'spring' | 'summer' | 'autumn' | 'winter' {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'autumn';
    return 'winter';
}

export function getSeasonalTheme(): string {
    const season = getCurrentSeason();
    const themes = SEASONAL_THEMES[season];
    return themes[Math.floor(Math.random() * themes.length)];
}
