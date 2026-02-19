import { Controller, Get, Post, Body, Param, Query, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
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

@ApiTags('readiness-assessment')
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
  @ApiOperation({ 
    summary: 'Get all assessment questions',
    description: 'Returns all questions for all maturity scales (TRL, MkRL, MfRL) with English and French translations. PUBLIC endpoint.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'All questions retrieved successfully',
    type: AllQuestionsI18nDto
  })
  async getAllQuestions(): Promise<AllQuestionsI18nDto> {
    return this.readinessAssessmentService.getAllQuestions();
  }

  /**
   * GET /readiness-assessment/questions/:scale
   * Returns questions for a specific scale with EN & FR translations
   * @param scale - TRL, MkRL, or MfRL
   */
  @Get('questions/:scale')
  @ApiOperation({ 
    summary: 'Get questions by scale',
    description: 'Returns questions for a specific maturity scale (TRL, MkRL, or MfRL) with English and French translations. PUBLIC endpoint.'
  })
  @ApiParam({ name: 'scale', enum: ['TRL', 'MkRL', 'MfRL'], description: 'Maturity scale type', example: 'TRL' })
  @ApiResponse({ 
    status: 200, 
    description: 'Questions for the specified scale',
    type: ScaleQuestionsI18nDto
  })
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
  @ApiOperation({ 
    summary: 'Assess maturity scale (PUBLIC)',
    description: 'Assesses a single maturity scale (TRL, MkRL, or MfRL) based on user answers and returns results with gap analysis. This is a PUBLIC endpoint called from the end-user application.'
  })
  @ApiQuery({ name: 'organizationKey', required: true, description: 'Organization unique key', example: 'synopp' })
  @ApiResponse({ 
    status: 200, 
    description: 'Assessment completed successfully',
    type: ScaleResultI18nDto
  })
  @ApiResponse({ status: 404, description: 'Organization not found' })
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
    
    return result;
  }


  /**
   * POST /readiness-assessment/analyze-risk
   * Analyze risk with EN & FR translations
   * @param riskAnalysisDto - Contains all three scale readiness levels and phases
   * The analysis determines the lowest risk based on readinessLevel (not phase)
   */
  @Post('analyze-risk')
  @ApiOperation({ 
    summary: 'Analyze overall risk (PUBLIC)',
    description: 'Analyzes overall project risk based on all three maturity scales (TRL, MkRL, MfRL) and their phases. Returns the lowest maturity level as the primary risk indicator. PUBLIC endpoint.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Risk analysis completed successfully',
    type: RiskAnalysisResultI18nDto
  })
  async analyzeRisk(
    @Body() riskAnalysisDto: RiskAnalysisDto,
  ): Promise<RiskAnalysisResultI18nDto> {
    return this.readinessAssessmentService.analyzeRisk(riskAnalysisDto);
  }
}

