-- MySQL Configuration for NGBilling
-- This file sets optimal MySQL settings for the application

-- Set global variables for better performance
SET GLOBAL max_allowed_packet = 67108864; -- 64MB
SET GLOBAL innodb_buffer_pool_size = 536870912; -- 512MB
SET GLOBAL innodb_log_file_size = 268435456; -- 256MB
SET GLOBAL innodb_log_buffer_size = 16777216; -- 16MB
SET GLOBAL innodb_flush_log_at_trx_commit = 2;
SET GLOBAL innodb_flush_method = 'O_DIRECT';

-- Set session variables
SET SESSION max_allowed_packet = 67108864; -- 64MB
SET SESSION sql_mode = 'STRICT_TRANS_TABLES,NO_ZERO_DATE,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO';

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS ngbilling CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Use the database
USE ngbilling;

-- Show current settings for verification
SHOW VARIABLES LIKE 'max_allowed_packet';
SHOW VARIABLES LIKE 'innodb_buffer_pool_size';
SHOW VARIABLES LIKE 'innodb_log_file_size';
