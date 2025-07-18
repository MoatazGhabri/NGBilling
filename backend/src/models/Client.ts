import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { IsEmail, IsNotEmpty } from 'class-validator';
import { Facture } from './Facture';
import { Devis } from './Devis';
import { BonLivraison } from './BonLivraison';

@Entity('clients')
export class Client {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  @IsNotEmpty()
  nom!: string;

  @Column({ unique: true })
  @IsEmail()
  email!: string;

  @Column()
  @IsNotEmpty()
  telephone!: string;

  @Column()
  @IsNotEmpty()
  adresse!: string;

  @Column()
  @IsNotEmpty()
  ville!: string;

  @Column()
  @IsNotEmpty()
  codePostal!: string;

  @Column()
  @IsNotEmpty()
  pays!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalFacture!: number;

  @Column({ unique: true })
  code!: string;

  @Column({ nullable: true })
  mf?: string;

  @CreateDateColumn()
  dateCreation!: Date;

  @UpdateDateColumn()
  dateModification!: Date;

  // Relations
  @OneToMany(() => Facture, facture => facture.client, { onDelete: 'CASCADE' })
  factures!: Facture[];

  @OneToMany(() => Devis, devis => devis.client, { onDelete: 'CASCADE' })
  devis!: Devis[];

  @OneToMany(() => BonLivraison, bonLivraison => bonLivraison.client, { onDelete: 'CASCADE' })
  bonsLivraison!: BonLivraison[];
} 