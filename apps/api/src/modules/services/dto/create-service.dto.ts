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
  IsOptional,
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
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  nameEn?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  nameFr?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  descriptionEn?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  descriptionFr?: string;

  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  url?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  mainContactFirstName?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  mainContactLastName?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  mainContactEmail?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  secondaryContactFirstName?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  secondaryContactLastName?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  secondaryContactEmail?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => GapCoverageDto)
  gapCoverages: GapCoverageDto[];
}

