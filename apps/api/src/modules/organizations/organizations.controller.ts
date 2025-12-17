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
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { Auth } from 'src/common';
import { ValidRoles } from 'src/common/auth-module/interfaces/valid-roles';
import { FileInterceptor } from '@nestjs/platform-express';
import type { UploadedFile as UploadedFileType } from '../../common/types/uploaded-file.type';

@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Auth(ValidRoles.admin)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createOrganizationDto: CreateOrganizationDto) {
    return this.organizationsService.create(createOrganizationDto);
  }

  @Get()
  findAll(@Query('withStatus') withStatus?: string) {
    if (withStatus === 'true') {
      return this.organizationsService.findAllWithRegistrationStatus();
    }
    return this.organizationsService.findAll();
  }

  @Auth(ValidRoles.user)
  @Patch('avatar')
  @UseInterceptors(FileInterceptor('file'))
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
  removeAvatarForCurrentUser(
    @Req() req: { user?: { email?: string } },
  ) {
    const user = req.user as { email?: string } | undefined;
    return this.organizationsService.removeAvatarByUserEmail(user?.email);
  }

  @Auth(ValidRoles.user)
  @Patch('signature')
  @UseInterceptors(FileInterceptor('file'))
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
  removeSignatureForCurrentUser(
    @Req() req: { user?: { email?: string } },
  ) {
    const user = req.user as { email?: string } | undefined;
    return this.organizationsService.removeSignatureByUserEmail(user?.email);
  }

  @Auth(ValidRoles.user)
  @Patch('language')
  @HttpCode(HttpStatus.OK)
  updateLanguageForCurrentUser(
    @Req() req: { user?: { email?: string } },
    @Body() updateLanguageDto: { language: string },
  ) {
    const user = req.user as { email?: string } | undefined;
    return this.organizationsService.updateLanguageByUserEmail(user?.email, updateLanguageDto.language);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.organizationsService.findOne(id);
  }

  @Get('key/:key')
  findByKey(@Param('key') key: string) {
    return this.organizationsService.findByKey(key);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateOrganizationDto: UpdateOrganizationDto,
  ) {
    return this.organizationsService.update(id, updateOrganizationDto);
  }

  @Auth(ValidRoles.user)
  @Patch('profile')
  updateProfileForCurrentUser(
    @Req() req: { user?: { email?: string } },
    @Body() updateData: { name: string; key: string; email: string },
  ) {
    const user = req.user as { email?: string } | undefined;
    return this.organizationsService.updateProfileByUserEmail(user?.email, updateData);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.organizationsService.remove(id);
  }
}
