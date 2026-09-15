import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Multi-organization foundation (behaviour-preserving):
 *  - adds the platform-level `isSuperAdmin` flag on users
 *  - creates the `user_organizations` membership join table
 *  - backfills one active + default membership per existing user
 *  - backfills `isSuperAdmin` from the legacy `admin` role
 *
 * Idempotent: safe to run more than once and over existing data.
 */
export class AddUserOrganizations1744000000000 implements MigrationInterface {
  name = 'AddUserOrganizations1744000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Platform-level super-admin flag on users.
    await queryRunner.query(`
      ALTER TABLE "users"
      ADD COLUMN IF NOT EXISTS "isSuperAdmin" boolean NOT NULL DEFAULT false
    `);

    // Membership status enum.
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "user_organizations_status_enum" AS ENUM('active', 'invited');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `);

    // Membership join table.
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "user_organizations" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "organizationId" uuid NOT NULL,
        "status" "user_organizations_status_enum" NOT NULL DEFAULT 'active',
        "isDefault" boolean NOT NULL DEFAULT false,
        "invitedAt" TIMESTAMP,
        "joinedAt" TIMESTAMP,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_user_organizations" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_user_organization" UNIQUE ("userId", "organizationId"),
        CONSTRAINT "FK_user_organizations_user" FOREIGN KEY ("userId")
          REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_user_organizations_organization" FOREIGN KEY ("organizationId")
          REFERENCES "organizations"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_user_organizations_userId"
        ON "user_organizations" ("userId")
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_user_organizations_organizationId"
        ON "user_organizations" ("organizationId")
    `);
    // Guarantee at most one default organization per user.
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "UQ_user_organizations_one_default"
        ON "user_organizations" ("userId") WHERE "isDefault" = true
    `);

    // Backfill: one active + default membership per user that has an org and
    // doesn't already have a membership for it.
    await queryRunner.query(`
      INSERT INTO "user_organizations"
        ("userId", "organizationId", "status", "isDefault", "joinedAt", "createdAt")
      SELECT u."id", u."organizationId", 'active', true, u."createdAt", u."createdAt"
      FROM "users" u
      WHERE u."organizationId" IS NOT NULL
        AND NOT EXISTS (
          SELECT 1 FROM "user_organizations" uo
          WHERE uo."userId" = u."id" AND uo."organizationId" = u."organizationId"
        )
    `);

    // Backfill super-admin flag from the legacy global `admin` role.
    await queryRunner.query(`
      UPDATE "users"
      SET "isSuperAdmin" = true
      WHERE "isSuperAdmin" = false
        AND "roles" IS NOT NULL
        AND 'admin' = ANY (string_to_array("roles", ','))
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "UQ_user_organizations_one_default"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_user_organizations_organizationId"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_user_organizations_userId"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user_organizations"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "user_organizations_status_enum"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "isSuperAdmin"`);
  }
}
