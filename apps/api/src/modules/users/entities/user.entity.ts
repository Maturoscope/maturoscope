import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Organization } from '../../organizations/entities/organization.entity';

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

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;
  
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Organization, (organization) => organization.users)
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;
}
