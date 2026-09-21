import {
  IsArray,
  IsOptional,
  IsString,
  IsBoolean,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LanguageCode } from '../../../common/i18n/languages';

/** One service row inside a "manage translations" view. */
export class ServiceTranslationEntryDto {
  serviceId: string;
  /** Source text in the organization's default language (read-only reference). */
  sourceName: string;
  sourceDescription: string;
  /** Target-language text (what the user edits). */
  name: string;
  description: string;
  nameStatus: 'done' | 'missing';
  descriptionStatus: 'done' | 'missing';
}

export class GetTranslationsResponseDto {
  language: LanguageCode;
  defaultLanguage: LanguageCode;
  /** Fields filled / total (services × 2) for this language, over the returned services. */
  progress: { translated: number; total: number };
  services: ServiceTranslationEntryDto[];
}

export class SaveTranslationEntryDto {
  @ApiProperty({ description: 'Service UUID' })
  @IsUUID()
  serviceId: string;

  @ApiPropertyOptional({ description: 'Translated service name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Translated service description' })
  @IsOptional()
  @IsString()
  description?: string;
}

export class SaveTranslationsDto {
  @ApiProperty({ description: 'Target language code (en, fr, es, it, sl, el)' })
  @IsString()
  language: string;

  @ApiProperty({ type: [SaveTranslationEntryDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaveTranslationEntryDto)
  entries: SaveTranslationEntryDto[];
}

export class SetLanguageEnabledDto {
  @ApiProperty({ description: 'Turn the language on or off' })
  @IsBoolean()
  enabled: boolean;
}

export class SetDefaultLanguageDto {
  @ApiProperty({ description: 'New default language code (must be Live)' })
  @IsString()
  language: string;
}
