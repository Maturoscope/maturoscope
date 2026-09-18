import { RegistrationStatus } from '../helpers/registration-status.helper';
import { User } from '../entities/user.entity';

export interface UserResponseDto extends Omit<User, 'organization' | 'memberships'> {
  registrationStatus: RegistrationStatus;
  // In an organization members list: the user left this organization (kept as an
  // inactive membership; reactivating requires re-inviting).
  hasLeft?: boolean;
  // Multi-organization context (populated when memberships are loaded).
  defaultOrganizationId?: string;
  // Organization a session should start on (accessible default / first accessible).
  sessionOrganizationId?: string;
  pendingInvitationsCount?: number;
  organization?: {
    id: string;
    key: string;
    name: string;
    email?: string;
    avatar?: string;
    signature?: string;
    language?: string;
    font?: string;
    theme?: string;
    url?: string;
  };
}

