import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { User } from './user.entity';
import { Organization } from '../../organizations/entities/organization.entity';

export enum MembershipStatus {
  // The user accepted and belongs to the organization.
  ACTIVE = 'active',
  // The user was invited but has not accepted joining yet.
  INVITED = 'invited',
  // The user declined the invitation (kept so the org can see it / re-invite).
  REJECTED = 'rejected',
}

/**
 * Join entity for the many-to-many relationship between users and organizations.
 * A user can belong to several organizations; exactly one active membership is
 * flagged as the default (the one they land on at login). Roles remain global on
 * the User; this row only tracks the link, its status and the default flag.
 */
@Entity('user_organizations')
@Unique('UQ_user_organization', ['userId', 'organizationId'])
export class UserOrganization {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  userId: string;

  @Column({ type: 'uuid' })
  @Index()
  organizationId: string;

  // Stored as varchar (see migration 1746) so adding statuses needs no enum
  // change; the MembershipStatus enum validates values at the application level.
  @Column({ type: 'varchar', length: 20, default: MembershipStatus.ACTIVE })
  status: MembershipStatus;

  @Column({ type: 'boolean', default: false })
  isDefault: boolean;

  // Whether this membership is enabled. Disabling it (per organization) blocks
  // the user's access to that organization without affecting their other ones.
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', nullable: true })
  invitedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  joinedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.memberships, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;
}
