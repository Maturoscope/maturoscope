import { IsArray, ArrayMinSize, ArrayMaxSize, IsEmail, IsString, MaxLength, IsUUID } from 'class-validator';

export class CreateUserInvitationDto {
  @IsEmail()
  @MaxLength(255)
  email: string;

  @IsString()
  @MaxLength(100)
  firstName: string;

  @IsString()
  @MaxLength(100)
  lastName: string;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  @IsString({ each: true })
  roles: string[];

  @IsUUID()
  organizationId: string;
}

