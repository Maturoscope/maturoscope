import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UploadedFile,
  UseInterceptors,
  Req,
  Query,
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth, 
  ApiParam, 
  ApiQuery,
  ApiConsumes,
  ApiBody
} from '@nestjs/swagger';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { Auth } from 'src/common';
import { ValidRoles } from 'src/common/auth-module/interfaces/valid-roles';
import { FileInterceptor } from '@nestjs/platform-express';
import type { UploadedFile as UploadedFileType } from '../../common/types/uploaded-file.type';

@ApiTags('organizations')
@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Auth(ValidRoles.admin)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Create new organization',
    description: 'Creates a new organization. Requires admin role.'
  })
  @ApiResponse({ status: 201, description: 'Organization created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  create(@Body() createOrganizationDto: CreateOrganizationDto) {
    return this.organizationsService.create(createOrganizationDto);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Get all organizations',
    description: 'Retrieves all organizations. Can optionally include registration status.'
  })
  @ApiQuery({ name: 'withStatus', required: false, description: 'Include registration status (true/false)', example: 'true' })
  @ApiResponse({ status: 200, description: 'List of organizations' })
  findAll(@Query('withStatus') withStatus?: string) {
    if (withStatus === 'true') {
      return this.organizationsService.findAllWithRegistrationStatus();
    }
    return this.organizationsService.findAll();
  }

  @Auth(ValidRoles.user)
  @Patch('avatar')
  @UseInterceptors(FileInterceptor('file'))
  @ApiBearerAuth('JWT-auth')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ 
    summary: 'Update organization avatar',
    description: 'Uploads and updates the avatar for the current user\'s organization.'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Avatar image file'
        }
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Avatar updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  updateAvatarForCurrentUser(
    @Req() req: { user?: { email?: string } },
    @UploadedFile() file: UploadedFileType,
  ) {
    const user = req.user as { email?: string } | undefined;
    return this.organizationsService.updateAvatarByUserEmail(user?.email, file);
  }

  @Auth(ValidRoles.user)
  @Delete('avatar')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Remove organization avatar',
    description: 'Removes the avatar for the current user\'s organization.'
  })
  @ApiResponse({ status: 200, description: 'Avatar removed successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  removeAvatarForCurrentUser(
    @Req() req: { user?: { email?: string } },
  ) {
    const user = req.user as { email?: string } | undefined;
    return this.organizationsService.removeAvatarByUserEmail(user?.email);
  }

  @Auth(ValidRoles.user)
  @Patch('signature')
  @UseInterceptors(FileInterceptor('file'))
  @ApiBearerAuth('JWT-auth')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ 
    summary: 'Update organization signature',
    description: 'Uploads and updates the signature image for the current user\'s organization.'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Signature image file'
        }
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Signature updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  updateSignatureForCurrentUser(
    @Req() req: { user?: { email?: string } },
    @UploadedFile() file: UploadedFileType,
  ) {
    const user = req.user as { email?: string } | undefined;
    return this.organizationsService.updateSignatureByUserEmail(user?.email, file);
  }

  @Auth(ValidRoles.user)
  @Delete('signature')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Remove organization signature',
    description: 'Removes the signature image for the current user\'s organization.'
  })
  @ApiResponse({ status: 200, description: 'Signature removed successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  removeSignatureForCurrentUser(
    @Req() req: { user?: { email?: string } },
  ) {
    const user = req.user as { email?: string } | undefined;
    return this.organizationsService.removeSignatureByUserEmail(user?.email);
  }

  @Auth(ValidRoles.user)
  @Patch('language')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Update organization language',
    description: 'Updates the preferred language for the current user\'s organization.'
  })
  @ApiResponse({ status: 200, description: 'Language updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  updateLanguageForCurrentUser(
    @Req() req: { user?: { email?: string } },
    @Body() updateLanguageDto: { language: string },
  ) {
    const user = req.user as { email?: string } | undefined;
    return this.organizationsService.updateLanguageByUserEmail(user?.email, updateLanguageDto.language);
  }

  // Specific routes must come before parameterized routes to avoid route conflicts
  @Get('key/:key')
  @ApiOperation({ 
    summary: 'Get organization by key',
    description: 'Retrieves an organization by its unique key (e.g., "synopp").'
  })
  @ApiParam({ name: 'key', description: 'Organization unique key', example: 'synopp' })
  @ApiResponse({ status: 200, description: 'Organization found' })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  findByKey(@Param('key') key: string) {
    return this.organizationsService.findByKey(key);
  }

  @Auth(ValidRoles.user)
  @Patch('profile')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Update organization profile',
    description: 'Updates the profile information (name, key, email) for the current user\'s organization.'
  })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  updateProfileForCurrentUser(
    @Req() req: { user?: { email?: string } },
    @Body() updateData: { name: string; key: string; email: string },
  ) {
    const user = req.user as { email?: string } | undefined;
    return this.organizationsService.updateProfileByUserEmail(user?.email, updateData);
  }

  // Parameterized routes come after specific routes
  @Get(':id')
  @ApiOperation({ 
    summary: 'Get organization by ID',
    description: 'Retrieves an organization by its UUID.'
  })
  @ApiParam({ name: 'id', description: 'Organization UUID', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiResponse({ status: 200, description: 'Organization found' })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  findOne(@Param('id') id: string) {
    return this.organizationsService.findOne(id);
  }

  @Auth(ValidRoles.user)
  @Patch(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Update organization',
    description: 'Updates an organization by its UUID.'
  })
  @ApiParam({ name: 'id', description: 'Organization UUID', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiResponse({ status: 200, description: 'Organization updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  update(
    @Param('id') id: string,
    @Body() updateOrganizationDto: UpdateOrganizationDto,
  ) {
    return this.organizationsService.update(id, updateOrganizationDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ 
    summary: 'Delete organization',
    description: 'Deletes an organization by its UUID.'
  })
  @ApiParam({ name: 'id', description: 'Organization UUID', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiResponse({ status: 204, description: 'Organization deleted successfully' })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  remove(@Param('id') id: string) {
    return this.organizationsService.remove(id);
  }
}
