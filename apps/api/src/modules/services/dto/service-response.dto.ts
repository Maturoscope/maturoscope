import { ScaleType } from '../entities';

export class GapCoverageResponseDto {
  questionId: string;
  level: number;
  scaleType: ScaleType;
}

export class ServiceResponseDto {
  id: string;
  organizationId: string;
  name: string;
  description: string;
  url: string;
  mainContactFirstName: string;
  mainContactLastName: string;
  mainContactEmail: string;
  secondaryContactFirstName: string;
  secondaryContactLastName: string;
  secondaryContactEmail: string;
  gapCoverages: GapCoverageResponseDto[];
  createdAt: Date;
  updatedAt: Date;
}

export class ServiceSummaryDto {
  id: string;
  name: string;
  description: string;
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
}

export class RecommendedServiceDto {
  id: string;
  name: string;
  description: string;
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

