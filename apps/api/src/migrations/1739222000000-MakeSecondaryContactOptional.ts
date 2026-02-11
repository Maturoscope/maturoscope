import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeSecondaryContactOptional1739222000000 implements MigrationInterface {
  name = 'MakeSecondaryContactOptional1739222000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add comments to document that secondary contact fields are optional
    await queryRunner.query(`
      COMMENT ON COLUMN "services"."secondaryContactFirstName" IS 'Optional - Secondary contact first name'
    `);

    await queryRunner.query(`
      COMMENT ON COLUMN "services"."secondaryContactLastName" IS 'Optional - Secondary contact last name'
    `);

    await queryRunner.query(`
      COMMENT ON COLUMN "services"."secondaryContactEmail" IS 'Optional - Secondary contact email address'
    `);

    // Ensure these columns are explicitly nullable (they already are, but this makes it explicit)
    // This is idempotent and safe to run multiple times
    await queryRunner.query(`
      ALTER TABLE "services" 
      ALTER COLUMN "secondaryContactFirstName" DROP NOT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "services" 
      ALTER COLUMN "secondaryContactLastName" DROP NOT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "services" 
      ALTER COLUMN "secondaryContactEmail" DROP NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove comments
    await queryRunner.query(`
      COMMENT ON COLUMN "services"."secondaryContactFirstName" IS NULL
    `);

    await queryRunner.query(`
      COMMENT ON COLUMN "services"."secondaryContactLastName" IS NULL
    `);

    await queryRunner.query(`
      COMMENT ON COLUMN "services"."secondaryContactEmail" IS NULL
    `);

    // Note: We don't add NOT NULL back in the down migration as that could fail
    // if there are existing records with NULL values
    // If you need to rollback, handle existing NULL values first
  }
}
