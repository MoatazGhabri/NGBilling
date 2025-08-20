@echo off
echo 🔄 Restarting NGBilling services with optimized MySQL configuration...

echo ⏹️  Stopping services...
docker-compose down

echo ⚠️  WARNING: This will delete all existing data!
set /p confirm="Do you want to continue? (y/N): "
if /i not "%confirm%"=="y" (
    echo ❌ Operation cancelled
    pause
    exit /b 1
)

echo 🗑️  Removing MySQL volume...
docker volume rm ngbilling-main_mysql_data

echo 🚀 Starting services with new configuration...
docker-compose up -d

echo ⏳ Waiting for services to be ready...
timeout /t 30 /nobreak >nul

echo 📊 Checking service status...
docker-compose ps

echo 🔍 Testing MySQL connection...
docker-compose exec mysql mysql -u ngbilling -pngbilling123 -e "SHOW VARIABLES LIKE 'max_allowed_packet';"

echo ✅ Services restarted successfully!
echo 🌐 Frontend: http://localhost:5173
echo 🔧 Backend: http://localhost:3001
echo 🗄️  MySQL: localhost:3306

pause
