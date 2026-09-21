import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Service } from './service.entity';

/**
 * Per-language title/description for a service. One row per (service, language).
 * Languages use lowercase ISO codes (en, fr, es, it, sl, el) to stay consistent
 * with the rest of the i18n system (I18nText, dictionaries, assessment-data).
 * The legacy nameEn/nameFr/... columns on `services` remain the source of truth
 * until later phases migrate reads to this table.
 */
@Entity('service_translations')
@Unique('UQ_service_translation', ['serviceId', 'languageCode'])
export class ServiceTranslation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  serviceId: string;

  @ManyToOne(() => Service, (service) => service.translations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'serviceId' })
  service: Service;

  @Column({ type: 'varchar', length: 5 })
  languageCode: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
