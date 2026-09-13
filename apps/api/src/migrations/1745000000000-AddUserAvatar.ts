import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Per-user profile picture (OVH S3 URL). Idempotent.
 */
export class AddUserAvatar1745000000000 implements MigrationInterface {
  name = 'AddUserAvatar1745000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "avatar" text
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users" DROP COLUMN IF EXISTS "avatar"
    `);
  }
}
