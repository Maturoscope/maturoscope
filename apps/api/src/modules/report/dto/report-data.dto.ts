import { Type, Transform } from 'class-transformer';
import {
  IsString,
  IsBoolean,
  IsNumber,
  IsArray,
  ValidateNested,
  IsOptional,
  MaxLength,
  Matches,
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

  // When true the answer is "Not applicable": no comment line is rendered.
  @IsBoolean()
  @IsOptional()
  notApplicable?: boolean;
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

  // True when the scale was fully marked "Not applicable": no score/gaps.
  @IsBoolean()
  @IsOptional()
  notScored?: boolean;

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

  // Organization accent colour (hex) — used for the service links. Restricted
  // to a hex value since it is interpolated into an inline `style` attribute.
  @IsString()
  @IsOptional()
  @Matches(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/)
  accentColor?: string;

  // The user chooses which scales to assess (1, 2 or all 3), so each scale is
  // optional; only the assessed ones are sent and rendered in the PDF.
  @IsOptional()
  @ValidateNested()
  @Type(() => ScaleDataDto)
  trl?: ScaleDataDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ScaleDataDto)
  mkrl?: ScaleDataDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ScaleDataDto)
  mfrl?: ScaleDataDto;
}
