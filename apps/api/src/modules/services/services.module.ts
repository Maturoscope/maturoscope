import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ServicesService } from './services.service';
import { ServicesController } from './services.controller';
import { Service, ServiceGapCoverage } from './entities';
import { UsersModule } from '../users/users.module';
import { ReadinessAssessmentModule } from '../readiness-assessment/readiness-assessment.module';
import { IntegrationAuth0Module } from '../integration-auth0/integration-auth0.module';
import { ServiceContactMailService } from './mail.service';
import { OrganizationsModule } from '../organizations/organizations.module';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Service, ServiceGapCoverage]),
    UsersModule,
    forwardRef(() => ReadinessAssessmentModule),
    IntegrationAuth0Module,
    OrganizationsModule,
  ],
  controllers: [ServicesController],
  providers: [ServicesService, ServiceContactMailService],
  exports: [ServicesService],
})
export class ServicesModule {}

