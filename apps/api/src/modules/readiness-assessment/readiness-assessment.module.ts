import { Module, forwardRef } from '@nestjs/common';
import { ReadinessAssessmentService } from './readiness-assessment.service';
import { ReadinessAssessmentController } from './readiness-assessment.controller';
import { ServicesModule } from '../services/services.module';
import { OrganizationsModule } from '../organizations/organizations.module';
import { StatisticsModule } from '../statistics/statistics.module';

@Module({
  imports: [
    forwardRef(() => ServicesModule),
    OrganizationsModule,
    StatisticsModule,
  ],
  controllers: [ReadinessAssessmentController],
  providers: [ReadinessAssessmentService],
  exports: [ReadinessAssessmentService],
})
export class ReadinessAssessmentModule {}

