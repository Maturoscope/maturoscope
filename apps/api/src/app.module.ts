import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './common/auth-module/auth.module';
import { IntegrationAuth0Module } from './modules/integration-auth0/integration-auth0.module';
import * as fs from 'fs';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      autoLoadEntities: true,
      synchronize: true,
      extra: {
        options: '-c timezone=Europe/Paris',
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 60000,
        ssl: {
          rejectUnauthorized: true,  // ✅ Validación de certificados activada
          ca: fs.readFileSync(process.env.DB_SSL_CA_PATH!, 'utf8'),  // ✅ Certificado CA correcto
          servername: process.env.DB_SSL_SERVERNAME,  // ✅ Servername correcto
        },
      },
      retryAttempts: 3,
      retryDelay: 3000,
      logging: process.env.NODE_ENV === 'development' ? ['error', 'warn', 'query'] : ['error'],
    }),
    UsersModule,
    AuthModule,
    IntegrationAuth0Module,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
