#!/bin/bash

echo "🧪 Testing NGBilling Docker Setup"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if a service is running
check_service() {
    local service=$1
    local port=$2
    local name=$3
    
    echo -n "Checking $name... "
    if curl -s http://localhost:$port/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ OK${NC}"
        return 0
    else
        echo -e "${RED}❌ FAILED${NC}"
        return 1
    fi
}

# Function to check database connection
check_database() {
    echo -n "Checking MySQL database... "
    if docker exec ngbilling-mysql mysqladmin ping -h localhost -u ngbilling -pngbilling123 > /dev/null 2>&1; then
        echo -e "${GREEN}✅ OK${NC}"
        return 0
    else
        echo -e "${RED}❌ FAILED${NC}"
        return 1
    fi
}

# Function to check admin user
check_admin() {
    echo -n "Checking admin user... "
    local result=$(docker exec ngbilling-mysql mysql -u ngbilling -pngbilling123 ngbilling -e "SELECT COUNT(*) as count FROM users WHERE email='admin@ngbilling.com';" -s 2>/dev/null | tail -n 1)
    if [ "$result" = "1" ]; then
        echo -e "${GREEN}✅ OK${NC}"
        return 0
    else
        echo -e "${RED}❌ FAILED${NC}"
        return 1
    fi
}

# Main test
echo "Starting tests..."

# Wait for services to be ready
echo -e "${YELLOW}Waiting for services to start...${NC}"
sleep 30

# Check services
echo ""
echo "🔍 Service Health Checks:"
check_service "backend" "3001" "Backend API"
check_service "frontend" "3000" "Frontend App"

echo ""
echo "🗄️ Database Checks:"
check_database
check_admin

echo ""
echo "📊 Summary:"
echo "==========="

if check_service "backend" "3001" "Backend" > /dev/null && \
   check_service "frontend" "3000" "Frontend" > /dev/null && \
   check_database > /dev/null && \
   check_admin > /dev/null; then
    echo -e "${GREEN}🎉 All tests passed! NGBilling is running correctly.${NC}"
    echo ""
    echo "🌐 Access your application:"
    echo "   Frontend: http://localhost:3000"
    echo "   Backend:  http://localhost:3001"
    echo ""
    echo "🔐 Admin credentials:"
    echo "   Email: admin@ngbilling.com"
    echo "   Password: admin123"
    echo ""
    echo "⚠️  Remember to change the admin password!"
else
    echo -e "${RED}❌ Some tests failed. Check the logs:${NC}"
    echo "   docker-compose logs"
    exit 1
fi 