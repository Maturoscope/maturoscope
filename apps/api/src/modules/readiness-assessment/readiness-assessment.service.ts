import { Injectable, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import {
  ScaleType,
  AssessScaleDto,
  RiskAnalysisDto,
  I18nTextInterface,
  AllQuestionsI18nDto,
  ScaleQuestionsI18nDto,
  ScaleResultI18nDto,
  RiskAnalysisResultI18nDto,
  RecommendedServiceDto,
} from './dto/readiness-assessment.dto';
import { ServicesService } from '../services/services.service';
import { StructuredLoggerService } from '../../common/logger/structured-logger.service';

type I18nText = I18nTextInterface;

interface AssessmentDataI18n {
  scales: {
    [key: string]: {
      name: I18nText;
      abbreviation: string;
      questions: Array<{
        id: string;
        question: I18nText;
        levels: Record<string, I18nText>;
      }>;
    };
  };
  readinessLevelMapping: {
    [key: string]: {
      phase: number;
      phaseName: I18nText;
      focusGoal: I18nText;
      scaleRange: string;
    };
  };
  riskMitigation: {
    [key: string]: {
      strategicFocus: I18nText;
      primaryRisk: I18nText;
    };
  };
  gaps: {
    [questionId: string]: {
      [level: string]: I18nText;
    };
  };
  serviceSatisfactionOptions: {
    [questionId: string]: {
      [level: string]: I18nText;
    };
  };
}

@Injectable()
export class ReadinessAssessmentService {
  private assessmentData: AssessmentDataI18n;
  private readonly logger: StructuredLoggerService;

  constructor(
    @Inject(forwardRef(() => ServicesService))
    private readonly servicesService: ServicesService,
    structuredLogger: StructuredLoggerService,
  ) {
    this.logger = structuredLogger.child('ReadinessAssessmentService');
    this.loadAssessmentData();
  }

  private loadAssessmentData() {
    const dataPath = path.join(
      __dirname,
      'data',
      'assessment-data.json',
    );
    const rawData = fs.readFileSync(dataPath, 'utf-8');
    this.assessmentData = JSON.parse(rawData);
  }

  /**
   * Get all questions for all scales with translations
   */
  getAllQuestions(): AllQuestionsI18nDto {
    const { scales } = this.assessmentData;
    return {
      TRL: {
        name: scales.TRL.name,
        abbreviation: scales.TRL.abbreviation,
        questions: scales.TRL.questions,
      },
      MkRL: {
        name: scales.MkRL.name,
        abbreviation: scales.MkRL.abbreviation,
        questions: scales.MkRL.questions,
      },
      MfRL: {
        name: scales.MfRL.name,
        abbreviation: scales.MfRL.abbreviation,
        questions: scales.MfRL.questions,
      },
    };
  }

  /**
   * Get questions for a specific scale with translations
   */
  getQuestionsByScale(scale: ScaleType): ScaleQuestionsI18nDto {
    const scaleData = this.assessmentData.scales[scale];
    if (!scaleData) {
      throw new BadRequestException(`Invalid scale: ${scale}`);
    }

    return {
      name: scaleData.name,
      abbreviation: scaleData.abbreviation,
      questions: scaleData.questions,
    };
  }

  /**
   * Assess a single scale and return results with translations
   */
  async assessScale(assessScaleDto: AssessScaleDto, organizationId: string): Promise<ScaleResultI18nDto> {
    const { scale, answers } = assessScaleDto;

    // Validate scale exists
    const scaleData = this.assessmentData.scales[scale];
    if (!scaleData) {
      throw new BadRequestException(`Invalid scale: ${scale}`);
    }

    // Validate all questions are answered
    const questionIds = scaleData.questions.map((q) => q.id);
    const answeredIds = Object.keys(answers);

    const missingQuestions = questionIds.filter(
      (id) => !answeredIds.includes(id),
    );
    if (missingQuestions.length > 0) {
      throw new BadRequestException(
        `Missing answers for questions: ${missingQuestions.join(', ')}`,
      );
    }

    // Calculate readiness level (minimum value selected)
    let minLevel = 9;
    const lowestLevels: Array<{
      questionId: string;
      questionText: I18nText;
      selectedLevel: string;
    }> = [];

    Object.entries(answers).forEach(([, level]) => {
      const levelNum = parseInt(level, 10);
      if (levelNum < minLevel) {
        minLevel = levelNum;
      }
    });

    // Find all questions with the minimum level
    Object.entries(answers).forEach(([questionId, level]) => {
      const levelNum = parseInt(level, 10);
      if (levelNum === minLevel) {
        const question = scaleData.questions.find((q) => q.id === questionId);
        if (question) {
          lowestLevels.push({
            questionId: question.id,
            questionText: question.question,
            selectedLevel: level,
          });
        }
      }
    });

    // Get development phase
    const phaseInfo = this.assessmentData.readinessLevelMapping[minLevel];

    // Get gaps with recommended services
    const gaps = await this.getGapsForScale(minLevel, lowestLevels, organizationId);

    return {
      scale,
      readinessLevel: minLevel,
      lowestLevels,
      developmentPhase: phaseInfo,
      gaps,
    };
  }

  /**
   * Get gaps with translations and recommended services
   */
  private async getGapsForScale(
    readinessLevel: number,
    lowestLevels: Array<{
      questionId: string;
      questionText: I18nText;
      selectedLevel: string;
    }>,
    organizationId: string,
  ): Promise<Array<{ 
    questionId: string; 
    level: number;
    gapDescription: I18nText;
    hasServices: boolean;
    recommendedServices: RecommendedServiceDto[];
  }>> {
    const gaps: Array<{ 
      questionId: string; 
      level: number;
      gapDescription: I18nText;
      hasServices: boolean;
      recommendedServices: RecommendedServiceDto[];
    }> = [];
    const allGaps = this.assessmentData.gaps;

    if (!allGaps) {
      return gaps;
    }

    // Prepare array for service lookup
    const gapsForLookup = lowestLevels.map((lowestLevel) => ({
      questionId: lowestLevel.questionId,
      level: parseInt(lowestLevel.selectedLevel, 10),
    }));

    // Get recommended services for all gaps
    const servicesMap = await this.servicesService.findServicesForGaps(
      organizationId,
      gapsForLookup,
    );

    // For each question with the lowest level, get the gap description and services
    lowestLevels.forEach((lowestLevel) => {
      const questionGaps = allGaps[lowestLevel.questionId];
      if (questionGaps && questionGaps[lowestLevel.selectedLevel]) {
        const level = parseInt(lowestLevel.selectedLevel, 10);
        const gapKey = `${lowestLevel.questionId}_${level}`;
        const recommendedServices = servicesMap.get(gapKey) || [];

        gaps.push({
          questionId: lowestLevel.questionId,
          level,
          gapDescription: questionGaps[lowestLevel.selectedLevel],
          hasServices: recommendedServices.length > 0,
          recommendedServices,
        });
      }
    });

    return gaps;
  }

  /**
   * Analyze risk with translations
   */
  analyzeRisk(riskAnalysisDto: RiskAnalysisDto): RiskAnalysisResultI18nDto {
    const { scales } = riskAnalysisDto;

    // Validate we have all three scales
    const requiredScales = [ScaleType.TRL, ScaleType.MkRL, ScaleType.MfRL];
    const providedScales = scales.map((s) => s.scale);

    const missingScales = requiredScales.filter(
      (scale) => !providedScales.includes(scale),
    );
    if (missingScales.length > 0) {
      throw new BadRequestException(
        `Missing scale assessments: ${missingScales.join(', ')}`,
      );
    }

    const readinessLevels = scales.map((s) => s.readinessLevel);
    const lowestReadinessLevel = Math.min(...readinessLevels);

    const readinessLevelsMatch = readinessLevels.every((r) => r === readinessLevels[0]);

    const risks = scales.map((scaleInput) => {
      const isLowest = scaleInput.readinessLevel === lowestReadinessLevel && !readinessLevelsMatch;
      let strategicFocus: I18nText | undefined;
      let primaryRisk: I18nText | undefined;

      if (isLowest) {
        const riskKey = `${scaleInput.scale}_LOWEST`;
        const riskInfo = this.assessmentData.riskMitigation[riskKey];
        if (riskInfo) {
          strategicFocus = riskInfo.strategicFocus;
          primaryRisk = riskInfo.primaryRisk;
        }
      }

      return {
        scale: scaleInput.scale,
        readinessLevel: scaleInput.readinessLevel,
        phase: scaleInput.phase,
        isLowest,
        strategicFocus,
        primaryRisk,
      };
    });

    const recommendations: I18nText[] = [];

    if (!readinessLevelsMatch) {
      const lowestRisks = risks.filter((r) => r.isLowest);
      lowestRisks.forEach((risk) => {
        if (risk.strategicFocus && risk.primaryRisk) {
          recommendations.push({
            en: `To progress to the next development phase, focus on ${risk.scale} scale and mitigate the following risks:`,
            fr: `Pour progresser vers la prochaine phase de développement, concentrez-vous sur l'échelle ${risk.scale} et atténuez les risques suivants :`,
          });
          recommendations.push({
            en: `- Strategic Focus: ${risk.strategicFocus.en}`,
            fr: `- Focus Stratégique : ${risk.strategicFocus.fr}`,
          });
          recommendations.push({
            en: `- Primary Risk: ${risk.primaryRisk.en}`,
            fr: `- Risque Principal : ${risk.primaryRisk.fr}`,
          });
        }
      });
    } else {
      recommendations.push({
        en: 'All scales are at the same development phase. Continue balanced development across all areas.',
        fr: 'Toutes les échelles sont à la même phase de développement. Continuez le développement équilibré dans tous les domaines.',
      });
    }

    return {
      overallPhase: lowestReadinessLevel,
      phasesMatch: readinessLevelsMatch,
      risks,
      recommendations,
    };
  }

  /**
   * Get gap description for a specific question and level from the gaps object
   */
  getGapDescription(
    questionId: string,
    level: number,
    scaleType: ScaleType,
    language: string = 'EN',
  ): string | undefined {
    try {
      if (!this.assessmentData.gaps || !this.assessmentData.gaps[questionId]) {
        return undefined;
      }

      const levelKey = level.toString();
      const levelData = this.assessmentData.gaps[questionId][levelKey];
      if (!levelData) {
        return undefined;
      }

      const lang = language?.toUpperCase() === 'FR' ? 'fr' : 'en';
      return levelData[lang];
    } catch (error) {
      this.logger.error('Error getting gap description', error, { questionId, level, scaleType });
      return undefined;
    }
  }
}

