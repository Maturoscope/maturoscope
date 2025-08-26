import { IsString } from 'class-validator';

export class UpdateRoleIntegrationAuth0Dto {
  @IsString()
  userId: string;

  @IsString()
  userRoles: string[];
}
