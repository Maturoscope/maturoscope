import { IsEmail, IsUUID, MaxLength } from 'class-validator';

export class ResendInvitationDto {
  @IsEmail()
  @MaxLength(255)
  email: string;

  @IsUUID()
  organizationId: string;
}
