import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { IsNotEmpty } from 'class-validator';
import { Client } from './Client';
import { LigneDocument } from './LigneDocument';

@Entity('bons_livraison')
export class BonLivraison {
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

  @Column({ name: 'date_livraison' })
  dateLivraison!: Date;

  @Column({
    type: 'enum',
    enum: ['prepare', 'expediee', 'livree'],
    default: 'prepare'
  })
  statut!: 'prepare' | 'expediee' | 'livree';

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @UpdateDateColumn({ name: 'date_modification' })
  dateModification!: Date;

  // Relations
  @ManyToOne(() => Client, client => client.bonsLivraison)
  @JoinColumn({ name: 'client_id' })
  client!: Client;

  @OneToMany(() => LigneDocument, ligne => ligne.bonLivraison, { cascade: true })
  lignes!: LigneDocument[];
} 