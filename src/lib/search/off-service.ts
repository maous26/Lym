import axios from 'axios';
import { Product } from '@/types/product';

// Utiliser l'API française d'Open Food Facts pour les produits du marché français
const OFF_API_URL = 'https://fr.openfoodfacts.org/cgi/search.pl';

export const searchOpenFoodFacts = async (query: string): Promise<Product[]> => {
    if (!query) return [];

    try {
        const response = await axios.get(OFF_API_URL, {
            params: {
                search_terms: query,
                search_simple: 1,
                action: 'process',
                json: 1,
                page_size: 30, // Plus de résultats pour filtrer
                // Filtrer par pays de vente France
                tagtype_0: 'countries',
                tag_contains_0: 'contains',
                tag_0: 'france',
                // Champs à récupérer
                fields: 'code,product_name,product_name_fr,brands,image_url,nutriscore_grade,nutriments,countries_tags',
            },
        });

        if (!response.data.products) return [];

        // Filtrer et mapper les produits
        return response.data.products
            .filter((p: any) => {
                // Vérifier que le produit a un nom
                const name = p.product_name_fr || p.product_name;
                if (!name) return false;
                
                // Vérifier que le produit est vendu en France
                const countries = p.countries_tags || [];
                const isFrench = countries.some((c: string) => 
                    c.includes('france') || c.includes('en:france') || c.includes('fr:france')
                );
                
                return isFrench || countries.length === 0; // Accepter si pas d'info pays (probable français via API fr)
            })
            .slice(0, 20) // Limiter à 20 résultats
            .map((p: any) => ({
                id: `off_${p.code}`,
                name: p.product_name_fr || p.product_name || 'Inconnu',
                source: 'OFF' as const,
                calories: Math.round(p.nutriments?.['energy-kcal_100g'] || 0),
                proteins: Math.round(p.nutriments?.proteins_100g || 0),
                carbs: Math.round(p.nutriments?.carbohydrates_100g || 0),
                fats: Math.round(p.nutriments?.fat_100g || 0),
                image: p.image_url,
                brand: p.brands,
                nutriscore: p.nutriscore_grade,
            }));
    } catch (error) {
        console.error('OFF Search Error:', error);
        return [];
    }
};
