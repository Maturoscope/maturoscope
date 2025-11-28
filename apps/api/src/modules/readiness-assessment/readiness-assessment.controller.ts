import { Controller, Get, Post, Body, Param, Query, NotFoundException } from '@nestjs/common';
import { ReadinessAssessmentService } from './readiness-assessment.service';
import {
  ScaleType,
  AssessScaleDto,
  RiskAnalysisDto,
  AllQuestionsI18nDto,
  ScaleQuestionsI18nDto,
  ScaleResultI18nDto,
  RiskAnalysisResultI18nDto,
} from './dto/readiness-assessment.dto';
import { OrganizationsService } from '../organizations/organizations.service';

@Controller('readiness-assessment')
export class ReadinessAssessmentController {
  constructor(
    private readonly readinessAssessmentService: ReadinessAssessmentService,
    private readonly organizationsService: OrganizationsService,
  ) {}

  /**
   * GET /readiness-assessment/questions
   * Returns all questions for all scales (TRL, MkRL, MfRL) with EN & FR translations
   */
  @Get('questions')
  getAllQuestions(): AllQuestionsI18nDto {
    return this.readinessAssessmentService.getAllQuestions();
  }

  /**
   * GET /readiness-assessment/questions/:scale
   * Returns questions for a specific scale with EN & FR translations
   * @param scale - TRL, MkRL, or MfRL
   */
  @Get('questions/:scale')
  getQuestionsByScale(@Param('scale') scale: ScaleType): ScaleQuestionsI18nDto {
    return this.readinessAssessmentService.getQuestionsByScale(scale);
  }

  /**
   * POST /readiness-assessment/assess?organizationKey=synoop
   * PUBLIC endpoint - Assess a single scale and return results with EN & FR translations
   * @param organizationKey - Query parameter with organization key (e.g., "synoop")
   * @param assessScaleDto - Contains scale type and answers
   */
  @Post('assess')
  async assessScale(
    @Query('organizationKey') organizationKey: string,
    @Body() assessScaleDto: AssessScaleDto,
  ): Promise<ScaleResultI18nDto> {
    if (!organizationKey) {
      throw new NotFoundException('organizationKey query parameter is required');
    }

    // Find organization by key
    const organization = await this.organizationsService.findByKey(organizationKey);
    return this.readinessAssessmentService.assessScale(assessScaleDto, organization.id);
  }


  /**
   * POST /readiness-assessment/analyze-risk
   * Analyze risk with EN & FR translations
   * @param riskAnalysisDto - Contains all three scale levels and phases
   */
  @Post('analyze-risk')
  analyzeRisk(@Body() riskAnalysisDto: RiskAnalysisDto): RiskAnalysisResultI18nDto {
    return this.readinessAssessmentService.analyzeRisk(riskAnalysisDto);
  }
}

