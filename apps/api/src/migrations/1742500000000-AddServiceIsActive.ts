import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddServiceIsActive1742500000000 implements MigrationInterface {
  name = 'AddServiceIsActive1742500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Idempotent: only add the column if it does not already exist.
    // Existing services default to active so current behaviour is preserved.
    await queryRunner.query(`
      ALTER TABLE "services"
      ADD COLUMN IF NOT EXISTS "isActive" boolean NOT NULL DEFAULT true
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "services"
      DROP COLUMN IF EXISTS "isActive"
    `);
  }
}
