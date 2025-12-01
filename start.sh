#!/bin/bash
set -e

echo "🚀 Starting Lym application..."

# Wait for database to be ready
echo "⏳ Checking database connection..."
max_attempts=30
attempt=0

until npx prisma db push --accept-data-loss --skip-generate 2>/dev/null || [ $attempt -eq $max_attempts ]; do
    attempt=$((attempt+1))
    echo "⏳ Waiting for database... (attempt $attempt/$max_attempts)"
    sleep 2
done

if [ $attempt -eq $max_attempts ]; then
    echo "❌ Database connection failed after $max_attempts attempts"
    exit 1
fi

echo "✅ Database is ready!"
echo "🎯 Starting Next.js server on port ${PORT:-8080}..."

# Start Next.js
exec npm start
