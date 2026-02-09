import {
  IsObject,
  IsEnum,
  IsNumber,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum ScaleType {
  TRL = 'TRL',
  MkRL = 'MkRL',
  MfRL = 'MfRL',
}

export class I18nText {
  en: string;
  fr: string;
}

export class QuestionI18nDto {
  id: string;
  question: I18nText;
  levels: Record<string, I18nText>;
}

export class ScaleQuestionsI18nDto {
  name: I18nText;
  abbreviation: string;
  questions: QuestionI18nDto[];
}

export class AllQuestionsI18nDto {
  TRL: ScaleQuestionsI18nDto;
  MkRL: ScaleQuestionsI18nDto;
  MfRL: ScaleQuestionsI18nDto;
}

export class RecommendedServiceDto {
  id: string;
  name: I18nText;
  description: I18nText;
  url: string;
  mainContact: {
    firstName: string;
    lastName: string;
    email: string;
  };
  secondaryContact: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export class ScaleResultI18nDto {
  scale: string;
  readinessLevel: number;
  lowestLevels: Array<{
    questionId: string;
    questionText: I18nText;
    selectedLevel: string;
  }>;
  developmentPhase: {
    phase: number;
    phaseName: I18nText;
    focusGoal: I18nText;
    scaleRange: string;
  };
  gaps: Array<{
    questionId: string;
    level: number;
    gapDescription: I18nText;
    hasServices: boolean;
    recommendedServices: RecommendedServiceDto[];
  }>;
}

export class RiskAnalysisResultI18nDto {
  overallPhase: number;
  phasesMatch: boolean;
  risks: Array<{
    scale: string;
    readinessLevel: number;
    phase: number;
    isLowest: boolean;
    strategicFocus?: I18nText;
    primaryRisk?: I18nText;
  }>;
  recommendations: I18nText[];
}

// Keep interface version for internal use
export interface I18nTextInterface {
  en: string;
  fr: string;
}

export class AssessScaleDto {
  @IsEnum(ScaleType)
  scale: ScaleType;

  @IsObject()
  answers: Record<string, string>;
}

export class ScaleLevelInput {
  @IsEnum(ScaleType)
  scale: ScaleType;

  @IsNumber()
  readinessLevel: number;

  @IsNumber()
  phase: number;
}

export class RiskAnalysisDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ScaleLevelInput)
  scales: ScaleLevelInput[];
}
