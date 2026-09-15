import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Track when a user leaves an organization (membership kept but deactivated);
 * reactivating a left membership requires re-sending the invitation. Idempotent.
 */
export class AddMembershipLeftAt1748000000000 implements MigrationInterface {
  name = 'AddMembershipLeftAt1748000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "user_organizations" ADD COLUMN IF NOT EXISTS "leftAt" TIMESTAMP
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "user_organizations" DROP COLUMN IF EXISTS "leftAt"
    `);
  }
}
