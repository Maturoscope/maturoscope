import { IsArray, IsEnum, ArrayNotEmpty } from 'class-validator';
import { ScaleType } from '../../readiness-assessment/dto/readiness-assessment.dto';

export class TrackStartedScalesDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(ScaleType, { each: true })
  scales: ScaleType[];
}
