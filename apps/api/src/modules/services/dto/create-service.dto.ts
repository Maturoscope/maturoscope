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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ScaleType {
  TRL = 'TRL',
  MkRL = 'MkRL',
  MfRL = 'MfRL',
}

export class GapCoverageDto {
  @ApiProperty({ 
    description: 'Question ID from readiness assessment',
    example: 'Q1.1'
  })
  @IsString()
  questionId: string;

  @ApiProperty({ 
    description: 'Maturity level (1-9)',
    minimum: 1,
    maximum: 9,
    example: 5
  })
  @IsInt()
  @Min(1)
  @Max(9)
  level: number;

  @ApiProperty({ 
    description: 'Maturity scale type',
    enum: ScaleType,
    example: ScaleType.TRL
  })
  @IsEnum(ScaleType)
  scaleType: ScaleType;
}

export class CreateServiceDto {
  @ApiPropertyOptional({ 
    description: 'Service name (deprecated, use nameEn/nameFr)',
    maxLength: 255,
    example: 'Technology Consulting'
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({ 
    description: 'Service name in English',
    minLength: 1,
    maxLength: 255,
    example: 'Technology Readiness Consulting'
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  nameEn?: string;

  @ApiPropertyOptional({ 
    description: 'Service name in French',
    minLength: 1,
    maxLength: 255,
    example: 'Conseil en maturité technologique'
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  nameFr?: string;

  @ApiPropertyOptional({ 
    description: 'Service description (deprecated, use descriptionEn/descriptionFr)',
    example: 'We help companies assess and improve their technology maturity'
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ 
    description: 'Service description in English',
    minLength: 1,
    example: 'Expert consulting services to improve your technology readiness level'
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  descriptionEn?: string;

  @ApiPropertyOptional({ 
    description: 'Service description in French',
    minLength: 1,
    example: 'Services de conseil expert pour améliorer votre niveau de maturité technologique'
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  descriptionFr?: string;

  @ApiPropertyOptional({ 
    description: 'Service website URL',
    maxLength: 500,
    example: 'https://www.example-consulting.com'
  })
  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  url?: string;

  @ApiPropertyOptional({ 
    description: 'Main contact first name',
    minLength: 1,
    maxLength: 100,
    example: 'Jane'
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  mainContactFirstName?: string;

  @ApiPropertyOptional({ 
    description: 'Main contact last name',
    minLength: 1,
    maxLength: 100,
    example: 'Smith'
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  mainContactLastName?: string;

  @ApiPropertyOptional({ 
    description: 'Main contact email',
    maxLength: 255,
    example: 'jane.smith@example-consulting.com'
  })
  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  mainContactEmail?: string;

  @ApiPropertyOptional({ 
    description: 'Secondary contact first name',
    minLength: 1,
    maxLength: 100,
    example: 'Bob'
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  secondaryContactFirstName?: string;

  @ApiPropertyOptional({ 
    description: 'Secondary contact last name',
    minLength: 1,
    maxLength: 100,
    example: 'Johnson'
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  secondaryContactLastName?: string;

  @ApiPropertyOptional({ 
    description: 'Secondary contact email',
    maxLength: 255,
    example: 'bob.johnson@example-consulting.com'
  })
  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  secondaryContactEmail?: string;

  @ApiProperty({ 
    description: 'Array of gap coverages this service addresses',
    type: [GapCoverageDto],
    minItems: 1
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => GapCoverageDto)
  gapCoverages: GapCoverageDto[];
}

