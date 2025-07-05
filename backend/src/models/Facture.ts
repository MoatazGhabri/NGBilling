import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { IsNotEmpty, Min } from 'class-validator';
import { Client } from './Client';
import { LigneDocument } from './LigneDocument';
import { Paiement } from './Paiement';

@Entity('factures')
export class Facture {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  @IsNotEmpty()
  numero!: string;

  @Column({ name: 'client_id' })
  clientId!: string;

  @Column({ name: 'client_nom' })
  clientNom!: string;

  @CreateDateColumn({ name: 'date_creation' })
  dateCreation!: Date;

  @Column({ name: 'date_echeance' })
  dateEcheance!: Date;

  @Column({
    type: 'enum',
    enum: ['brouillon', 'envoyee', 'payee', 'en_retard', 'annulee'],
    default: 'brouillon'
  })
  statut!: 'brouillon' | 'envoyee' | 'payee' | 'en_retard' | 'annulee';

  @Column({ 
    type: 'decimal', 
    precision: 10, 
    scale: 2, 
    name: 'sous_total',
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  @Min(0)
  sousTotal!: number;

  @Column({ 
    type: 'decimal', 
    precision: 10, 
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  @Min(0)
  tva!: number;

  @Column({ 
    type: 'decimal', 
    precision: 10, 
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  @Min(0)
  total!: number;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @UpdateDateColumn({ name: 'date_modification' })
  dateModification!: Date;

  // Relations
  @ManyToOne(() => Client, client => client.factures)
  @JoinColumn({ name: 'client_id' })
  client!: Client;

  @OneToMany(() => LigneDocument, ligne => ligne.facture, { cascade: true })
  lignes!: LigneDocument[];

  @OneToMany(() => Paiement, paiement => paiement.facture)
  paiements!: Paiement[];
} 