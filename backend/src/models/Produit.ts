import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { IsNotEmpty, Min } from 'class-validator';
import { LigneDocument } from './LigneDocument';

@Entity('produits')
export class Produit {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  @IsNotEmpty()
  nom!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  @Min(0)
  prix!: number;

  @Column()
  @IsNotEmpty()
  categorie!: string;

  @Column({ default: true })
  actif!: boolean;

  @CreateDateColumn()
  dateCreation!: Date;

  @UpdateDateColumn()
  dateModification!: Date;

  // Relations
  @OneToMany(() => LigneDocument, ligne => ligne.produit)
  lignes!: LigneDocument[];
} 