# MySQL Packet Size Fix

## Problem
The application was experiencing MySQL errors:
```
Error: Got a packet bigger than 'max_allowed_packet' bytes
```

This occurs when MySQL receives query results that exceed the default `max_allowed_packet` setting (usually 1MB or 4MB).

## Root Cause
The issue happens when fetching factures (invoices) with all their relations:
- Large number of factures
- Each facture has multiple line items (`lignes`)
- Each facture has multiple payments (`paiements`)
- Text fields (like `notes`) containing large amounts of data

## Solutions Implemented

### 1. MySQL Configuration Updates
Updated `docker-compose.yml` with MySQL performance settings:
```yaml
command: >
  --default-authentication-plugin=mysql_native_password
  --max_allowed_packet=64M
  --innodb_buffer_pool_size=256M
  --innodb_log_file_size=64M
  --innodb_log_buffer_size=16M
  --query_cache_size=32M
  --tmp_table_size=64M
  --max_heap_table_size=64M
```

### 2. Database Connection Optimization
Enhanced `backend/src/config/database.ts` with:
- Increased `maxPacketSize` to 64MB
- Better connection pooling settings
- Optimized MySQL flags and options

### 3. Query Optimization
Modified `backend/src/controllers/factureController.ts`:
- Added pagination to `getAllFactures` (default: 20 items per page)
- Selective loading of relations (only load `client` by default)
- New `getFactureDetails` endpoint for full data when needed
- Optimized `getFacturesByStatus` with pagination

### 4. New API Endpoints
- `GET /api/v1/factures?page=1&limit=20` - Paginated list with basic info
- `GET /api/v1/factures/:id/details` - Full facture details with all relations

## How to Apply the Fix

### Option 1: Using the Script (Recommended)
```bash
# On Linux/Mac
chmod +x restart-mysql.sh
./restart-mysql.sh

# On Windows
restart-mysql.bat
```

### Option 2: Manual Steps
1. Stop the MySQL container:
   ```bash
   docker-compose stop mysql
   ```

2. Remove the container (data will be preserved):
   ```bash
   docker-compose rm -f mysql
   ```

3. Start with new configuration:
   ```bash
   docker-compose up -d mysql
   ```

4. Wait for MySQL to be ready (check logs):
   ```bash
   docker-compose logs mysql
   ```

### Option 3: Update Existing Container
If you want to keep the existing container running:

1. Connect to MySQL and update settings:
   ```sql
   SET GLOBAL max_allowed_packet = 67108864;
   SET GLOBAL innodb_buffer_pool_size = 268435456;
   ```

2. Update `my.cnf` or restart the container for permanent changes.

## Verification

After applying the fix:

1. Check MySQL configuration:
   ```bash
   docker exec -it ngbilling-mysql mysql -u ngbilling -pngbilling123 -e "SHOW VARIABLES LIKE 'max_allowed_packet';"
   ```

2. Test the API endpoints:
   ```bash
   curl "http://localhost:3001/api/v1/factures?page=1&limit=5"
   ```

3. Monitor logs for any remaining packet size errors.

## Benefits

- ✅ Eliminates packet size errors
- ✅ Improves query performance with pagination
- ✅ Better memory management
- ✅ Scalable for large datasets
- ✅ Maintains data integrity

## Notes

- The default page size is 20 items
- Use the `/details` endpoint only when you need full facture data
- Consider implementing frontend pagination controls
- Monitor database performance after the changes

## Troubleshooting

If you still encounter issues:

1. Check MySQL logs:
   ```bash
   docker-compose logs mysql
   ```

2. Verify the new settings are applied:
   ```bash
   docker exec -it ngbilling-mysql mysql -u ngbilling -pngbilling123 -e "SHOW VARIABLES LIKE '%packet%';"
   ```

3. Increase the packet size further if needed (128M, 256M)
4. Check if there are extremely large text fields in your data
