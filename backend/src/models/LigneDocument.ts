import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Min } from 'class-validator';
import { Produit } from './Produit';
import { Facture } from './Facture';
import { Devis } from './Devis';
import { BonLivraison } from './BonLivraison';

@Entity('lignes_document')
export class LigneDocument {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'produit_id' })
  produitId!: string;

  @Column({ name: 'produit_nom' })
  produitNom!: string;

  @Column({ name: 'produit_description', nullable: true })
  produitDescription?: string;

  @Column({ type: 'int' })
  @Min(1)
  quantite!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'prix_unitaire' })
  @Min(0)
  prixUnitaire!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  @Min(0)
  total!: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  remise!: number;

  // Relations
  @ManyToOne(() => Produit, produit => produit.lignes)
  @JoinColumn({ name: 'produit_id' })
  produit!: Produit;

  @ManyToOne(() => Facture, facture => facture.lignes, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'facture_id' })
  facture?: Facture;

  @ManyToOne(() => Devis, devis => devis.lignes, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'devis_id' })
  devis?: Devis;

  @ManyToOne(() => BonLivraison, bonLivraison => bonLivraison.lignes, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'bon_livraison_id' })
  bonLivraison?: BonLivraison;
} 