'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, Settings, Sparkles, History, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ChatInterface } from '@/components/features/coach/ChatInterface';
import { useCoachStore } from '@/store/coach-store';
import { cn } from '@/lib/utils';

export default function CoachPage() {
  const router = useRouter();
  const { totalMessages, streakDays } = useCoachStore();

  // Mock AI response function (replace with actual API call)
  const handleSendMessage = async (message: string): Promise<string> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1000));

    // Simple mock responses based on keywords
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('petit-déjeuner') || lowerMessage.includes('petit dejeuner')) {
      return `Pour un petit-déjeuner équilibré, je vous suggère :\n\n🥣 **Option rapide** : Yaourt grec + muesli + fruits rouges\n\n🍳 **Option protéinée** : Œufs brouillés + pain complet + avocat\n\n🥤 **Smoothie** : Banane + épinards + lait d'amande + beurre de cacahuète\n\nL'important est d'inclure des protéines pour la satiété et des glucides complexes pour l'énergie ! 💪`;
    }

    if (lowerMessage.includes('protéine') || lowerMessage.includes('protein')) {
      return `Voici quelques astuces pour augmenter votre apport en protéines :\n\n1. 🥚 **Au petit-déj** : Ajoutez des œufs ou du fromage blanc\n\n2. 🥜 **Snacks malins** : Amandes, houmous, skyr\n\n3. 🍗 **Repas principaux** : Visez 20-30g de protéines (150g de poulet = ~30g)\n\n4. 🥛 **Alternative végétale** : Lentilles, pois chiches, tofu\n\nObjectif : 1.6-2g de protéines par kg de poids corporel si vous êtes actif ! 💪`;
    }

    if (lowerMessage.includes('recette') || lowerMessage.includes('dîner') || lowerMessage.includes('soir')) {
      return `Voici une recette rapide et saine pour ce soir :\n\n🍝 **Pâtes complètes aux légumes grillés**\n\n**Ingrédients** (2 pers) :\n- 200g pâtes complètes\n- 1 courgette, 1 poivron\n- 200g tomates cerises\n- 2 c.s. huile d'olive\n- Parmesan, basilic\n\n**Préparation** (25 min) :\n1. Coupez les légumes, faites-les griller\n2. Cuisez les pâtes al dente\n3. Mélangez le tout avec l'huile d'olive\n4. Finissez avec parmesan et basilic frais\n\n📊 ~450 kcal | P: 15g | G: 65g | L: 14g`;
    }

    if (lowerMessage.includes('eau') || lowerMessage.includes('boire')) {
      return `Excellente question sur l'hydratation ! 💧\n\n**Objectif** : 1.5 à 2L d'eau par jour (plus si activité physique)\n\n**Mes astuces** :\n\n1. 🌅 Commencez par un grand verre au réveil\n2. 📱 Utilisez une app de rappel\n3. 🍋 Ajoutez du citron ou des fruits pour le goût\n4. 🫖 Le thé et les infusions comptent aussi !\n5. 🍉 Mangez des aliments riches en eau (concombre, pastèque)\n\n**Signe d'une bonne hydratation** : Urine claire et mictions régulières !`;
    }

    if (lowerMessage.includes('snack') || lowerMessage.includes('goûter') || lowerMessage.includes('collation')) {
      return `Voici des idées de snacks sains pour le goûter :\n\n🍎 **Fruité** : Pomme + beurre d'amande\n\n🥜 **Protéiné** : Poignée de noix mélangées (30g)\n\n🥛 **Crémeux** : Yaourt grec + miel + cannelle\n\n🥕 **Croquant** : Bâtonnets de légumes + houmous\n\n🍫 **Gourmand** : 2 carrés de chocolat noir 70%\n\nVisez ~150-200 kcal pour un snack équilibré ! 🎯`;
    }

    if (lowerMessage.includes('sucre') || lowerMessage.includes('réduire')) {
      return `Réduire le sucre progressivement, c'est la clé ! 🎯\n\n**Étapes pratiques** :\n\n1. 📖 **Lisez les étiquettes** : évitez >10g sucre/100g\n\n2. 🥤 **Boissons** : Passez aux versions sans sucre\n\n3. 🍌 **Sucrez naturellement** : Banane, dattes, cannelle\n\n4. 🍫 **Desserts** : Optez pour le chocolat noir 70%+\n\n5. ⏰ **Progressif** : Réduisez de 25% par semaine\n\n**Astuce** : Le goût s'adapte en 2-3 semaines ! Courage ! 💪`;
    }

    // Default response
    return `Merci pour votre question ! 🌟\n\nJe suis là pour vous aider avec :\n\n• 🍽️ Des idées de repas équilibrés\n• 📊 Des conseils nutritionnels personnalisés\n• 🥗 Des recettes simples et saines\n• 💡 Des astuces pour atteindre vos objectifs\n\nN'hésitez pas à me poser des questions plus spécifiques sur votre alimentation !`;
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-stone-100 sticky top-0 z-10">
        <div className="flex items-center justify-between px-4 py-3">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => router.back()}
            className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-stone-600"
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>

          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-stone-800">Coach LYM</h1>
              <p className="text-xs text-stone-500">Votre assistant nutritionnel</p>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-stone-600"
          >
            <Settings className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Stats bar */}
        <div className="flex items-center justify-center gap-6 py-2 border-t border-stone-50 bg-stone-50/50">
          <div className="flex items-center gap-1.5 text-xs text-stone-500">
            <History className="w-3.5 h-3.5" />
            <span>{totalMessages} messages</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-stone-300" />
          <div className="flex items-center gap-1.5 text-xs text-stone-500">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{streakDays} jours d'affilée</span>
          </div>
        </div>
      </div>

      {/* Chat interface */}
      <div className="flex-1">
        <ChatInterface onSendMessage={handleSendMessage} className="h-[calc(100vh-140px)]" />
      </div>
    </div>
  );
}
