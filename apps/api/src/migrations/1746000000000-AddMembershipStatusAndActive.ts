import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Membership-level registration/active:
 *  - converts the membership `status` enum to varchar so new statuses (e.g.
 *    'rejected') don't require fragile enum alterations inside a transaction
 *  - adds `isActive` on the membership (per-organization enable/disable),
 *    backfilled from the legacy user-level isActive.
 * Idempotent.
 */
export class AddMembershipStatusAndActive1746000000000 implements MigrationInterface {
  name = 'AddMembershipStatusAndActive1746000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Convert the enum column to varchar (app-level enum keeps validating values).
    await queryRunner.query(`ALTER TABLE "user_organizations" ALTER COLUMN "status" DROP DEFAULT`);
    await queryRunner.query(`
      ALTER TABLE "user_organizations"
      ALTER COLUMN "status" TYPE varchar(20) USING "status"::text
    `);
    await queryRunner.query(`ALTER TABLE "user_organizations" ALTER COLUMN "status" SET DEFAULT 'active'`);
    await queryRunner.query(`DROP TYPE IF EXISTS "user_organizations_status_enum"`);

    // Per-membership active flag, backfilled from the legacy user-level isActive.
    await queryRunner.query(`
      ALTER TABLE "user_organizations"
      ADD COLUMN IF NOT EXISTS "isActive" boolean NOT NULL DEFAULT true
    `);
    await queryRunner.query(`
      UPDATE "user_organizations" uo
      SET "isActive" = u."isActive"
      FROM "users" u
      WHERE u."id" = uo."userId"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user_organizations" DROP COLUMN IF EXISTS "isActive"`);
    // status stays varchar (no downgrade back to enum).
  }
}
