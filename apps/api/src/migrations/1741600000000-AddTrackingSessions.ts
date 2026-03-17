import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTrackingSessions1741600000000 implements MigrationInterface {
  name = 'AddTrackingSessions1741600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "tracking_sessions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "organizationId" uuid NOT NULL,
        "sessionId" varchar(64) NOT NULL,
        "event" varchar(20) NOT NULL,
        "category" varchar(10),
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_tracking_sessions" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_tracking_sessions_org_session_event_category" UNIQUE ("organizationId", "sessionId", "event", "category")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_tracking_sessions_org_session" ON "tracking_sessions" ("organizationId", "sessionId")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_tracking_sessions_org_session"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "tracking_sessions"`);
  }
}
