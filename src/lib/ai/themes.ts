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
