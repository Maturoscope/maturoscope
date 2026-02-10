import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1707518400000 implements MigrationInterface {
  name = 'InitialSchema1707518400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum types
    await queryRunner.query(`
      CREATE TYPE "organization_status_enum" AS ENUM('inactive', 'active')
    `);

    await queryRunner.query(`
      CREATE TYPE "scale_type_enum" AS ENUM('TRL', 'MkRL', 'MfRL')
    `);

    // Create organizations table
    await queryRunner.query(`
      CREATE TABLE "organizations" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "key" character varying(50) NOT NULL,
        "name" text NOT NULL,
        "email" character varying(255) NOT NULL,
        "font" text,
        "theme" text,
        "signature" text,
        "language" text,
        "avatar" text,
        "status" "organization_status_enum" NOT NULL DEFAULT 'active',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_organizations_key" UNIQUE ("key"),
        CONSTRAINT "UQ_organizations_email" UNIQUE ("email"),
        CONSTRAINT "PK_organizations" PRIMARY KEY ("id")
      )
    `);

    // Create users table
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "organizationId" uuid,
        "authId" text,
        "firstName" text NOT NULL,
        "lastName" text NOT NULL,
        "roles" text,
        "email" character varying(255) NOT NULL,
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "PK_users" PRIMARY KEY ("id")
      )
    `);

    // Create services table
    await queryRunner.query(`
      CREATE TABLE "services" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "organizationId" uuid NOT NULL,
        "name" character varying(255),
        "nameEn" character varying(255),
        "nameFr" character varying(255),
        "description" text,
        "descriptionEn" text,
        "descriptionFr" text,
        "url" character varying(500),
        "mainContactFirstName" character varying(100),
        "mainContactLastName" character varying(100),
        "mainContactEmail" character varying(255),
        "secondaryContactFirstName" character varying(100),
        "secondaryContactLastName" character varying(100),
        "secondaryContactEmail" character varying(255),
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_services" PRIMARY KEY ("id")
      )
    `);

    // Create service_gap_coverages table
    await queryRunner.query(`
      CREATE TABLE "service_gap_coverages" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "serviceId" uuid NOT NULL,
        "questionId" character varying(20) NOT NULL,
        "level" integer NOT NULL,
        "scaleType" "scale_type_enum" NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_service_gap_coverages" PRIMARY KEY ("id")
      )
    `);

    // Create organization_statistics table
    await queryRunner.query(`
      CREATE TABLE "organization_statistics" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "organizationId" uuid NOT NULL,
        "startedAssessments" integer NOT NULL DEFAULT 0,
        "completedAssessments" integer NOT NULL DEFAULT 0,
        "contactedServices" integer NOT NULL DEFAULT 0,
        "usersByCategoryAndLevel" jsonb NOT NULL DEFAULT '{"TRL":{}, "MkRL":{}, "MfRL":{}}',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_organization_statistics_organizationId" UNIQUE ("organizationId"),
        CONSTRAINT "PK_organization_statistics" PRIMARY KEY ("id")
      )
    `);

    // Create indexes
    await queryRunner.query(`
      CREATE INDEX "IDX_users_organizationId" ON "users" ("organizationId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_services_organizationId" ON "services" ("organizationId")
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_service_gap_coverages_unique" ON "service_gap_coverages" ("serviceId", "questionId", "level")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_service_gap_coverages_question_level" ON "service_gap_coverages" ("questionId", "level")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_organization_statistics_organizationId" ON "organization_statistics" ("organizationId")
    `);

    // Add foreign keys
    await queryRunner.query(`
      ALTER TABLE "users"
      ADD CONSTRAINT "FK_users_organizations"
      FOREIGN KEY ("organizationId")
      REFERENCES "organizations"("id")
      ON DELETE NO ACTION
      ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "services"
      ADD CONSTRAINT "FK_services_organizations"
      FOREIGN KEY ("organizationId")
      REFERENCES "organizations"("id")
      ON DELETE NO ACTION
      ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "service_gap_coverages"
      ADD CONSTRAINT "FK_service_gap_coverages_services"
      FOREIGN KEY ("serviceId")
      REFERENCES "services"("id")
      ON DELETE CASCADE
      ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "organization_statistics"
      ADD CONSTRAINT "FK_organization_statistics_organizations"
      FOREIGN KEY ("organizationId")
      REFERENCES "organizations"("id")
      ON DELETE NO ACTION
      ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys
    await queryRunner.query(`ALTER TABLE "organization_statistics" DROP CONSTRAINT "FK_organization_statistics_organizations"`);
    await queryRunner.query(`ALTER TABLE "service_gap_coverages" DROP CONSTRAINT "FK_service_gap_coverages_services"`);
    await queryRunner.query(`ALTER TABLE "services" DROP CONSTRAINT "FK_services_organizations"`);
    await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_users_organizations"`);

    // Drop indexes
    await queryRunner.query(`DROP INDEX "IDX_organization_statistics_organizationId"`);
    await queryRunner.query(`DROP INDEX "IDX_service_gap_coverages_question_level"`);
    await queryRunner.query(`DROP INDEX "IDX_service_gap_coverages_unique"`);
    await queryRunner.query(`DROP INDEX "IDX_services_organizationId"`);
    await queryRunner.query(`DROP INDEX "IDX_users_organizationId"`);

    // Drop tables
    await queryRunner.query(`DROP TABLE "organization_statistics"`);
    await queryRunner.query(`DROP TABLE "service_gap_coverages"`);
    await queryRunner.query(`DROP TABLE "services"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TABLE "organizations"`);

    // Drop enum types
    await queryRunner.query(`DROP TYPE "scale_type_enum"`);
    await queryRunner.query(`DROP TYPE "organization_status_enum"`);
  }
}
