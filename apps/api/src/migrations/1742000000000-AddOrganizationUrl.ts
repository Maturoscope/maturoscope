import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOrganizationUrl1742000000000 implements MigrationInterface {
  name = 'AddOrganizationUrl1742000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Idempotent: only add the column if it does not already exist.
    await queryRunner.query(`
      ALTER TABLE "organizations"
      ADD COLUMN IF NOT EXISTS "url" text
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "organizations"
      DROP COLUMN IF EXISTS "url"
    `);
  }
}
