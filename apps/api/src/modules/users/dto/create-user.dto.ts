import { IsString, IsOptional, MinLength, MaxLength, IsArray, ArrayMinSize, ArrayMaxSize, IsUUID, IsBoolean, IsEmail } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ 
    description: 'Organization UUID',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @IsUUID()
  organizationId: string;

  @ApiPropertyOptional({ 
    description: 'Auth0 user ID',
    example: 'auth0|123456789'
  })
  @IsOptional()
  @IsString()
  authId?: string;

  @ApiProperty({ 
    description: 'User first name',
    minLength: 2,
    maxLength: 100,
    example: 'John'
  })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  firstName: string;

  @ApiProperty({ 
    description: 'User last name',
    minLength: 2,
    maxLength: 100,
    example: 'Doe'
  })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  lastName: string;

  @ApiProperty({ 
    description: 'User email address',
    maxLength: 255,
    example: 'john.doe@example.com'
  })
  @IsEmail()
  @MaxLength(255)
  email: string;

  @ApiPropertyOptional({ 
    description: 'User roles',
    type: [String],
    example: ['user'],
    minItems: 1,
    maxItems: 10
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  @IsString({ each: true })
  @MaxLength(50, { each: true })
  roles?: string[];

  @ApiPropertyOptional({ 
    description: 'User account status',
    example: true
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
