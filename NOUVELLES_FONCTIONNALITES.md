# Nouvelles Fonctionnalités et Améliorations UI/UX

## 1. Gamification et Communauté (Priorité Accueil)
- **Widget Communauté Premium** : Placé en haut de l'écran d'accueil.
  - Affiche le niveau de l'utilisateur ("Expert Culinaire").
  - Barre de progression vers le prochain badge.
  - Points accumulés visibles.
  - Boutons d'action rapide : "Créer Recette" (+50 pts) et "Communauté".
  - Bannière de défi hebdomadaire actif.

## 2. Création de Recettes (User Generated Content)
- **Nouvelle Page `/recipes/create`** :
  - Formulaire complet (titre, ingrédients, instructions, macros).
  - **Génération d'Image IA** : L'utilisateur peut générer une photo réaliste de son plat en un clic.
  - Sauvegarde avec attribution à l'utilisateur ("Source: USER").

## 3. Page Communauté (`/community`)
- **Fil d'actualité** : Affiche les recettes partagées par les autres utilisateurs.
- **Leaderboard** : Classement des "Top Chefs" de la semaine.
- **Système de notation** : Étoiles et commentaires (visuel).

## 4. Refonte UI/UX du Planificateur de Repas (`/meals/plan`)
- **Design Moderne** : Interface épurée, cartes avec ombres douces, typographie soignée.
- **Navigation Intuitive** : Onglets défilables pour les jours de la semaine (plus de liste interminable).
- **Cartes de Repas Enrichies** :
  - Grandes images.
  - Badges clairs pour le type de repas et les calories.
  - Détails (ingrédients/instructions) dépliables.
- **Filtres Glassmorphism** : Panneau de préférences élégant et discret.
- **Animations** : Transitions fluides avec Framer Motion.

## 5. Diversité des Recettes IA
- **Thèmes Culinaires** : Introduction de thèmes aléatoires (Méditerranéen, Asiatique, etc.) pour varier les propositions.
- **Anti-Répétition** : Logique améliorée pour éviter de proposer le même plat plusieurs fois dans la semaine.
