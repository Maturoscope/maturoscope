import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Organization } from '../../organizations/entities/organization.entity';
import { ServiceGapCoverage } from './service-gap-coverage.entity';

@Entity('services')
export class Service {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  organizationId: string;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'varchar', length: 500 })
  url: string;

  // Main Contact
  @Column({ type: 'varchar', length: 100 })
  mainContactFirstName: string;

  @Column({ type: 'varchar', length: 100 })
  mainContactLastName: string;

  @Column({ type: 'varchar', length: 255 })
  mainContactEmail: string;

  // Secondary Contact
  @Column({ type: 'varchar', length: 100 })
  secondaryContactFirstName: string;

  @Column({ type: 'varchar', length: 100 })
  secondaryContactLastName: string;

  @Column({ type: 'varchar', length: 255 })
  secondaryContactEmail: string;

  @OneToMany(() => ServiceGapCoverage, (coverage) => coverage.service, {
    cascade: true,
  })
  gapCoverages: ServiceGapCoverage[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

