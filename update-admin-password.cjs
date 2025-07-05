const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api/v1';

const updateAdminPassword = async () => {
  console.log('🔧 Testing admin passwords...\n');

  try {
    // Try with different passwords
    const testPasswords = ['admin123', 'admin', 'password', '123456', 'admin1234'];
    
    for (const password of testPasswords) {
      try {
        console.log(`🔍 Testing password: ${password}`);
        const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
          email: 'admin@ngbilling.com',
          password: password
        });
        
        if (loginResponse.data.success) {
          console.log('✅ Found working password!');
          console.log('📧 Email: admin@ngbilling.com');
          console.log('🔑 Password:', password);
          return;
        }
      } catch (error) {
        console.log(`❌ Password "${password}" failed:`, error.response?.data?.message || error.message);
      }
    }

    console.log('❌ No working password found');
    console.log('💡 You may need to reset the password in the database');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
};

// Run the script
updateAdminPassword(); 