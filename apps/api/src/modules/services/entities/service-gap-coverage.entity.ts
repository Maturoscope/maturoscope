import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { Service } from './service.entity';

export enum ScaleType {
  TRL = 'TRL',
  MkRL = 'MkRL',
  MfRL = 'MfRL',
}

@Entity('service_gap_coverages')
@Index(['serviceId', 'questionId', 'level'], { unique: true })
@Index(['questionId', 'level'])
export class ServiceGapCoverage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  serviceId: string;

  @ManyToOne(() => Service, (service) => service.gapCoverages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'serviceId' })
  service: Service;

  @Column({ type: 'varchar', length: 20 })
  questionId: string;

  @Column({ type: 'int' })
  level: number;

  @Column({ type: 'enum', enum: ScaleType })
  scaleType: ScaleType;

  @CreateDateColumn()
  createdAt: Date;
}

