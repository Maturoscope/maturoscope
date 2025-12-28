import { Controller, Get, Post, Body, Param, Query, NotFoundException, Req } from '@nestjs/common';
import type { Request } from 'express';
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
import { StatisticsService } from '../statistics/statistics.service';

@Controller('readiness-assessment')
export class ReadinessAssessmentController {
  constructor(
    private readonly readinessAssessmentService: ReadinessAssessmentService,
    private readonly organizationsService: OrganizationsService,
    private readonly statisticsService: StatisticsService,
  ) {}

  /**
   * GET /readiness-assessment/questions
   * Returns all questions for all scales (TRL, MkRL, MfRL) with EN & FR translations
   */
  @Get('questions')
  async getAllQuestions(@Query('organizationKey') organizationKey?: string): Promise<AllQuestionsI18nDto> {
    // Track started assessment if organizationKey is provided
    if (organizationKey) {
      this.statisticsService.incrementStartedAssessments(organizationKey).catch((error) => {
        // Log error but don't fail the request
        console.error('Failed to track started assessment:', error);
      });
    }
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
    const result = await this.readinessAssessmentService.assessScale(assessScaleDto, organization.id);
    
    // Track user by category and level
    this.statisticsService.incrementUserByCategoryAndLevel(
      organizationKey,
      assessScaleDto.scale,
      result.readinessLevel,
    ).catch((error) => {
      // Log error but don't fail the request
      console.error('Failed to track user by category and level:', error);
    });
    
    return result;
  }


  /**
   * POST /readiness-assessment/analyze-risk
   * Analyze risk with EN & FR translations
   * @param riskAnalysisDto - Contains all three scale readiness levels and phases
   * @param req - Request object to extract optional organizationKey query parameter
   * The analysis determines the lowest risk based on readinessLevel (not phase)
   */
  @Post('analyze-risk')
  async analyzeRisk(
    @Body() riskAnalysisDto: RiskAnalysisDto,
    @Req() req: Request,
  ): Promise<RiskAnalysisResultI18nDto> {
    const result = this.readinessAssessmentService.analyzeRisk(riskAnalysisDto);
    
    // Track completed assessment if organizationKey is provided
    const organizationKey = req.query.organizationKey as string | undefined;
    if (organizationKey) {
      this.statisticsService.incrementCompletedAssessments(organizationKey).catch((error) => {
        // Log error but don't fail the request
        console.error('Failed to track completed assessment:', error);
      });
    }
    
    return result;
  }
}

