import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class SchemaInitService implements OnModuleInit {
  private readonly logger = new Logger(SchemaInitService.name);

  constructor(private readonly dataSource: DataSource) {}

  async onModuleInit(): Promise<void> {
    if (process.env.RUN_SCHEMA_INIT !== 'true') {
      return;
    }

    this.logger.log('Running minimal schema initialization...');

    try {
      // Ensure users.organizationId column exists (nullable)
      await this.dataSource.query(
        'ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "organizationId" uuid',
      );
      this.logger.log('Ensured users.organizationId column exists');
      this.logger.log('Minimal schema initialization completed');
    } catch (error) {
      this.logger.error(`Schema initialization failed: ${(error as Error).message}`);
    }
  }
}


