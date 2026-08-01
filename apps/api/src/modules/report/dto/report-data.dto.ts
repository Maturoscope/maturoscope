import { Type, Transform } from 'class-transformer';
import {
  IsString,
  IsBoolean,
  IsNumber,
  IsArray,
  ValidateNested,
  IsOptional,
  MaxLength,
} from 'class-validator';

// Strips control characters and trims surrounding whitespace.
const sanitizeText = ({ value }: { value: unknown }) =>
  typeof value === 'string'
    ? value.replace(/[\x00-\x1F\x7F]+/g, '').trim()
    : value;

export class RecommendedServicePayload {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsString()
  @IsOptional()
  url?: string;
}

export class GapDto {
  @IsString()
  gapDescription: string;

  @IsBoolean()
  hasServices: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecommendedServicePayload)
  recommendedServices: RecommendedServicePayload[];
}

export class AnswerDto {
  @IsString()
  question: string;

  @IsString()
  answer: string;

  @IsString()
  @IsOptional()
  comment: string;
}

export class ScaleDataDto {
  @IsNumber()
  level: number;

  @IsNumber()
  phase: number;

  @IsString()
  phaseName: string;

  @IsString()
  phaseGoal: string;

  @IsString()
  strategicFocus: string;

  @IsString()
  primaryRisk: string;

  @IsBoolean()
  isLowest: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GapDto)
  gaps: GapDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswerDto)
  answers: AnswerDto[];
}

export class ReportDataDto {
  @IsString()
  completedOn: string;

  @Transform(sanitizeText)
  @IsString()
  @MaxLength(60)
  @IsOptional()
  projectName?: string;

  @IsString()
  @IsOptional()
  signature?: string;

  @ValidateNested()
  @Type(() => ScaleDataDto)
  trl: ScaleDataDto;

  @ValidateNested()
  @Type(() => ScaleDataDto)
  mkrl: ScaleDataDto;

  @ValidateNested()
  @Type(() => ScaleDataDto)
  mfrl: ScaleDataDto;
}
