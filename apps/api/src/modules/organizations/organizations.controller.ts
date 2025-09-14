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
  findAll() {
    return this.organizationsService.findAll();
  }

  @Get('key/:key')
  findByKey(@Param('key') key: string) {
    return this.organizationsService.findByKey(key);
  }

  @Auth(ValidRoles.user)
  @Patch('avatar')
  @UseInterceptors(FileInterceptor('file'))
  updateAvatarForCurrentUser(
    @Req() req: any,
    @UploadedFile() file: UploadedFileType,
  ) {
    const user = req.user as { email?: string } | undefined;
    return this.organizationsService.updateAvatarByUserEmail(user?.email, file);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.organizationsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrganizationDto: UpdateOrganizationDto) {
    return this.organizationsService.update(id, updateOrganizationDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.organizationsService.remove(id);
  }
}
