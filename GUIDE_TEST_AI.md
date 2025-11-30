# 🧪 Guide de Test - Assistant Chef IA

## ✅ Tests API Réussis
- Generative AI (Gemini): ✅ PASS
- Vertex AI (Imagen): ✅ PASS

## 📝 Comment Tester l'Assistant Chef

### 1. Accéder à l'Assistant
1. Ouvrez l'application: http://localhost:3000
2. Allez dans **Repas** (onglet du bas)
3. Cliquez sur le bouton **+** à côté de n'importe quel repas (Petit-déjeuner, Déjeuner, etc.)
4. Cliquez sur l'onglet **Assistant IA**

### 2. Mode "Je décris" (Analyse manuelle)
1. Sélectionnez **"Je décris"**
2. Tapez une description: `Salade César avec poulet grillé`
3. Cliquez sur l'icône **Chef** (chapeau)
4. ⏳ Attendez 3-5 secondes
5. ✅ La recette devrait apparaître avec:
   - Titre
   - Macros (Calories, Protéines, Glucides, Lipides)
   - 5 étoiles pour noter
   - Bouton "Ajouter ce repas"
   - Bouton image (icône 🖼️)

### 3. Mode "Suggère-moi" (Suggestion intelligente)
1. Sélectionnez **"Suggère-moi"**
2. Cliquez sur **"Générer une suggestion parfaite"**
3. ⏳ Attendez 3-5 secondes
4. ✅ L'IA analyse votre journée et propose un repas adapté
5. Badge **"Base de données"** si la recette existe déjà

### 4. Générer une Photo
1. Une fois la recette affichée
2. Cliquez sur l'icône **🖼️** (image)
3. ⏳ Attendez 5-10 secondes (Vertex AI)
4. ✅ L'image apparaît en grand au-dessus des macros

### 5. Noter la Recette
1. Cliquez sur les **étoiles** (1-5)
2. ✅ La note est sauvegardée en base de données

### 6. Ajouter au Repas
1. Cliquez sur **"Ajouter ce repas"**
2. ✅ Le plat est ajouté au type de repas sélectionné (breakfast, lunch, etc.)
3. ✅ Vous êtes redirigé vers la page Repas
4. ✅ Le plat apparaît dans votre journal avec tous ses macros

## 🔍 Vérifications

### Console du Navigateur (F12)
Vous devriez voir:
```
Generate recipe result: { success: true, recipe: {...} }
Setting recipe: { title: "...", macros: {...} }
```

### Console du Serveur
Vous devriez voir:
```
prisma:query INSERT INTO `main`.`Recipe` ...
POST /meals/add?type=breakfast&date=2025-11-29 200 in 4.1s
```

## ⚠️ Problèmes Possibles

### La recette ne s'affiche pas
1. Ouvrez la console du navigateur (F12)
2. Vérifiez les logs `console.log("Setting recipe:", ...)`
3. Vérifiez qu'il n'y a pas d'erreurs rouges

### L'image ne se génère pas
1. Vérifiez que `GOOGLE_CLOUD_PROJECT` est dans `.env`
2. Vérifiez que vous avez les credentials GCP
3. Un message d'erreur devrait apparaître sous le bouton

### Le repas ne s'ajoute pas
1. Vérifiez que vous êtes bien sur `/meals/add?type=breakfast&date=...`
2. Le bouton "Ajouter ce repas" devrait vous rediriger
3. Vérifiez dans la page Repas que le plat apparaît

## 🎯 Fonctionnalités Complètes

✅ Génération de recettes avec Gemini 2.0
✅ Base de données SQLite (Prisma)
✅ Réutilisation des recettes existantes
✅ Génération d'images avec Vertex AI Imagen 3.0
✅ Système de notation (1-5 étoiles)
✅ Ajout automatique au bon type de repas
✅ Calcul intelligent basé sur les besoins nutritionnels
✅ Affichage des macros détaillés
