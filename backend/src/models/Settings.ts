import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('settings')
export class Settings {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'json' })
  data!: {
    userProfile?: {
      name?: string;
      email?: string;
    };
    company?: {
      name?: string;
      siret?: string;
      matricule?: string;
      address?: string;
      telephone?: string;
      email?: string;
      rib?: string;
      logo?: string;
    };
    emailConfig?: {
      smtp?: string;
      port?: number;
    };
  };
} 