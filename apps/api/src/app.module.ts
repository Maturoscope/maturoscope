import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './modules/users/users.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { AuthModule } from './common/auth-module/auth.module';
import { IntegrationAuth0Module } from './modules/integration-auth0/integration-auth0.module';
import * as fs from 'fs';
import { SchemaInitService } from './common/schema-init/schema-init.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +(process.env.DB_PORT || 20184),
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      synchronize: process.env.NODE_ENV !== 'production', // disable in production
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
      retryAttempts: 3,
      retryDelay: 3000,
      logging:
        process.env.NODE_ENV === 'development'
          ? ['error', 'warn', 'query']
          : ['error'],
    }),
    UsersModule,
    OrganizationsModule,
    AuthModule,
    IntegrationAuth0Module,
  ],
  controllers: [AppController],
  providers: [AppService, SchemaInitService],
})
export class AppModule {}
