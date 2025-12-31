import { Module, forwardRef } from '@nestjs/common';
import { ReadinessAssessmentService } from './readiness-assessment.service';
import { ReadinessAssessmentController } from './readiness-assessment.controller';
import { ServicesModule } from '../services/services.module';
import { OrganizationsModule } from '../organizations/organizations.module';

@Module({
  imports: [
    forwardRef(() => ServicesModule),
    OrganizationsModule,
  ],
  controllers: [ReadinessAssessmentController],
  providers: [ReadinessAssessmentService],
  exports: [ReadinessAssessmentService],
})
export class ReadinessAssessmentModule {}

