# 👨‍👩‍👧‍👦 Mode Famille - Spécifications Médicales & Produit

## 🎯 Vision Stratégique

### Objectifs Médicaux
1. **Nutrition personnalisée par âge** : Respecter les ANC (Apports Nutritionnels Conseillés) français
2. **Prévention santé** : Détection précoce des déséquilibres nutritionnels
3. **Éducation nutritionnelle** : Accompagnement pédagogique pour toute la famille
4. **Suivi longitudinal** : Courbes de croissance enfants, évolution poids famille

### Objectifs Produit
1. **Adoption facile** : 0 friction, onboarding en 3 min max
2. **Engagement quotidien** : 80% des familles actives après 30 jours
3. **Valeur perçue** : ROI clair (économies courses + santé)
4. **Scalabilité** : Support 100k+ familles sans dégradation

---

## 📊 Besoins Nutritionnels par Profil (Basés sur ANSES)

### Enfants (3-10 ans)
- **Calories** : 1400-1800 kcal/j (selon âge/activité)
- **Protéines** : 0,9-1,0 g/kg/j (croissance)
- **Calcium** : 700-900 mg/j (ossification)
- **Fer** : 7-10 mg/j (anémie fréquente)
- **Vitamine D** : 400 UI/j (toute l'année en France)
- **Oméga-3** : DHA pour développement cérébral

### Adolescents (11-17 ans)
- **Calories** : 2000-2800 kcal/j (pic de croissance)
- **Protéines** : 0,9 g/kg/j
- **Calcium** : 1200 mg/j (pic masse osseuse)
- **Fer** : 11-16 mg/j (menstruations filles)
- **Zinc** : 12-13 mg/j (croissance, immunité)

### Adultes (18-64 ans)
- **Calories** : 1800-2500 kcal/j (selon activité)
- **Protéines** : 0,8 g/kg/j (maintenance)
- **Fibres** : 25-30 g/j (santé digestive)
- **Fruits & Légumes** : 5 portions/j minimum

### Seniors (65+ ans)
- **Calories** : 1600-2200 kcal/j (métabolisme ralenti)
- **Protéines** : 1,0-1,2 g/kg/j (prévention sarcopénie)
- **Vitamine B12** : Surveillance absorption
- **Vitamine D** : 800 UI/j (ostéoporose)
- **Hydratation** : 1,5-2L/j (sensation soif diminuée)

---

## 🏗️ Architecture Produit - Les 5 Piliers

### 1️⃣ ONBOARDING INTELLIGENT (3 minutes max)
**Flow optimisé :**
```
Étape 1 : "Qui êtes-vous ?" (Admin crée compte)
Étape 2 : "Composez votre famille" (Ajout rapide profils)
Étape 3 : "Vos objectifs" (Santé, budget, temps)
Étape 4 : "Magie !" (Premier plan généré en 10s)
```

**Psychologie UX :**
- Progression visuelle (barre 0→100%)
- Gratification immédiate (plan prêt dès la fin)
- Pas de surcharge cognitive (max 3 choix par écran)

### 2️⃣ TABLEAU DE BORD FAMILLE (Vue d'ensemble)
**Widgets clés :**
- 🎯 Score santé famille (0-100) - Gamification
- 📊 Répartition macros par membre
- ⚠️ Alertes nutritionnelles (ex : "Julie manque de fer")
- 💰 Économies réalisées vs avant
- 🏆 Objectifs atteints cette semaine

**KPI affichés :**
- Repas validés / Repas planifiés
- Budget utilisé / Budget prévu
- Tendance poids famille (si partagé)

### 3️⃣ MEAL PLANNING MULTI-PROFILS
**Modes disponibles :**
1. **Mode Unifié** : Un plan pour tous (portions adaptées auto)
2. **Mode Hybride** : Repas communs + spécifiques (ex : sans gluten pour 1)
3. **Mode Individuel** : Plans séparés avec liste courses commune

**Algorithme d'adaptation :**
```
Pour chaque repas :
- Calcul besoins caloriques par membre
- Ajustement portions selon âge/poids
- Détection incompatibilités (allergies, régimes)
- Proposition alternatives si conflit
- Optimisation coût/variété
```

### 4️⃣ LISTE COURSES COLLABORATIVE
**Fonctionnalités PRO :**
- ✅ Agrégation intelligente ("200g riz" + "150g riz" = "350g riz")
- 🏪 Regroupement par rayon (comme Auchan, Carrefour)
- 💰 Estimation prix + comparateur enseignes
- 👥 Mode collaboratif (qui achète quoi)
- 📱 Partage temps réel (synchro famille)
- 🔄 Historique + réutilisation listes

### 5️⃣ COACH IA FAMILIAL
**Personnalisation par membre :**
- Enfant : "Bravo Paul ! Tu as mangé tes légumes 🥦"
- Ado : "Marie, pense à ton snack avant le sport 🏃‍♀️"
- Adulte : "Objectif -500g atteint cette semaine ! 🎉"
- Senior : "Hydratation : as-tu bu 1,5L aujourd'hui ? 💧"

**Insights médicaux :**
- Détection carences (Fer, Vit D, Calcium)
- Suggestions préventives (+ poisson gras si Oméga-3 bas)
- Alertes déséquilibres (trop de sucre/sel)

---

## 🔐 Sécurité & Conformité

### RGPD Famille
- Consentement explicite pour données enfants (<15 ans)
- Droit à l'oubli par membre
- Export données médicales (format PDF)
- Logs accès données sensibles

### Données Médicales (HDS - Hébergement Données de Santé)
- Encryption AES-256 au repos
- TLS 1.3 en transit
- Anonymisation pour analytics
- Backup 3-2-1 (3 copies, 2 supports, 1 off-site)

---

## 💡 Fonctionnalités Innovantes

### 1. Détection Automatique Allergies Croisées
Ex : Allergie latex → Alerte sur avocat, banane, kiwi

### 2. Courbes de Croissance Enfants (Carnets de Santé Digitaux)
- Comparaison avec courbes INSERM
- Alertes si sortie de corridors
- Export PDF pour pédiatre

### 3. Budget Prévisionnel Intelligent
- Analyse historique dépenses
- Prédiction budget mois prochain
- Conseils optimisation (marques distributeurs, vrac, saisonnalité)

### 4. Challenges Famille
- "Semaine zéro gaspillage"
- "5 légumes/jour toute la famille"
- Récompenses virtuelles + réelles (partenariats marques)

### 5. Partage Recettes Favorites
- Chaque membre note les recettes
- Algorithme apprend préférences familiales
- "Top 10 recettes famille du mois"

---

## 📈 Métriques de Succès

### Métriques Santé (Outcome)
- % familles respectant ANC par membre
- Réduction carences détectées (-50% en 3 mois)
- Amélioration équilibre alimentaire (score +30%)

### Métriques Produit (Output)
- Activation : 80% familles créent 1er plan < 24h
- Engagement : 60% MAU (Monthly Active Users)
- Rétention : 70% à M3, 50% à M6
- NPS (Net Promoter Score) : >60

### Métriques Business
- ARPU Famille : 15-20€/mois (vs 8€ solo)
- LTV/CAC : >3
- Churn : <5%/mois
- Upsell Premium : 40% des familles

---

## 🚀 Roadmap Implémentation

### Phase 1 - MVP Famille (4 semaines)
- [x] Schéma DB famille + membres
- [ ] Onboarding famille intégré
- [ ] Dashboard basique
- [ ] Meal planning multi-profils
- [ ] Liste courses partagée

### Phase 2 - Coach & Insights (3 semaines)
- [ ] Coach IA personnalisé par membre
- [ ] Alertes nutritionnelles
- [ ] Courbes croissance enfants
- [ ] Export données santé

### Phase 3 - Collaboration & Gamification (3 semaines)
- [ ] Mode collaboratif temps réel
- [ ] Challenges famille
- [ ] Partage recettes & favoris
- [ ] Invitations & gestion membres

### Phase 4 - Optimisation & Scale (2 semaines)
- [ ] Performance (cache, CDN)
- [ ] Tests A/B onboarding
- [ ] Intégrations (balances connectées, wearables)
- [ ] API partenaires (Auchan Drive, etc.)

---

## 💼 Modèle de Pricing

### Offres Famille
1. **Famille Starter** (2-3 membres) : 12€/mois
2. **Famille Plus** (4-5 membres) : 18€/mois
3. **Famille Premium** (6+ membres) : 25€/mois

**Inclus :**
- Plans personnalisés illimités
- Coach IA famille
- Listes courses intelligentes
- Suivi santé & croissance
- Export carnets santé

**Options payantes :**
- Consultation nutritionniste en ligne (+20€/mois)
- Intégration courses automatiques Auchan/Carrefour (+5€/mois)
- Analyse ADN nutritionnelle (one-shot 99€)

---

## 🎓 Éducation Nutritionnelle Intégrée

### Pour les Parents
- Fiches pratiques équilibre alimentaire
- Vidéos courtes (30s) nutrition
- Notifications éducatives ("Le saviez-vous ?")

### Pour les Enfants
- Mini-jeux nutrition ludiques
- Mascotte coach (ex : "Nutri le lapin")
- Récompenses pour bonnes habitudes

---

*Ce document évolue avec les retours utilisateurs et les avancées médicales.*


