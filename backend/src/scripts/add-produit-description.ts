import { AppDataSource } from '../config/database';

async function addProduitDescription() {
  try {
    await AppDataSource.initialize();
    console.log('✅ Connexion à la base de données établie');

    // Ajouter la colonne produit_description à la table lignes_document
    await AppDataSource.query(`
      ALTER TABLE lignes_document 
      ADD COLUMN IF NOT EXISTS produit_description TEXT NULL;
    `);

    console.log('✅ Colonne produit_description ajoutée avec succès');
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout de la colonne:', error);
  } finally {
    await AppDataSource.destroy();
    console.log('✅ Connexion à la base de données fermée');
  }
}

// Exécuter le script
addProduitDescription().catch(console.error); 