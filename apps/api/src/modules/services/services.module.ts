import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServicesService } from './services.service';
import { ServicesController } from './services.controller';
import { Service, ServiceGapCoverage } from './entities';
import { UsersModule } from '../users/users.module';
import { ReadinessAssessmentModule } from '../readiness-assessment/readiness-assessment.module';
import { IntegrationAuth0Module } from '../integration-auth0/integration-auth0.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Service, ServiceGapCoverage]),
    UsersModule,
    forwardRef(() => ReadinessAssessmentModule),
    IntegrationAuth0Module,
  ],
  controllers: [ServicesController],
  providers: [ServicesService],
  exports: [ServicesService],
})
export class ServicesModule {}

