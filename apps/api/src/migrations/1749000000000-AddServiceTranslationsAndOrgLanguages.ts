import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Multi-language services foundation (additive, behaviour-preserving):
 *  - `service_translations`: one row per (service, language) for name/description
 *  - `organization_languages`: which languages each org has turned on
 *  - `organizations.defaultLanguage`: source language (lowercase ISO code)
 *  - backfills en/fr from the legacy columns so existing orgs keep working
 *    (defaultLanguage=en, en+fr enabled → FR stays Live since it has data)
 *
 * Idempotent: safe to run more than once and over existing data. Nothing reads
 * from the new tables yet; the legacy nameEn/nameFr/... and organizations.language
 * columns remain the source of truth until later phases.
 */
export class AddServiceTranslationsAndOrgLanguages1749000000000
  implements MigrationInterface
{
  name = 'AddServiceTranslationsAndOrgLanguages1749000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Per-language service title/description.
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "service_translations" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "serviceId" uuid NOT NULL,
        "languageCode" varchar(5) NOT NULL,
        "name" varchar(255),
        "description" text,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_service_translations" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_service_translation" UNIQUE ("serviceId", "languageCode"),
        CONSTRAINT "FK_service_translations_service" FOREIGN KEY ("serviceId")
          REFERENCES "services"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_service_translations_serviceId"
        ON "service_translations" ("serviceId")
    `);

    // Which languages an organization has turned on.
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "organization_languages" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "organizationId" uuid NOT NULL,
        "languageCode" varchar(5) NOT NULL,
        "enabled" boolean NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_organization_languages" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_organization_language" UNIQUE ("organizationId", "languageCode"),
        CONSTRAINT "FK_organization_languages_organization" FOREIGN KEY ("organizationId")
          REFERENCES "organizations"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_organization_languages_organizationId"
        ON "organization_languages" ("organizationId")
    `);

    // Source language (lowercase ISO). Backfill from the legacy uppercase column.
    await queryRunner.query(`
      ALTER TABLE "organizations"
      ADD COLUMN IF NOT EXISTS "defaultLanguage" varchar(5) NOT NULL DEFAULT 'en'
    `);
    await queryRunner.query(`
      UPDATE "organizations"
      SET "defaultLanguage" = lower("language")
      WHERE "language" IS NOT NULL AND lower("language") IN ('en', 'fr')
    `);

    // Backfill service translations from the legacy columns (idempotent).
    // English: prefer nameEn, fall back to the legacy generic name.
    await queryRunner.query(`
      INSERT INTO "service_translations"
        ("serviceId", "languageCode", "name", "description", "createdAt", "updatedAt")
      SELECT s."id", 'en', COALESCE(s."nameEn", s."name"),
             COALESCE(s."descriptionEn", s."description"), s."createdAt", now()
      FROM "services" s
      WHERE COALESCE(s."nameEn", s."name") IS NOT NULL
        AND NOT EXISTS (
          SELECT 1 FROM "service_translations" st
          WHERE st."serviceId" = s."id" AND st."languageCode" = 'en'
        )
    `);
    await queryRunner.query(`
      INSERT INTO "service_translations"
        ("serviceId", "languageCode", "name", "description", "createdAt", "updatedAt")
      SELECT s."id", 'fr', s."nameFr", s."descriptionFr", s."createdAt", now()
      FROM "services" s
      WHERE s."nameFr" IS NOT NULL
        AND NOT EXISTS (
          SELECT 1 FROM "service_translations" st
          WHERE st."serviceId" = s."id" AND st."languageCode" = 'fr'
        )
    `);

    // Backfill enabled languages: en + fr for every existing org (idempotent).
    await queryRunner.query(`
      INSERT INTO "organization_languages"
        ("organizationId", "languageCode", "enabled", "createdAt")
      SELECT o."id", code, true, now()
      FROM "organizations" o
      CROSS JOIN (VALUES ('en'), ('fr')) AS langs(code)
      WHERE NOT EXISTS (
        SELECT 1 FROM "organization_languages" ol
        WHERE ol."organizationId" = o."id" AND ol."languageCode" = langs.code
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_organization_languages_organizationId"`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "organization_languages"`);
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_service_translations_serviceId"`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "service_translations"`);
    await queryRunner.query(
      `ALTER TABLE "organizations" DROP COLUMN IF EXISTS "defaultLanguage"`,
    );
  }
}
