import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Allow the same email to be the first user of several organizations: drop the
 * unique constraint on organizations.email. The constraint name is
 * auto-generated, so it's resolved dynamically. Idempotent.
 */
export class DropOrganizationEmailUnique1747000000000 implements MigrationInterface {
  name = 'DropOrganizationEmailUnique1747000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      DECLARE cname text;
      BEGIN
        SELECT c.conname INTO cname
        FROM pg_constraint c
        JOIN pg_class t ON c.conrelid = t.oid
        WHERE t.relname = 'organizations'
          AND c.contype = 'u'
          AND pg_get_constraintdef(c.oid) ILIKE '%(email)%';
        IF cname IS NOT NULL THEN
          EXECUTE 'ALTER TABLE "organizations" DROP CONSTRAINT ' || quote_ident(cname);
        END IF;
      END $$;
    `);
  }

  public async down(): Promise<void> {
    // Not restored: re-adding the unique constraint could fail if duplicates exist.
  }
}
