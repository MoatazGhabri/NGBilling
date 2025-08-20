#!/bin/bash

echo "🔄 Restarting NGBilling services with optimized MySQL configuration..."

# Stop all services
echo "⏹️  Stopping services..."
docker-compose down

# Remove MySQL volume to apply new configuration (WARNING: This will delete all data!)
echo "⚠️  WARNING: This will delete all existing data!"
read -p "Do you want to continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Operation cancelled"
    exit 1
fi

echo "🗑️  Removing MySQL volume..."
docker volume rm ngbilling-main_mysql_data

# Start services with new configuration
echo "🚀 Starting services with new configuration..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 30

# Check service status
echo "📊 Checking service status..."
docker-compose ps

# Test MySQL connection
echo "🔍 Testing MySQL connection..."
docker-compose exec mysql mysql -u ngbilling -pngbilling123 -e "SHOW VARIABLES LIKE 'max_allowed_packet';"

echo "✅ Services restarted successfully!"
echo "🌐 Frontend: http://localhost:5173"
echo "🔧 Backend: http://localhost:3001"
echo "🗄️  MySQL: localhost:3306"
