@echo off
echo 🔄 Restarting MySQL container with new configuration...

REM Stop the MySQL container
docker-compose stop mysql

REM Remove the MySQL container (this will preserve the data volume)
docker-compose rm -f mysql

REM Start the MySQL container with new configuration
docker-compose up -d mysql

echo ⏳ Waiting for MySQL to be ready...
timeout /t 30 /nobreak >nul

REM Check if MySQL is running
docker-compose ps mysql | findstr "Up" >nul
if %errorlevel% equ 0 (
    echo ✅ MySQL container is running with new configuration
    echo 📊 New settings applied:
    echo    - max_allowed_packet: 64M
    echo    - innodb_buffer_pool_size: 256M
    echo    - innodb_log_file_size: 64M
    echo    - query_cache_size: 32M
) else (
    echo ❌ MySQL container failed to start
    docker-compose logs mysql
)
