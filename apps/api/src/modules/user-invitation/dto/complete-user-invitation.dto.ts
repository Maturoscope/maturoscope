import { IsNotEmpty, IsString } from 'class-validator';

export class CompleteUserInvitationDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsString()
  @IsNotEmpty()
  authId: string;
}

