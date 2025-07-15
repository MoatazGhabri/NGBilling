import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { IsNotEmpty, Min } from 'class-validator';
import { Facture } from './Facture';

@Entity('paiements')
export class Paiement {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'facture_id' })
  factureId!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  @Min(0)
  montant!: number;

  @CreateDateColumn({ name: 'date_paiement' })
  datePaiement!: Date;

  @Column({
    type: 'enum',
    enum: ['especes', 'carte', 'virement', 'cheque', 'paypal', 'stripe'],
    default: 'virement'
  })
  methode!: 'especes' | 'carte' | 'virement' | 'cheque' | 'paypal' | 'stripe';

  @Column({ nullable: true })
  reference?: string;

  @Column({
    type: 'enum',
    enum: ['en_attente', 'confirme', 'refuse'],
    default: 'en_attente'
  })
  statut!: 'en_attente' | 'confirme' | 'refuse';

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @UpdateDateColumn({ name: 'date_modification' })
  dateModification!: Date;

  // Relations
  @ManyToOne(() => Facture, facture => facture.paiements, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'facture_id' })
  facture!: Facture;
} 