import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { ServicesService } from './services.service';
import { CreateServiceDto, UpdateServiceDto } from './dto';
import { Auth } from '../../common/decorators/auth.decorator';
import { Request } from 'express';
import { AuthenticatedUser } from '../../common/auth-module/interfaces/authenticated-user.interface';
import { UsersService } from '../users/users.service';

@Controller('services')
export class ServicesController {
  constructor(
    private readonly servicesService: ServicesService,
    private readonly usersService: UsersService,
  ) {}

  private async getOrganizationId(req: Request & { user?: AuthenticatedUser }): Promise<string> {
    const email = req.user?.email;
    if (!email) {
      throw new ForbiddenException('Unable to determine requester identity');
    }

    const user = await this.usersService.findByUserEmail(email);
    if (!user || !user.organizationId) {
      throw new ForbiddenException('User or organization not found');
    }

    return user.organizationId;
  }

  @Post()
  @Auth()
  async create(
    @Req() req: Request & { user?: AuthenticatedUser },
    @Body() createServiceDto: CreateServiceDto,
  ) {
    const organizationId = await this.getOrganizationId(req);
    return this.servicesService.create(organizationId, createServiceDto);
  }

  @Get()
  @Auth()
  async findAll(@Req() req: Request & { user?: AuthenticatedUser }) {
    const organizationId = await this.getOrganizationId(req);
    return this.servicesService.findAll(organizationId);
  }

  @Get('satisfaction-options')
  @Auth()
  async getSatisfactionOptions(@Req() req: Request & { user?: AuthenticatedUser }) {
    await this.getOrganizationId(req); // Ensure user is authenticated
    return this.servicesService.getServiceSatisfactionOptions();
  }

  @Get(':id')
  @Auth()
  async findOne(
    @Req() req: Request & { user?: AuthenticatedUser },
    @Param('id') id: string,
  ) {
    const organizationId = await this.getOrganizationId(req);
    return this.servicesService.findOne(organizationId, id);
  }

  @Patch(':id')
  @Auth()
  async update(
    @Req() req: Request & { user?: AuthenticatedUser },
    @Param('id') id: string,
    @Body() updateServiceDto: UpdateServiceDto,
  ) {
    const organizationId = await this.getOrganizationId(req);
    return this.servicesService.update(organizationId, id, updateServiceDto);
  }

  @Delete(':id')
  @Auth()
  async remove(
    @Req() req: Request & { user?: AuthenticatedUser },
    @Param('id') id: string,
  ) {
    const organizationId = await this.getOrganizationId(req);
    return this.servicesService.remove(organizationId, id);
  }
}

