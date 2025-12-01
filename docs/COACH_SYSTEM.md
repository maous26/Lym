# Système de Coach IA Proactif - LYM

## Vue d'ensemble

Le système de coach IA proactif de LYM combine deux composants principaux pour offrir une expérience de coaching personnalisée et non-intrusive :

1. **Coach Hub** - Encart principal sur la page d'accueil
2. **Avatar Flottant** - Accès rapide global avec notifications

## Architecture

### 1. Store de Coach (`src/store/coach-store.ts`)

Gère l'état global des insights et notifications du coach :

- **Insights** : Conseils personnalisés basés sur les données utilisateur
- **Priorités** : high, medium, low
- **Types** : success, warning, info, tip
- **Actions** : addInsight, markAsRead, dismissInsight, clearOldInsights

### 2. Coach Hub (`src/components/features/dashboard/CoachHub.tsx`)

**Emplacement** : Page d'accueil, sous les widgets de poids et communauté

**Fonctionnalités** :
- Affiche 1-3 insights prioritaires
- Génération automatique d'insights basée sur :
  - Apport calorique (déficit/surplus)
  - Protéines (insuffisance)
  - Glucides (pour perte de poids)
  - Intensité sportive
- Bouton "Discuter avec votre coach" pour accès direct au chat
- Insights dismissables (bouton X)

**Logique de génération** :
- S'exécute une fois par jour
- Analyse les 7 derniers jours de nutrition
- Stocke la date de dernière vérification dans localStorage

### 3. Avatar Flottant (`src/components/features/coach/FloatingCoachAvatar.tsx`)

**Emplacement** : Présent sur toutes les pages sauf `/coach` et `/onboarding`

**Fonctionnalités** :
- Badge de notification (nombre d'insights non lus)
- Panneau de prévisualisation au clic (si insights non lus)
- Redirection vers `/coach` si aucun insight
- Affiche top 3 insights dans le panneau

**Design** :
- Position fixe en bas à droite
- Icône Sparkles sur fond violet
- Badge rouge avec compteur
- Animation smooth avec framer-motion

## Flux Utilisateur

### Scénario 1 : Nouveaux insights disponibles

1. L'utilisateur ouvre l'app
2. Le Coach Hub génère des insights (1x/jour)
3. Les insights apparaissent sur la page d'accueil
4. L'avatar flottant affiche un badge (ex: "2")
5. L'utilisateur clique sur l'avatar → panneau de prévisualisation
6. L'utilisateur clique sur un insight → redirection vers `/coach`

### Scénario 2 : Pas de nouveaux insights

1. L'utilisateur clique sur l'avatar flottant
2. Redirection directe vers `/coach` pour discussion libre

### Scénario 3 : Dismiss d'un insight

1. L'utilisateur clique sur le X d'un insight
2. L'insight est marqué comme dismissed
3. Il disparaît de toutes les vues
4. Le compteur de badge se met à jour

## Intégration

### Page d'accueil (`src/app/page.tsx`)

```tsx
import { CoachHub } from '@/components/features/dashboard/CoachHub';

// Dans le JSX
<CoachHub />
```

### Layout global (`src/app/layout.tsx`)

```tsx
import { FloatingCoachAvatar } from '@/components/features/coach/FloatingCoachAvatar';

// Dans le body
<FloatingCoachAvatar />
```

## Types d'Insights Générés

### 1. Calories
- **Insuffisant** (< 80% objectif) → Warning, High priority
- **Surplus** (> 115% objectif) → Warning, High priority
- **Équilibré** (80-115% objectif) → Success, Medium priority

### 2. Protéines
- **Insuffisant** (< 80% objectif) → Info, Medium priority

### 3. Glucides (si objectif = perte de poids)
- **Trop élevé** (> 120% objectif) → Tip, Low priority

### 4. Sport
- **Intensité élevée** → Tip, Medium priority (conseils nutrition sportive)

## Personnalisation Future

Le système est conçu pour être facilement extensible :

1. **Nouveaux types d'insights** : Ajouter dans `typeConfig` de CoachHub
2. **Nouvelles sources de données** : Intégrer dans `generateInsights()`
3. **Notifications push** : Utiliser `useCoachStore` pour déclencher
4. **Insights contextuels** : Basés sur la page actuelle (ex: suggestions de repas sur `/meals`)

## Bonnes Pratiques

### Ne PAS faire :
- ❌ Pop-ups bloquants
- ❌ Notifications trop fréquentes
- ❌ Insights génériques non personnalisés
- ❌ Forcer l'utilisateur à interagir

### À FAIRE :
- ✅ Insights basés sur vraies données
- ✅ Permettre le dismiss
- ✅ Limiter à 3 insights max visibles
- ✅ Générer 1x par jour maximum
- ✅ Prioriser par importance

## Maintenance

### Nettoyage automatique
- Les insights > 7 jours sont automatiquement supprimés
- Appeler `clearOldInsights()` au besoin

### Debug
```tsx
// Voir tous les insights
const { insights } = useCoachStore();
console.log(insights);

// Forcer la génération d'insights
localStorage.removeItem('lastInsightCheck');
```

## Performance

- **Génération d'insights** : O(n) où n = 7 jours
- **Stockage** : Zustand + localStorage (persist)
- **Rendu** : Optimisé avec framer-motion lazy loading
