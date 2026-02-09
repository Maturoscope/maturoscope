import { RegistrationStatus } from '../../users/helpers/registration-status.helper';

export interface OrganizationResponseDto {
  id: string;
  name: string;
  email: string;
  key: string;
  isActive: boolean;
  createdAt: Date;
  registrationStatus: RegistrationStatus;
  userEmail?: string;
}

