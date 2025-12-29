import { RegistrationStatus } from '../helpers/registration-status.helper';
import { User } from '../entities/user.entity';

export interface UserResponseDto extends Omit<User, 'organization'> {
  registrationStatus: RegistrationStatus;
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
  };
}

