import {
  IsString,
  IsEmail,
  IsUrl,
  IsArray,
  ValidateNested,
  ArrayMinSize,
  IsEnum,
  IsInt,
  Min,
  Max,
  MinLength,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum ScaleType {
  TRL = 'TRL',
  MkRL = 'MkRL',
  MfRL = 'MfRL',
}

export class GapCoverageDto {
  @IsString()
  questionId: string;

  @IsInt()
  @Min(1)
  @Max(9)
  level: number;

  @IsEnum(ScaleType)
  scaleType: ScaleType;
}

export class CreateServiceDto {
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name: string;

  @IsString()
  @MinLength(1)
  description: string;

  @IsUrl()
  @MaxLength(500)
  url: string;

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  mainContactFirstName: string;

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  mainContactLastName: string;

  @IsEmail()
  @MaxLength(255)
  mainContactEmail: string;

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  secondaryContactFirstName: string;

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  secondaryContactLastName: string;

  @IsEmail()
  @MaxLength(255)
  secondaryContactEmail: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => GapCoverageDto)
  gapCoverages: GapCoverageDto[];
}

