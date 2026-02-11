import { IsString, IsEmail, IsOptional, MinLength, MaxLength, IsEnum, IsUrl } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrganizationStatus } from '../entities/organization.entity';

export class CreateOrganizationDto {
  @ApiProperty({ 
    description: 'Unique organization key (used in URLs)',
    minLength: 2,
    maxLength: 50,
    example: 'synopp'
  })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  key: string;

  @ApiProperty({ 
    description: 'Organization name',
    minLength: 2,
    maxLength: 255,
    example: 'Synopp Technologies'
  })
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  name: string;

  @ApiProperty({ 
    description: 'Organization email address',
    maxLength: 255,
    example: 'contact@synopp.com'
  })
  @IsEmail()
  @MaxLength(255)
  email: string;

  @ApiPropertyOptional({ 
    description: 'Custom font family',
    example: 'Inter'
  })
  @IsOptional()
  @IsString()
  font?: string;

  @ApiPropertyOptional({ 
    description: 'Theme color or identifier',
    example: '#1F2937'
  })
  @IsOptional()
  @IsString()
  theme?: string;

  @ApiPropertyOptional({ 
    description: 'URL to organization signature image',
    example: 'https://storage.example.com/signatures/org-signature.png'
  })
  @IsOptional()
  @IsString()
  signature?: string;

  @ApiPropertyOptional({ 
    description: 'Preferred language (en or fr)',
    example: 'en'
  })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiPropertyOptional({ 
    description: 'URL to organization avatar/logo',
    example: 'https://storage.example.com/avatars/org-logo.png'
  })
  @IsOptional()
  @IsUrl()
  avatar?: string;

  @ApiPropertyOptional({ 
    description: 'Organization status',
    enum: OrganizationStatus,
    example: OrganizationStatus.ACTIVE
  })
  @IsOptional()
  @IsEnum(OrganizationStatus)
  status?: OrganizationStatus;
}
