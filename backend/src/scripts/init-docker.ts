import { AppDataSource } from '../config/database';
import { User } from '../models/User';
import bcrypt from 'bcryptjs';

const initializeDatabase = async () => {
  try {
    console.log('🚀 Starting database initialization...');
    
    // Initialize database connection
    await AppDataSource.initialize();
    console.log('✅ Database connection established');

    // Run migrations
    console.log('📦 Running database migrations...');
    await AppDataSource.runMigrations();
    console.log('✅ Migrations completed');

    // Create admin user
    console.log('👤 Creating admin user...');
    const userRepository = AppDataSource.getRepository(User);

    // Check if admin already exists
    const existingAdmin = await userRepository.findOne({
      where: { email: 'admin@ngbilling.com' }
    });

    if (existingAdmin) {
      console.log('⚠️  Admin user already exists');
    } else {
      // Create default admin user
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      const adminUser = userRepository.create({
        email: 'admin@ngbilling.com',
        password: hashedPassword,
        nom: 'Administrateur NGBilling',
        telephone: '0123456789',
        role: 'admin',
        actif: true
      });

      await userRepository.save(adminUser);
      
      console.log('✅ Default admin user created successfully!');
      console.log('📧 Email: admin@ngbilling.com');
      console.log('🔑 Password: admin123');
      console.log('⚠️  Please change the password after first login');
    }

    console.log('🎉 Database initialization completed successfully!');

  } catch (error) {
    console.error('❌ Error during database initialization:', error);
    process.exit(1);
  } finally {
    await AppDataSource.destroy();
  }
};

// Run the initialization
initializeDatabase(); 