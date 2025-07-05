import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api/v1';

const createAdmin = async () => {
  console.log('🔧 Creating default admin user...\n');

  try {
    // Check if admin already exists by trying to login
    try {
      const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
        email: 'admin@ngbilling.com',
        password: 'admin123'
      });
      
      if (loginResponse.data.success) {
        console.log('✅ Admin user already exists and can login');
        console.log('📧 Email: admin@ngbilling.com');
        console.log('🔑 Password: admin123');
        return;
      }
    } catch (loginError) {
      // Login failed, so we need to create the admin
    }

    // Create admin user
    const adminData = {
      email: 'admin@ngbilling.com',
      password: 'admin123',
      nom: 'Administrateur NGBilling',
      telephone: '0123456789'
    };

    const response = await axios.post(`${API_BASE_URL}/auth/register`, adminData);
    
    if (response.data.success) {
      console.log('✅ Default admin user created successfully!');
      console.log('📧 Email: admin@ngbilling.com');
      console.log('🔑 Password: admin123');
      console.log('⚠️  Please change the password after first login');
      console.log('\n🎉 You can now login to the application!');
    } else {
      console.log('❌ Failed to create admin user:', response.data.message);
    }

  } catch (error) {
    console.error('❌ Error creating admin user:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Message:', error.response.data.message);
    } else {
      console.error('Error:', error.message);
    }
    console.log('\n💡 Make sure the backend is running on http://localhost:3001');
  }
};

// Run the script
createAdmin(); 