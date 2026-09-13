import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Organization } from '../../organizations/entities/organization.entity';
import { UserOrganization } from './user-organization.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  organizationId: string;

  @Column({ type: 'text', nullable: true })
  authId: string;

  @Column({ type: 'text' })
  firstName: string;

  @Column({ type: 'text' })
  lastName: string;

  @Column({ type: 'simple-array', nullable: true })
  roles: string[];

  // Platform-level super-admin flag (Reports/Organizations), independent of the
  // active organization. Global to the user, not per-membership.
  @Column({ type: 'boolean', default: false })
  isSuperAdmin: boolean;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  // The user's own profile picture (OVH S3 URL). Independent of the organization
  // avatar; when empty the UI shows the user's initials.
  @Column({ type: 'text', nullable: true })
  avatar: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  // Legacy single-organization link. Kept in sync with the default membership
  // during the multi-organization transition; superseded by `memberships`.
  @ManyToOne(() => Organization, (organization) => organization.users)
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @OneToMany(() => UserOrganization, (membership) => membership.user)
  memberships: UserOrganization[];
}
