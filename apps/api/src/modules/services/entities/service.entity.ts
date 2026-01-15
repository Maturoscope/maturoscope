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

  @Column({ type: 'varchar', length: 255, nullable: true })
  name: string; 

  @Column({ type: 'varchar', length: 255, nullable: true })
  nameEn: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  nameFr: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  descriptionEn: string;

  @Column({ type: 'text', nullable: true })
  descriptionFr: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  url: string;

  // Main Contact
  @Column({ type: 'varchar', length: 100, nullable: true })
  mainContactFirstName: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  mainContactLastName: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  mainContactEmail: string;

  // Secondary Contact
  @Column({ type: 'varchar', length: 100, nullable: true })
  secondaryContactFirstName: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  secondaryContactLastName: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
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

