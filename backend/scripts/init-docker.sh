#!/bin/bash

echo "🚀 Starting NGBilling Docker initialization..."

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
until npx ts-node src/scripts/init-docker.ts; do
  echo "Database not ready, retrying in 5 seconds..."
  sleep 5
done

echo "✅ Database initialization completed!" 