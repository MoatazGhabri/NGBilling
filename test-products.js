import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api/v1';

const testProducts = async () => {
  console.log('🧪 Testing Products API...\n');

  try {
    // First login to get token
    console.log('1. Logging in...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'admin@ngbilling.com',
      password: 'admin123'
    });
    
    if (!loginResponse.data.success) {
      throw new Error('Login failed');
    }
    
    const token = loginResponse.data.data.token;
    console.log('✅ Login successful');
    
    // Test products API
    console.log('\n2. Testing products API...');
    const productsResponse = await axios.get(`${API_BASE_URL}/produits`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Products API response:', productsResponse.data);
    console.log('📦 Products found:', productsResponse.data.data?.length || 0);
    
    if (productsResponse.data.data && productsResponse.data.data.length > 0) {
      console.log('📋 Sample product:', productsResponse.data.data[0]);
    }
    
  } catch (error) {
    console.error('❌ Error testing products API:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Message:', error.response.data.message);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
};

// Run the test
testProducts(); 