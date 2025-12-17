import { Type } from 'class-transformer';
import {
  IsString,
  IsBoolean,
  IsNumber,
  IsArray,
  ValidateNested,
  IsOptional,
} from 'class-validator';

export class GapDto {
  @IsString()
  gapDescription: string;

  @IsBoolean()
  hasServices: boolean;
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
