import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';
import { Organization } from '../../organizations/entities/organization.entity';

/**
 * Stores analytics statistics for each organization
 */
@Entity('organization_statistics')
@Unique(['organizationId'])
export class OrganizationStatistics {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  organizationId: string;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  /**
   * Number of users who started the assessment (called /questions endpoint)
   */
  @Column({ type: 'integer', default: 0 })
  startedAssessments: number;

  /**
   * Number of users who completed the assessment (called /analyze-risk endpoint)
   */
  @Column({ type: 'integer', default: 0 })
  completedAssessments: number;

  /**
   * Number of users who contacted services (called /services/contact endpoint)
   */
  @Column({ type: 'integer', default: 0 })
  contactedServices: number;

  /**
   * Users count by category (TRL, MkRL, MfRL) and level (1-9)
   * Format: { "TRL": { "1": 10, "2": 25, ... }, "MkRL": { ... }, "MfRL": { ... } }
   */
  @Column({ type: 'jsonb', default: { TRL: {}, MkRL: {}, MfRL: {} } })
  usersByCategoryAndLevel: {
    TRL: Record<string, number>;
    MkRL: Record<string, number>;
    MfRL: Record<string, number>;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

