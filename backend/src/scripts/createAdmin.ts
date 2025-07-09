import { AppDataSource } from '../config/database';
import { User } from '../models/User';
import bcrypt from 'bcryptjs';

const createDefaultAdmin = async () => {
  try {
    // Initialize database connection
    await AppDataSource.initialize();
    console.log('✅ Database connection established');

    const userRepository = AppDataSource.getRepository(User);

    // Check if admin already exists
    const existingAdmin = await userRepository.findOne({
      where: { email: 'contact@nathygraph.com' }
    });

    if (existingAdmin) {
      console.log('⚠️  Admin user already exists');
      return;
    }

    // Create default admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const adminUser = userRepository.create({
      email: 'contact@nathygraph.com',
      password: hashedPassword,
      nom: 'Administrateur NGBilling',
      telephone: '0123456789',
      role: 'admin',
      actif: true
    });

    await userRepository.save(adminUser);
    
    console.log('✅ Default admin user created successfully!');
    console.log('📧 Email: contact@nathygraph.com');
    console.log('🔑 Password: admin123');
    console.log('⚠️  Please change the password after first login');

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await AppDataSource.destroy();
  }
};

// Run the script
createDefaultAdmin(); 