import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { OrganizationLanguage } from './organization-language.entity';

export enum OrganizationStatus {
  INACTIVE = 'inactive',
  ACTIVE = 'active',
}

@Entity('organizations')
export class Organization {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  key: string;

  @Column({ type: 'text' })
  name: string;

  // Not unique: the same email can be the first user of several organizations.
  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'text', nullable: true })
  font: string;

  @Column({ type: 'text', nullable: true })
  theme: string;

  @Column({ type: 'text', nullable: true })
  signature: string;

  @Column({ type: 'text', nullable: true })
  language: string;

  // Source language for translations (lowercase ISO: en, fr, es, it, sl, el).
  // `language` above is legacy (uppercase EN/FR) and will be deprecated.
  @Column({ type: 'varchar', length: 5, default: 'en' })
  defaultLanguage: string;

  @Column({ type: 'text', nullable: true })
  avatar: string;

  // Website the host logo links to on the end-user questionnaire.
  @Column({ type: 'text', nullable: true })
  url: string;

  @Column({
    type: 'enum',
    enum: OrganizationStatus,
    default: OrganizationStatus.ACTIVE,
  })
  status: OrganizationStatus;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => User, (user) => user.organization)
  users: User[];

  // Languages this organization has turned on (en, fr, es, it, sl, el).
  @OneToMany(() => OrganizationLanguage, (language) => language.organization)
  languages: OrganizationLanguage[];
}
