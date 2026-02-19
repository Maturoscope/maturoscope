import {
  IsString,
  IsEmail,
  IsArray,
  IsUUID,
  IsOptional,
  IsNotEmpty,
  IsNumber,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class GapDto {
  @IsString()
  @IsNotEmpty()
  questionId: string;

  @IsNumber()
  @IsNotEmpty()
  level: number;

  @IsArray()
  @IsUUID('4', { each: true })
  @IsNotEmpty()
  recommendedServices: string[];
}

export class ContactServicesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GapDto)
  @IsNotEmpty()
  gaps: GapDto[];

  @IsString()
  @IsOptional()
  company?: string;

  @IsString()
  @IsOptional()
  organization?: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @IsString()
  @IsOptional()
  additionalInformation?: string;

  @IsString()
  @IsOptional()
  projectName?: string;

  @IsString()
  @IsOptional()
  reportPdfBase64?: string;
}

