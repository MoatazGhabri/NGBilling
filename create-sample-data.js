import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api/v1';

const createSampleData = async () => {
  console.log('🧪 Creating sample data...\n');

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
    
    // Create sample clients
    console.log('\n2. Creating sample clients...');
    const sampleClients = [
      {
        nom: 'Entreprise ABC',
        email: 'contact@abc.com',
        telephone: '0123456789',
        adresse: '123 Rue de la Paix',
        ville: 'Paris',
        codePostal: '75001',
        pays: 'France',
        totalFacture: 0
      },
      {
        nom: 'Société XYZ',
        email: 'info@xyz.com',
        telephone: '0987654321',
        adresse: '456 Avenue des Champs',
        ville: 'Lyon',
        codePostal: '69001',
        pays: 'France',
        totalFacture: 0
      },
      {
        nom: 'Studio Créatif',
        email: 'hello@studio.com',
        telephone: '0555666777',
        adresse: '789 Boulevard de l\'Innovation',
        ville: 'Marseille',
        codePostal: '13001',
        pays: 'France',
        totalFacture: 0
      }
    ];

    for (const client of sampleClients) {
      try {
        const response = await axios.post(`${API_BASE_URL}/clients`, client, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`✅ Created client: ${client.nom}`);
      } catch (error) {
        if (error.response?.status === 400 && error.response.data.message.includes('existe déjà')) {
          console.log(`⚠️  Client already exists: ${client.nom}`);
        } else {
          console.log(`❌ Failed to create client ${client.nom}:`, error.response?.data?.message);
        }
      }
    }

    // Create sample products
    console.log('\n3. Creating sample products...');
    const sampleProducts = [
      {
        nom: 'Design de Logo',
        description: 'Création d\'un logo professionnel personnalisé',
        prix: 299.99,
        stock: 999,
        categorie: 'Design',
        reference: 'DES-LOGO-001'
      },
      {
        nom: 'Site Web Vitrine',
        description: 'Site web responsive avec design moderne',
        prix: 1499.99,
        stock: 999,
        categorie: 'Développement',
        reference: 'DEV-SITE-001'
      },
      {
        nom: 'Application Mobile',
        description: 'Application mobile iOS et Android',
        prix: 2999.99,
        stock: 999,
        categorie: 'Développement',
        reference: 'DEV-APP-001'
      },
      {
        nom: 'Banner Publicitaire',
        description: 'Banner publicitaire pour réseaux sociaux',
        prix: 99.99,
        stock: 999,
        categorie: 'Marketing',
        reference: 'MKT-BANNER-001'
      },
      {
        nom: 'Consultation UX/UI',
        description: 'Audit et amélioration de l\'expérience utilisateur',
        prix: 199.99,
        stock: 999,
        categorie: 'Consultation',
        reference: 'CONS-UX-001'
      }
    ];

    for (const product of sampleProducts) {
      try {
        const response = await axios.post(`${API_BASE_URL}/produits`, product, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`✅ Created product: ${product.nom}`);
      } catch (error) {
        if (error.response?.status === 400 && error.response.data?.message?.includes('existe déjà')) {
          console.log(`⚠️  Product already exists: ${product.nom}`);
        } else {
          console.log(`❌ Failed to create product ${product.nom}:`, error.response?.data?.message || error.message);
        }
      }
    }

    console.log('\n🎉 Sample data creation completed!');
    console.log('📝 You can now test the forms with real data.');
    
  } catch (error) {
    console.error('❌ Error creating sample data:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Message:', error.response.data.message);
    } else {
      console.error('Error:', error.message);
    }
  }
};

// Run the script
createSampleData(); 