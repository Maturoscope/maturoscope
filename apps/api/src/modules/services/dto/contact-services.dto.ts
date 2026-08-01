import {
  IsString,
  IsEmail,
  IsArray,
  IsUUID,
  IsOptional,
  IsNotEmpty,
  IsNumber,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

// Strips control characters (incl. CR/LF, guarding against email header
// injection) and trims surrounding whitespace.
const sanitizeText = ({ value }: { value: unknown }) =>
  typeof value === 'string'
    ? value.replace(/[\x00-\x1F\x7F]+/g, '').trim()
    : value;

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

  @Transform(sanitizeText)
  @IsString()
  @MaxLength(60)
  @IsOptional()
  projectName?: string;

  @IsString()
  @IsOptional()
  reportPdfBase64?: string;
}
