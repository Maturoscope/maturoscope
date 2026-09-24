import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
  CreateDateColumn,
} from 'typeorm';
import { Organization } from './organization.entity';

/**
 * Which languages an organization has turned on. One row per (organization,
 * language). `enabled` is the on/off switch; the derived Live/Draft status
 * (computed from service translation completeness) is NOT stored here.
 * Languages use lowercase ISO codes (en, fr, es, it, sl, el).
 */
@Entity('organization_languages')
@Unique('UQ_organization_language', ['organizationId', 'languageCode'])
export class OrganizationLanguage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  organizationId: string;

  @ManyToOne(() => Organization, (organization) => organization.languages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @Column({ type: 'varchar', length: 5 })
  languageCode: string;

  @Column({ type: 'boolean', default: false })
  enabled: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
