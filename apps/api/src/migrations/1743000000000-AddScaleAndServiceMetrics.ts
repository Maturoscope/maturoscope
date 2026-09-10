import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddScaleAndServiceMetrics1743000000000
  implements MigrationInterface
{
  name = 'AddScaleAndServiceMetrics1743000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Idempotent: add the new analytics columns only if missing.
    // Existing rows get sensible zeroed defaults.
    await queryRunner.query(`
      ALTER TABLE "organization_statistics"
      ADD COLUMN IF NOT EXISTS "assessmentsByScale" jsonb NOT NULL DEFAULT '{"TRL":{"started":0,"completed":0},"MkRL":{"started":0,"completed":0},"MfRL":{"started":0,"completed":0}}'
    `);
    await queryRunner.query(`
      ALTER TABLE "organization_statistics"
      ADD COLUMN IF NOT EXISTS "consultationsByService" jsonb NOT NULL DEFAULT '{}'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "organization_statistics"
      DROP COLUMN IF EXISTS "consultationsByService"
    `);
    await queryRunner.query(`
      ALTER TABLE "organization_statistics"
      DROP COLUMN IF EXISTS "assessmentsByScale"
    `);
  }
}
