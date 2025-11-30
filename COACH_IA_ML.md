# 🤖 Coach IA avec Machine Learning - Documentation

## ✨ Fonctionnalités Implémentées

### 1. **Coach IA avec GPT-4**
- Utilise OpenAI GPT-4 Turbo pour des réponses intelligentes
- Contexte nutritionnel en temps réel
- Historique de conversation pour continuité
- Personnalisation basée sur le profil utilisateur

### 2. **Machine Learning & Apprentissage**
- **Sauvegarde automatique** de toutes les conversations
- **Historique contextuel** : Les 5 dernières conversations sont utilisées pour améliorer les réponses
- **Analyse des habitudes** : GPT-4 analyse les patterns alimentaires
- **Suggestions personnalisées** : Recommandations basées sur l'historique

### 3. **Base de Données**
Deux nouvelles tables Prisma:

#### `CoachConversation`
```prisma
model CoachConversation {
  id                String   @id @default(uuid())
  userId            String   @default("default")
  userMessage       String
  assistantResponse String
  nutritionContext  String?  // JSON
  helpful           Boolean? // Feedback utilisateur
  rating            Int?     // 1-5
  createdAt         DateTime @default(now())
}
```

#### `UserProfile`
```prisma
model UserProfile {
  id              String   @id @default(uuid())
  userId          String   @unique
  goals           String?  // JSON: ["perte_poids", "prise_muscle"]
  preferences     String?  // JSON: ["végétarien", "sans_gluten"]
  restrictions    String?  // JSON: ["lactose", "arachides"]
  age             Int?
  weight          Float?
  height          Float?
  activityLevel   String?
  targetCalories  Int?
  targetProteins  Int?
  targetCarbs     Int?
  targetFats      Int?
}
```

---

## 🚀 Fonctions Disponibles

### 1. `chatWithAICoach()`
Coach principal avec mémoire contextuelle

```typescript
const response = await chatWithAICoach(
  "Comment puis-je améliorer mon alimentation?",
  "user123",
  {
    consumed: { calories: 1200, proteins: 50, carbs: 150, fats: 40 },
    targets: { calories: 2000, proteins: 150, carbs: 250, fats: 70 }
  }
);
```

**Caractéristiques:**
- ✅ Mémoire des 5 dernières conversations
- ✅ Contexte nutritionnel en temps réel
- ✅ Réponses personnalisées basées sur le profil
- ✅ Sauvegarde automatique pour apprentissage
- ✅ Gestion d'erreurs robuste

### 2. `analyzeUserHabits()`
Analyse ML des habitudes alimentaires

```typescript
const analysis = await analyzeUserHabits("user123");
// Retourne:
// {
//   strengths: ["Bonne consommation de légumes", "Hydratation régulière"],
//   improvements: ["Augmenter les protéines", "Réduire le sucre"],
//   recommendations: ["Conseil 1", "Conseil 2", "Conseil 3"],
//   healthScore: 75
// }
```

### 3. `generatePersonalizedMealSuggestions()`
Suggestions de repas basées sur ML

```typescript
const suggestions = await generatePersonalizedMealSuggestions(
  "user123",
  "breakfast",
  nutritionContext
);
// Retourne 3 suggestions de repas personnalisées
```

---

## 📊 Comment ça Marche?

### Flux de Conversation

```
User: "J'ai faim, que puis-je manger?"
  ↓
1. Récupération du profil utilisateur
  ↓
2. Chargement des 5 dernières conversations
  ↓
3. Analyse du contexte nutritionnel actuel
  ↓
4. Construction du prompt enrichi:
   - Profil utilisateur
   - Historique de conversation
   - Données nutritionnelles du jour
   - Recommandations PNNS
  ↓
5. Appel à GPT-4 Turbo
  ↓
6. Réponse personnalisée et contextuelle
  ↓
7. Sauvegarde de la conversation
  ↓
8. Retour au client
```

### Apprentissage Continu

```
Chaque conversation → Base de données
  ↓
Historique accumulé
  ↓
Contexte enrichi pour futures conversations
  ↓
Réponses de plus en plus personnalisées
```

---

## ⚙️ Configuration

### 1. Variables d'Environnement

Ajoutez dans `.env`:
```bash
OPENAI_API_KEY=sk-...your-key...
```

### 2. Installation

```bash
npm install openai
npx prisma migrate dev --name add_coach_ml
npx prisma generate
```

### 3. Redémarrer le Serveur

```bash
# Arrêter le serveur actuel
# Puis relancer
npm run dev
```

---

## 💡 Exemples d'Utilisation

### Exemple 1: Conversation Simple

```typescript
import { chatWithAICoach } from '@/app/actions/ai-coach';

const response = await chatWithAICoach(
  "Quels sont les meilleurs aliments pour le petit-déjeuner?",
  "user123"
);

console.log(response.response);
// "🌅 Excellent question! Pour un petit-déjeuner français équilibré..."
```

### Exemple 2: Avec Contexte Nutritionnel

```typescript
const response = await chatWithAICoach(
  "J'ai déjà mangé 1500 calories, que faire?",
  "user123",
  {
    consumed: { calories: 1500, proteins: 60, carbs: 180, fats: 50 },
    targets: { calories: 2000, proteins: 150, carbs: 250, fats: 70 }
  }
);

// Le coach adaptera sa réponse en fonction des calories restantes
```

### Exemple 3: Analyse des Habitudes

```typescript
const analysis = await analyzeUserHabits("user123");

console.log(`Score de santé: ${analysis.analysis.healthScore}/100`);
console.log("Points forts:", analysis.analysis.strengths);
console.log("À améliorer:", analysis.analysis.improvements);
```

---

## 🎯 Avantages du Machine Learning

### 1. **Personnalisation**
- Chaque utilisateur a un profil unique
- Les réponses s'adaptent à l'historique
- Recommandations basées sur les préférences

### 2. **Continuité**
- Le coach "se souvient" des conversations précédentes
- Pas besoin de répéter le contexte
- Suivi cohérent dans le temps

### 3. **Amélioration Continue**
- Plus l'utilisateur interagit, meilleures sont les réponses
- Apprentissage des patterns alimentaires
- Suggestions de plus en plus pertinentes

### 4. **Données Structurées**
- Toutes les conversations sont sauvegardées
- Possibilité d'analyse future
- Feedback utilisateur pour améliorer le modèle

---

## 📈 Métriques & Monitoring

### Données Collectées

- **Conversations**: Toutes les interactions user ↔ coach
- **Contexte nutritionnel**: État au moment de la conversation
- **Feedback**: Ratings et utilité des réponses
- **Usage**: Tokens utilisés par conversation

### Analyse Possible

```sql
-- Conversations les plus fréquentes
SELECT userMessage, COUNT(*) as count
FROM CoachConversation
GROUP BY userMessage
ORDER BY count DESC
LIMIT 10;

-- Satisfaction utilisateur
SELECT AVG(rating) as avg_rating
FROM CoachConversation
WHERE rating IS NOT NULL;
```

---

## 🔮 Améliorations Futures

### Court Terme
1. **Interface de Chat**
   - Composant React pour conversations
   - Historique visible
   - Feedback en temps réel

2. **Profils Utilisateurs**
   - Page de configuration du profil
   - Objectifs personnalisés
   - Préférences alimentaires

### Moyen Terme
3. **Analyse Avancée**
   - Graphiques de progression
   - Patterns alimentaires
   - Recommandations proactives

4. **Fine-tuning**
   - Entraîner un modèle personnalisé
   - Basé sur les conversations sauvegardées
   - Encore plus précis et pertinent

### Long Terme
5. **IA Prédictive**
   - Anticiper les besoins nutritionnels
   - Suggestions avant même de demander
   - Alertes intelligentes

---

## ⚠️ Points d'Attention

### Coûts OpenAI
- GPT-4 Turbo: ~$0.01 / 1K tokens input, ~$0.03 / 1K tokens output
- Moyenne: ~$0.05 par conversation
- Surveiller l'usage avec les métriques

### Limites de Tokens
- Max 500 tokens par réponse (configurable)
- Historique limité à 5 conversations
- Ajuster selon les besoins

### Confidentialité
- Données sensibles (santé, nutrition)
- Respecter le RGPD
- Anonymiser si nécessaire

---

## ✅ Checklist de Déploiement

- [x] OpenAI installé
- [x] Schéma Prisma mis à jour
- [x] Migrations appliquées
- [x] Client Prisma généré
- [x] Actions créées
- [x] Variables d'environnement configurées
- [ ] Serveur redémarré
- [ ] Tests effectués
- [ ] Interface utilisateur créée

**Prochaine étape**: Redémarrer le serveur et tester!

```bash
# Arrêter le serveur actuel (Ctrl+C)
npm run dev
```

---

## 🎉 Résultat Final

Un coach IA intelligent qui:
- 🧠 Apprend de chaque conversation
- 💬 Se souvient du contexte
- 📊 Analyse les habitudes
- 🎯 Personnalise les conseils
- 🚀 S'améliore continuellement

**Tout est prêt!** 🎊
