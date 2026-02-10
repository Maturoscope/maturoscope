import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './modules/users/users.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { ReportModule } from './modules/report/report.module';
import { AuthModule } from './common/auth-module/auth.module';
import { IntegrationAuth0Module } from './modules/integration-auth0/integration-auth0.module';
import { UserInvitationModule } from './modules/user-invitation/user-invitation.module';
import { ReadinessAssessmentModule } from './modules/readiness-assessment/readiness-assessment.module';
import { ServicesModule } from './modules/services/services.module';
import { StatisticsModule } from './modules/statistics/statistics.module';
import { AuthIdInterceptor } from './common/auth-module/interceptors/auth-id.interceptor';
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
      synchronize: false, // Always false - using migrations instead
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
    ReportModule,
    AuthModule,
    IntegrationAuth0Module,
    UserInvitationModule,
    ReadinessAssessmentModule,
    ServicesModule,
    StatisticsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    SchemaInitService,
    {
      provide: APP_INTERCEPTOR,
      useClass: AuthIdInterceptor,
    },
  ],
})
export class AppModule {}
