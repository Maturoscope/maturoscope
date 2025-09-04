import { IsString, IsOptional, MinLength, MaxLength, IsArray, ArrayMinSize, ArrayMaxSize, IsUUID, IsBoolean, IsEmail } from 'class-validator';

export class CreateUserDto {
  @IsUUID()
  organizationId: string;

  @IsOptional()
  @IsString()
  authId?: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  firstName: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  lastName: string;

  @IsEmail()
  @MaxLength(255)
  email: string;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  @IsString({ each: true })
  @MaxLength(50, { each: true })
  roles?: string[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
