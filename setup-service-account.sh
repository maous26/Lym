#!/bin/bash

# Script pour créer automatiquement le service account et la clé JSON

echo "🔧 Configuration du Service Account pour Vertex AI"
echo ""

# Vérifier que gcloud est installé
if ! command -v gcloud &> /dev/null; then
    echo "❌ gcloud CLI n'est pas installé"
    echo "📥 Installez-le depuis: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Récupérer le project ID depuis .env
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi

if [ -z "$GOOGLE_CLOUD_PROJECT" ]; then
    echo "❌ GOOGLE_CLOUD_PROJECT n'est pas défini dans .env"
    exit 1
fi

echo "📦 Projet: $GOOGLE_CLOUD_PROJECT"
echo ""

# Définir le projet
gcloud config set project $GOOGLE_CLOUD_PROJECT

# Créer le dossier keys
mkdir -p keys

# Nom du service account
SA_NAME="lym-ai-service"
SA_EMAIL="${SA_NAME}@${GOOGLE_CLOUD_PROJECT}.iam.gserviceaccount.com"

echo "🔨 Création du service account: $SA_NAME"

# Créer le service account
gcloud iam service-accounts create $SA_NAME \
    --display-name="LYM AI Service Account" \
    --description="Service account for LYM AI features (Vertex AI)" \
    2>/dev/null || echo "ℹ️  Service account existe déjà"

echo "🔑 Attribution des rôles..."

# Attribuer le rôle Vertex AI User
gcloud projects add-iam-policy-binding $GOOGLE_CLOUD_PROJECT \
    --member="serviceAccount:${SA_EMAIL}" \
    --role="roles/aiplatform.user" \
    --condition=None

echo "📄 Génération de la clé JSON..."

# Créer la clé JSON
gcloud iam service-accounts keys create keys/service-account.json \
    --iam-account=$SA_EMAIL

echo ""
echo "✅ Configuration terminée!"
echo ""
echo "📁 Fichier créé: keys/service-account.json"
echo ""
echo "🔒 IMPORTANT: Ne commitez JAMAIS ce fichier dans Git!"
echo "   Il est déjà dans .gitignore"
echo ""
echo "🚀 Redémarrez votre serveur: npm run dev"
