# MySQL Optimization for NGBilling

## Problem
The application was experiencing MySQL errors:
```
Error: Got a packet bigger than 'max_allowed_packet' bytes
code: 'ER_NET_PACKET_TOO_LARGE'
```

This error occurs when MySQL tries to process query results that exceed the default `max_allowed_packet` setting.

## Root Cause
The issue was caused by:
1. **Large Query Results**: Complex queries with multiple LEFT JOINs returning large result sets
2. **Default MySQL Settings**: Insufficient `max_allowed_packet` and buffer sizes
3. **Inefficient Data Loading**: Loading all relations (client, lignes, paiements) at once

## Solutions Implemented

### 1. MySQL Configuration Optimization
- **File**: `mysql.cnf`
- **Key Settings**:
  - `max_allowed_packet = 64M` (increased from default ~1MB)
  - `innodb_buffer_pool_size = 512M`
  - `innodb_log_file_size = 256M`
  - Optimized connection and timeout settings

### 2. Docker Compose Updates
- **File**: `docker-compose.yml`
- Added custom MySQL configuration file
- Fixed healthcheck endpoint path
- Optimized MySQL service configuration

### 3. Application Code Optimization
- **File**: `backend/src/controllers/factureController.ts`
- Implemented pagination for facture listings
- Selective relation loading to prevent large packets
- Added separate endpoint for detailed facture data
- Lazy loading approach for large datasets

### 4. Database Connection Optimization
- **File**: `backend/src/config/database.ts`
- Added MySQL-specific connection options
- Increased timeout and buffer settings
- Optimized charset and number handling

## How to Apply the Fixes

### Option 1: Complete Restart (Recommended)
```bash
# Linux/Mac
./restart-services.sh

# Windows
restart-services.bat
```

**⚠️ WARNING**: This will delete all existing data!

### Option 2: Manual Steps
1. **Stop services**:
   ```bash
   docker-compose down
   ```

2. **Remove MySQL volume**:
   ```bash
   docker volume rm ngbilling-main_mysql_data
   ```

3. **Start services**:
   ```bash
   docker-compose up -d
   ```

4. **Wait for services to be ready** (30-60 seconds)

### Option 3: Update Existing Database (Advanced)
If you want to keep existing data, you can manually update MySQL settings:

```sql
-- Connect to MySQL and run:
SET GLOBAL max_allowed_packet = 67108864; -- 64MB
SET GLOBAL innodb_buffer_pool_size = 536870912; -- 512MB
SET GLOBAL innodb_log_file_size = 268435456; -- 256MB
```

## Verification

After restarting, verify the settings:

```bash
# Check MySQL variables
docker-compose exec mysql mysql -u ngbilling -pngbilling123 -e "SHOW VARIABLES LIKE 'max_allowed_packet';"
docker-compose exec mysql mysql -u ngbilling -pngbilling123 -e "SHOW VARIABLES LIKE 'innodb_buffer_pool_size';"

# Check service health
docker-compose ps
```

## Expected Results

- ✅ No more `ER_NET_PACKET_TOO_LARGE` errors
- ✅ Better performance for large datasets
- ✅ Pagination support for facture listings
- ✅ Optimized memory usage
- ✅ Improved query performance

## API Changes

### New Endpoints
- `GET /api/v1/factures?page=1&limit=20` - Paginated facture list
- `GET /api/v1/factures/:id/details` - Detailed facture data

### Updated Endpoints
- `GET /api/v1/factures` - Now returns paginated results with counts instead of full data

## Monitoring

Monitor the application logs for:
- Database connection stability
- Query performance improvements
- Memory usage patterns

## Troubleshooting

If issues persist:
1. Check MySQL logs: `docker-compose logs mysql`
2. Verify configuration: `docker-compose exec mysql cat /etc/mysql/conf.d/custom.cnf`
3. Test database connection: `docker-compose exec mysql mysql -u ngbilling -pngbilling123`

## Performance Tips

1. **Use pagination** for large datasets
2. **Load relations selectively** when possible
3. **Monitor query performance** with slow query logs
4. **Consider database indexing** for frequently queried fields
