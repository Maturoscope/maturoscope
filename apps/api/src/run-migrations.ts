import { AppDataSource } from './data-source';
import { writeStructuredLog } from './common/logger/structured-logger.service';

async function runMigrations() {
  try {
    writeStructuredLog('info', 'Database connection initializing');
    await AppDataSource.initialize();
    writeStructuredLog('info', 'Database connection established');

    writeStructuredLog('info', 'Running pending migrations');
    const migrations = await AppDataSource.runMigrations({ transaction: 'all' });

    if (migrations.length === 0) {
      writeStructuredLog('info', 'No pending migrations - database up to date');
    } else {
      writeStructuredLog('info', 'Migrations completed', undefined, { count: migrations.length });
    }

    await AppDataSource.destroy();
    writeStructuredLog('info', 'Migration process completed successfully');
    process.exit(0);
  } catch (error) {
    writeStructuredLog('error', 'Migration failed', error);
    process.exit(1);
  }
}

runMigrations();
