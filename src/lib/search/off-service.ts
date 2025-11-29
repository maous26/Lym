import axios from 'axios';
import { Product } from '@/types/product';

const OFF_API_URL = 'https://world.openfoodfacts.org/cgi/search.pl';

export const searchOpenFoodFacts = async (query: string): Promise<Product[]> => {
    if (!query) return [];

    try {
        const response = await axios.get(OFF_API_URL, {
            params: {
                search_terms: query,
                search_simple: 1,
                action: 'process',
                json: 1,
                page_size: 20,
                fields: 'code,product_name,brands,image_url,nutriscore_grade,nutriments',
            },
        });

        if (!response.data.products) return [];

        return response.data.products.map((p: any) => ({
            id: `off_${p.code}`,
            name: p.product_name || 'Inconnu',
            source: 'OFF',
            calories: p.nutriments?.['energy-kcal_100g'] || 0,
            proteins: p.nutriments?.proteins_100g || 0,
            carbs: p.nutriments?.carbohydrates_100g || 0,
            fats: p.nutriments?.fat_100g || 0,
            image: p.image_url,
            brand: p.brands,
            nutriscore: p.nutriscore_grade,
        }));
    } catch (error) {
        console.error('OFF Search Error:', error);
        return [];
    }
};
