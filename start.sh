#!/bin/sh
# Migration de la base de données avant le démarrage
npx prisma db push --accept-data-loss

# Démarrage de l'application
npm start
