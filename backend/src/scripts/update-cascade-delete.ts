import { DataSource } from 'typeorm';
import { AppDataSource } from '../config/database';

async function updateCascadeDelete() {
  try {
    await AppDataSource.initialize();
    console.log('✅ Connexion à la base de données établie');

    // Supprimer les contraintes de clés étrangères existantes
    await AppDataSource.query(`
      -- Supprimer les contraintes FK existantes pour factures
      ALTER TABLE factures DROP CONSTRAINT IF EXISTS FK_factures_client_id;
      ALTER TABLE factures DROP CONSTRAINT IF EXISTS fk_factures_client_id;
      
      -- Supprimer les contraintes FK existantes pour devis
      ALTER TABLE devis DROP CONSTRAINT IF EXISTS FK_devis_client_id;
      ALTER TABLE devis DROP CONSTRAINT IF EXISTS fk_devis_client_id;
      
      -- Supprimer les contraintes FK existantes pour bons_livraison
      ALTER TABLE bons_livraison DROP CONSTRAINT IF EXISTS FK_bons_livraison_client_id;
      ALTER TABLE bons_livraison DROP CONSTRAINT IF EXISTS fk_bons_livraison_client_id;
      
      -- Supprimer les contraintes FK existantes pour paiements
      ALTER TABLE paiements DROP CONSTRAINT IF EXISTS FK_paiements_facture_id;
      ALTER TABLE paiements DROP CONSTRAINT IF EXISTS fk_paiements_facture_id;
      
      -- Supprimer les contraintes FK existantes pour lignes_document
      ALTER TABLE lignes_document DROP CONSTRAINT IF EXISTS FK_lignes_document_facture_id;
      ALTER TABLE lignes_document DROP CONSTRAINT IF EXISTS fk_lignes_document_facture_id;
      ALTER TABLE lignes_document DROP CONSTRAINT IF EXISTS FK_lignes_document_devis_id;
      ALTER TABLE lignes_document DROP CONSTRAINT IF EXISTS fk_lignes_document_devis_id;
      ALTER TABLE lignes_document DROP CONSTRAINT IF EXISTS FK_lignes_document_bon_livraison_id;
      ALTER TABLE lignes_document DROP CONSTRAINT IF EXISTS fk_lignes_document_bon_livraison_id;
      ALTER TABLE lignes_document DROP CONSTRAINT IF EXISTS FK_lignes_document_produit_id;
      ALTER TABLE lignes_document DROP CONSTRAINT IF EXISTS fk_lignes_document_produit_id;
    `);

    // Ajouter les nouvelles contraintes avec CASCADE DELETE
    await AppDataSource.query(`
      -- Ajouter les contraintes FK avec CASCADE DELETE pour factures
      ALTER TABLE factures 
      ADD CONSTRAINT FK_factures_client_id 
      FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE;
      
      -- Ajouter les contraintes FK avec CASCADE DELETE pour devis
      ALTER TABLE devis 
      ADD CONSTRAINT FK_devis_client_id 
      FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE;
      
      -- Ajouter les contraintes FK avec CASCADE DELETE pour bons_livraison
      ALTER TABLE bons_livraison 
      ADD CONSTRAINT FK_bons_livraison_client_id 
      FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE;
      
      -- Ajouter les contraintes FK avec CASCADE DELETE pour paiements
      ALTER TABLE paiements 
      ADD CONSTRAINT FK_paiements_facture_id 
      FOREIGN KEY (facture_id) REFERENCES factures(id) ON DELETE CASCADE;
      
      -- Ajouter les contraintes FK avec CASCADE DELETE pour lignes_document
      ALTER TABLE lignes_document 
      ADD CONSTRAINT FK_lignes_document_facture_id 
      FOREIGN KEY (facture_id) REFERENCES factures(id) ON DELETE CASCADE;
      
      ALTER TABLE lignes_document 
      ADD CONSTRAINT FK_lignes_document_devis_id 
      FOREIGN KEY (devis_id) REFERENCES devis(id) ON DELETE CASCADE;
      
      ALTER TABLE lignes_document 
      ADD CONSTRAINT FK_lignes_document_bon_livraison_id 
      FOREIGN KEY (bon_livraison_id) REFERENCES bons_livraison(id) ON DELETE CASCADE;
      
      ALTER TABLE lignes_document 
      ADD CONSTRAINT FK_lignes_document_produit_id 
      FOREIGN KEY (produit_id) REFERENCES produits(id) ON DELETE CASCADE;
    `);

    console.log('✅ Contraintes de suppression en cascade ajoutées avec succès');
    
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour des contraintes:', error);
  } finally {
    await AppDataSource.destroy();
    console.log('✅ Connexion à la base de données fermée');
  }
}

// Exécuter le script
updateCascadeDelete().catch(console.error); 