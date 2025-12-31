import { IsEnum, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ScaleType } from '../../readiness-assessment/dto/readiness-assessment.dto';

export class IncrementUserStatisticsDto {
  @IsEnum(ScaleType)
  category: ScaleType;

  @IsNumber()
  @Type(() => Number)
  @Min(1)
  @Max(9)
  level: number;
}

