# Suppression en Cascade - NGBilling

## Vue d'ensemble

La suppression en cascade a été configurée pour maintenir l'intégrité référentielle de la base de données. Lorsqu'un enregistrement parent est supprimé, tous les enregistrements enfants liés sont automatiquement supprimés.

## Relations configurées

### 1. Client (Parent)
- **Client** → **Facture** (CASCADE)
- **Client** → **Devis** (CASCADE)  
- **Client** → **BonLivraison** (CASCADE)

### 2. Facture (Parent)
- **Facture** → **Paiement** (CASCADE)
- **Facture** → **LigneDocument** (CASCADE)

### 3. Devis (Parent)
- **Devis** → **LigneDocument** (CASCADE)

### 4. BonLivraison (Parent)
- **BonLivraison** → **LigneDocument** (CASCADE)

### 5. Produit (Parent)
- **Produit** → **LigneDocument** (CASCADE)

## Comportement

Lorsque vous supprimez :
- **Un client** → Toutes ses factures, devis et bons de livraison sont supprimés
- **Une facture** → Tous ses paiements et lignes de document sont supprimés
- **Un devis** → Toutes ses lignes de document sont supprimées
- **Un bon de livraison** → Toutes ses lignes de document sont supprimées
- **Un produit** → Toutes ses lignes de document sont supprimées

## Application des changements

### Option 1 : Script automatique
```bash
cd backend
npm run update-cascade
```

### Option 2 : Manuel (si le script échoue)
Exécutez les requêtes SQL suivantes dans votre base de données :

```sql
-- Supprimer les contraintes existantes
ALTER TABLE factures DROP CONSTRAINT IF EXISTS FK_factures_client_id;
ALTER TABLE devis DROP CONSTRAINT IF EXISTS FK_devis_client_id;
ALTER TABLE bons_livraison DROP CONSTRAINT IF EXISTS FK_bons_livraison_client_id;
ALTER TABLE paiements DROP CONSTRAINT IF EXISTS FK_paiements_facture_id;
ALTER TABLE lignes_document DROP CONSTRAINT IF EXISTS FK_lignes_document_facture_id;
ALTER TABLE lignes_document DROP CONSTRAINT IF EXISTS FK_lignes_document_devis_id;
ALTER TABLE lignes_document DROP CONSTRAINT IF EXISTS FK_lignes_document_bon_livraison_id;
ALTER TABLE lignes_document DROP CONSTRAINT IF EXISTS FK_lignes_document_produit_id;

-- Ajouter les nouvelles contraintes avec CASCADE DELETE
ALTER TABLE factures ADD CONSTRAINT FK_factures_client_id FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE;
ALTER TABLE devis ADD CONSTRAINT FK_devis_client_id FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE;
ALTER TABLE bons_livraison ADD CONSTRAINT FK_bons_livraison_client_id FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE;
ALTER TABLE paiements ADD CONSTRAINT FK_paiements_facture_id FOREIGN KEY (facture_id) REFERENCES factures(id) ON DELETE CASCADE;
ALTER TABLE lignes_document ADD CONSTRAINT FK_lignes_document_facture_id FOREIGN KEY (facture_id) REFERENCES factures(id) ON DELETE CASCADE;
ALTER TABLE lignes_document ADD CONSTRAINT FK_lignes_document_devis_id FOREIGN KEY (devis_id) REFERENCES devis(id) ON DELETE CASCADE;
ALTER TABLE lignes_document ADD CONSTRAINT FK_lignes_document_bon_livraison_id FOREIGN KEY (bon_livraison_id) REFERENCES bons_livraison(id) ON DELETE CASCADE;
ALTER TABLE lignes_document ADD CONSTRAINT FK_lignes_document_produit_id FOREIGN KEY (produit_id) REFERENCES produits(id) ON DELETE CASCADE;
```

## Vérification

Après l'application des changements, vous pouvez vérifier que les contraintes sont bien en place :

```sql
-- Vérifier les contraintes de clés étrangères
SELECT 
    TABLE_NAME,
    CONSTRAINT_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME,
    DELETE_RULE
FROM information_schema.REFERENTIAL_CONSTRAINTS 
WHERE CONSTRAINT_SCHEMA = 'votre_base_de_donnees';
```

## Avantages

1. **Intégrité des données** : Évite les orphelins dans la base de données
2. **Simplicité** : Plus besoin de gérer manuellement la suppression des enregistrements liés
3. **Cohérence** : Garantit que les données restent cohérentes

## Précautions

⚠️ **Attention** : La suppression en cascade est irréversible. Assurez-vous de :
- Sauvegarder vos données avant d'appliquer les changements
- Tester dans un environnement de développement d'abord
- Informer les utilisateurs du comportement de suppression en cascade 