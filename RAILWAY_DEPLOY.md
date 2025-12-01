# Déploiement sur Railway

## Variables d'environnement nécessaires

Configurez ces variables dans Railway Settings > Variables :

### Essentielles
- `DATABASE_URL` - Automatique si vous utilisez Railway PostgreSQL
- `PORT` - Automatique (Railway le configure à 8080)

### Google Cloud AI (Gemini)
- `GOOGLE_CLOUD_PROJECT` - ID de votre projet Google Cloud (requis)
- `GOOGLE_CLOUD_LOCATION` - Région (optionnel, défaut: us-central1)
- `GOOGLE_SERVICE_ACCOUNT_KEY` - Contenu JSON complet de votre service account

**Important :** Pour les credentials Google Cloud sur Railway :
1. Copiez le contenu complet de votre `service-account.json`
2. Ajoutez la variable `GOOGLE_SERVICE_ACCOUNT_KEY` avec le JSON complet (pas encodé)
3. Exemple de format :
   ```json
   {"type":"service_account","project_id":"your-project",...}
   ```

### Optionnelles
- `OPENAI_API_KEY` - Si vous utilisez OpenAI
- `NEXT_PUBLIC_API_URL` - URL publique de votre application

## Configuration du build

Railway détecte automatiquement Next.js. Le fichier `railway.json` optimise le déploiement :

- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm run railway:start`
  - Exécute `prisma db push` pour synchroniser la base
  - Lance le serveur Next.js avec `next start`

## Healthcheck

Le healthcheck est configuré pour vérifier `/` avec un timeout de 300 secondes.

## Troubleshooting

### L'application crash au démarrage
1. Vérifiez que `DATABASE_URL` est correctement configurée
2. Vérifiez les logs Railway pour les erreurs spécifiques
3. Assurez-vous que toutes les variables d'environnement sont configurées

### Erreurs Prisma
Si vous voyez des erreurs lors du `prisma db push` :
- Vérifiez que la base de données est accessible
- Assurez-vous que `DATABASE_URL` est au bon format

### Erreurs Google Cloud AI
Si vous voyez "Could not load credentials" ou "Vertex AI is not configured" :
1. Vérifiez que `GOOGLE_CLOUD_PROJECT` est défini
2. Vérifiez que `GOOGLE_SERVICE_ACCOUNT_KEY` contient le JSON complet (pas encodé)
3. Les credentials doivent avoir les permissions nécessaires pour Vertex AI
4. Le service Vertex AI doit être activé dans votre projet Google Cloud

## Redéploiement

Railway redéploie automatiquement à chaque push sur la branche configurée (par défaut : `mobile`).

Pour forcer un redéploiement :
```bash
git commit --allow-empty -m "Force redeploy"
git push origin mobile
```

