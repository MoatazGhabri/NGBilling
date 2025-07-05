import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api/v1';

// Test configuration
const testUser = {
  email: 'admin@ngbilling.com',
  password: 'admin123',
  nom: 'Administrateur NGBilling',
  telephone: '0123456789'
};

async function testAPI() {
  console.log('🧪 Testing NGBilling API...\n');

  try {
    // Test 1: Register a new user
    console.log('1. Testing user registration...');
    const registerResponse = await axios.post(`${API_BASE_URL}/auth/register`, testUser);
    console.log('✅ Registration successful:', registerResponse.data.message);
    
    // Test 2: Login
    console.log('\n2. Testing user login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    console.log('✅ Login successful:', loginResponse.data.message);
    
    const token = loginResponse.data.data.token;
    
    // Test 3: Get user profile
    console.log('\n3. Testing get profile...');
    const profileResponse = await axios.get(`${API_BASE_URL}/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Profile retrieved:', profileResponse.data.data.user.email);
    
    // Test 4: Create a client
    console.log('\n4. Testing client creation...');
    const clientData = {
      nom: 'Test Client',
      email: 'client@test.com',
      telephone: '0987654321',
      adresse: '123 Test Street',
      ville: 'Test City',
      codePostal: '12345',
      pays: 'France',
      totalFacture: 0
    };
    
    const clientResponse = await axios.post(`${API_BASE_URL}/clients`, clientData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Client created:', clientResponse.data.message);
    
    // Test 5: Get all clients
    console.log('\n5. Testing get clients...');
    const clientsResponse = await axios.get(`${API_BASE_URL}/clients`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Clients retrieved:', clientsResponse.data.data.length, 'clients found');
    
    // Test 6: Create a product
    console.log('\n6. Testing product creation...');
    const productData = {
      nom: 'Test Product',
      description: 'A test product',
      prix: 99.99,
      stock: 10,
      categorie: 'Test'
    };
    
    const productResponse = await axios.post(`${API_BASE_URL}/produits`, productData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Product created:', productResponse.data.message);
    
    // Test 7: Get all products
    console.log('\n7. Testing get products...');
    const productsResponse = await axios.get(`${API_BASE_URL}/produits`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Products retrieved:', productsResponse.data.data.length, 'products found');
    
    console.log('\n🎉 All API tests passed successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Start the frontend: npm run dev');
    console.log('2. Open http://localhost:5173');
    console.log('3. Login with admin@ngbilling.com and password: admin123');
    
  } catch (error) {
    console.error('\n❌ API test failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Message:', error.response.data.message);
    } else {
      console.error('Error:', error.message);
    }
    console.log('\n💡 Make sure the backend is running on http://localhost:3001');
  }
}

// Run the test
testAPI(); 