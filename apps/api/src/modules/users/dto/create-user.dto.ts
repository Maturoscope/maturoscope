import { IsString, IsEmail, IsOptional, MinLength, MaxLength, IsArray, ArrayMinSize, ArrayMaxSize } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  firstName: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  secondName: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  company?: string;

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
}
