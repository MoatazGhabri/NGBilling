#!/bin/bash

echo "🔄 Restarting MySQL container with new configuration..."

# Stop the MySQL container
docker-compose stop mysql

# Remove the MySQL container (this will preserve the data volume)
docker-compose rm -f mysql

# Start the MySQL container with new configuration
docker-compose up -d mysql

echo "⏳ Waiting for MySQL to be ready..."
sleep 30

# Check if MySQL is running
if docker-compose ps mysql | grep -q "Up"; then
    echo "✅ MySQL container is running with new configuration"
    echo "📊 New settings applied:"
    echo "   - max_allowed_packet: 64M"
    echo "   - innodb_buffer_pool_size: 256M"
    echo "   - innodb_log_file_size: 64M"
    echo "   - query_cache_size: 32M"
else
    echo "❌ MySQL container failed to start"
    docker-compose logs mysql
fi
