import { DataSource } from 'typeorm';
import { config } from 'dotenv';

// Load environment variables
config();

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'ngbilling',
  synchronize: process.env.DB_SYNCHRONIZE === 'true',
  logging: process.env.DB_LOGGING === 'true',
  entities: [__dirname + '/../models/*.ts'],
  migrations: [__dirname + '/../migrations/*.ts'],
  subscribers: [__dirname + '/../subscribers/*.ts'],
  extra: {
    connectionLimit: 10,
    acquireTimeout: 60000,
    timeout: 60000,
    maxIdle: 10,
    idleTimeout: 60000,
    maxPacketSize: 67108864, // 64MB
    charset: 'utf8mb4',
    supportBigNumbers: true,
    bigNumberStrings: true,
    dateStrings: true,
    debug: false,
    trace: false,
    multipleStatements: false,
    flags: [
      '-FOUND_ROWS',
      '-IGNORE_SPACE',
      '+MULTI_STATEMENTS'
    ]
  },
  charset: 'utf8mb4',
  timezone: 'Z',
  maxQueryExecutionTime: 30000, // 30 seconds
});

// Initialize database connection
export const initializeDatabase = async (): Promise<void> => {
  try {
    await AppDataSource.initialize();
    console.log('✅ Database connection established successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}; 