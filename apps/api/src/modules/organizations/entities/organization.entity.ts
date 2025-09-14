import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';

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

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'text', nullable: true })
  font: string;

  @Column({ type: 'text', nullable: true })
  theme: string;

  @Column({ type: 'text', nullable: true })
  signature: string;

  @Column({ type: 'text', nullable: true })
  language: string;

  @Column({ type: 'text', nullable: true })
  avatar: string;

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
}
