import { IsString, IsEmail, IsOptional, MinLength, MaxLength, IsEnum, IsUrl } from 'class-validator';
import { OrganizationStatus } from '../entities/organization.entity';

export class CreateOrganizationDto {
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  key: string;

  @IsString()
  @MinLength(2)
  @MaxLength(255)
  name: string;

  @IsEmail()
  @MaxLength(255)
  email: string;

  @IsOptional()
  @IsString()
  font?: string;

  @IsOptional()
  @IsString()
  theme?: string;

  @IsOptional()
  @IsString()
  signature?: string;

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsUrl()
  avatar?: string;

  @IsOptional()
  @IsEnum(OrganizationStatus)
  status?: OrganizationStatus;
}
