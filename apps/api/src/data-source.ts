import { DataSource } from 'typeorm';
import * as fs from 'fs';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: +(process.env.DB_PORT || 5432),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  entities: [__dirname + '/modules/**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  synchronize: false, // Always false when using migrations
  logging: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  extra: {
    options: '-c timezone=Europe/Paris',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 60000,
    ...(process.env.DB_SSL_CA_PATH && {
      ssl: {
        rejectUnauthorized: true,
        ca: fs.readFileSync(process.env.DB_SSL_CA_PATH, 'utf8'),
        servername: process.env.DB_SSL_SERVERNAME,
      },
    }),
  },
});
