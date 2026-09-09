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

  /**
   * Started vs completed counts per scale. "abandoned" is derived as
   * started - completed. Lets us see which scale is selected/completed the most.
   * Format: { "TRL": { "started": 10, "completed": 6 }, "MkRL": {...}, "MfRL": {...} }
   */
  @Column({
    type: 'jsonb',
    default: {
      TRL: { started: 0, completed: 0 },
      MkRL: { started: 0, completed: 0 },
      MfRL: { started: 0, completed: 0 },
    },
  })
  assessmentsByScale: {
    TRL: { started: number; completed: number };
    MkRL: { started: number; completed: number };
    MfRL: { started: number; completed: number };
  };

  /**
   * How many times each service has been consulted (contacted through the
   * "talk to an expert" flow). Keyed by service id.
   * Format: { "<serviceId>": 12, ... }
   */
  @Column({ type: 'jsonb', default: {} })
  consultationsByService: Record<string, number>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

