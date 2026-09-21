import { ScaleType } from '../entities';

export class GapCoverageResponseDto {
  questionId: string;
  level: number;
  scaleType: ScaleType;
}

export class ServiceTranslationDto {
  languageCode: string;
  name: string;
  description: string;
}

export class ServiceResponseDto {
  id: string;
  organizationId: string;
  name?: string;
  nameEn: string;
  nameFr: string;
  description?: string;
  descriptionEn: string;
  descriptionFr: string;
  // Per-language translations (en, fr, es, it, sl, el), for the edit flow.
  translations: ServiceTranslationDto[];
  url: string;
  mainContactFirstName: string;
  mainContactLastName: string;
  mainContactEmail: string;
  secondaryContactFirstName: string;
  secondaryContactLastName: string;
  secondaryContactEmail: string;
  gapCoverages: GapCoverageResponseDto[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class ServiceSummaryDto {
  id: string;
  name?: string; // Optional, generated from nameEn
  nameEn: string;
  nameFr: string;
  description?: string; // Optional, generated from descriptionEn
  descriptionEn: string;
  descriptionFr: string;
  url: string;
  mainContact: {
    firstName: string;
    lastName: string;
    email: string;
  };
  secondaryContact: {
    firstName: string;
    lastName: string;
    email: string;
  };
  scales: {
    type: ScaleType;
    levels: number[];
  }[];
  isActive: boolean;
}

export class RecommendedServiceDto {
  id: string;
  name: string;
  nameEn: string;
  nameFr: string;
  description: string;
  descriptionEn: string;
  descriptionFr: string;
  url: string;
  mainContact: {
    firstName: string;
    lastName: string;
    email: string;
  };
  secondaryContact: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

