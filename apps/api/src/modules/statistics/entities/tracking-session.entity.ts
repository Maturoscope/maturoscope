import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Unique,
} from 'typeorm';

/**
 * Tracks unique browser sessions to prevent duplicate counting in statistics.
 * Each combination of (organizationId, sessionId, event, category) can only be recorded once.
 */
@Entity('tracking_sessions')
@Unique(['organizationId', 'sessionId', 'event', 'category'])
export class TrackingSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  organizationId: string;

  @Column({ type: 'varchar', length: 64 })
  sessionId: string;

  @Column({ type: 'varchar', length: 20 })
  event: 'started' | 'completed' | 'category';

  @Column({ type: 'varchar', length: 10, nullable: true })
  category: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
