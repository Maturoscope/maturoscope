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
  Query,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ServicesService } from './services.service';
import { CreateServiceDto, UpdateServiceDto, ContactServicesDto } from './dto';
import { Auth } from '../../common/decorators/auth.decorator';
import { Request } from 'express';
import { AuthenticatedUser } from '../../common/auth-module/interfaces/authenticated-user.interface';
import { UsersService } from '../users/users.service';

@ApiTags('services')
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
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Create new service',
    description: 'Creates a new service for the authenticated user\'s organization.'
  })
  @ApiResponse({ status: 201, description: 'Service created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - User not found or no organization' })
  async create(
    @Req() req: Request & { user?: AuthenticatedUser },
    @Body() createServiceDto: CreateServiceDto,
  ) {
    const organizationId = await this.getOrganizationId(req);
    return this.servicesService.create(organizationId, createServiceDto);
  }

  @Get()
  @Auth()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Get all services',
    description: 'Retrieves all services for the authenticated user\'s organization.'
  })
  @ApiResponse({ status: 200, description: 'List of services' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - User not found or no organization' })
  async findAll(@Req() req: Request & { user?: AuthenticatedUser }) {
    const organizationId = await this.getOrganizationId(req);
    return this.servicesService.findAll(organizationId);
  }

  @Get('satisfaction-options')
  @Auth()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Get service satisfaction options',
    description: 'Retrieves available satisfaction rating options for services.'
  })
  @ApiResponse({ status: 200, description: 'List of satisfaction options' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getSatisfactionOptions(@Req() req: Request & { user?: AuthenticatedUser }) {
    await this.getOrganizationId(req); // Ensure user is authenticated
    return this.servicesService.getServiceSatisfactionOptions();
  }

  @Get(':id')
  @Auth()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Get service by ID',
    description: 'Retrieves a specific service by its UUID from the user\'s organization.'
  })
  @ApiParam({ name: 'id', description: 'Service UUID', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiResponse({ status: 200, description: 'Service found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Service not found' })
  async findOne(
    @Req() req: Request & { user?: AuthenticatedUser },
    @Param('id') id: string,
  ) {
    const organizationId = await this.getOrganizationId(req);
    return this.servicesService.findOne(organizationId, id);
  }

  @Patch(':id')
  @Auth()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Update service',
    description: 'Updates a service by its UUID within the user\'s organization.'
  })
  @ApiParam({ name: 'id', description: 'Service UUID', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiResponse({ status: 200, description: 'Service updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Service not found' })
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
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Delete service',
    description: 'Deletes a service by its UUID from the user\'s organization.'
  })
  @ApiParam({ name: 'id', description: 'Service UUID', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiResponse({ status: 200, description: 'Service deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Service not found' })
  async remove(
    @Req() req: Request & { user?: AuthenticatedUser },
    @Param('id') id: string,
  ) {
    const organizationId = await this.getOrganizationId(req);
    return this.servicesService.remove(organizationId, id);
  }

  @Post('contact')
  @ApiOperation({ 
    summary: 'Contact services (PUBLIC)',
    description: 'Sends contact emails to service providers based on assessment gaps. This is a PUBLIC endpoint used by end-users.'
  })
  @ApiQuery({ name: 'organizationKey', description: 'Organization unique key', example: 'synopp', required: true })
  @ApiResponse({ status: 200, description: 'Emails sent successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - organizationKey required' })
  @ApiResponse({ status: 404, description: 'Organization or services not found' })
  async contactServices(
    @Query('organizationKey') organizationKey: string,
    @Body() contactServicesDto: ContactServicesDto,
  ) {
    if (!organizationKey) {
      throw new BadRequestException('organizationKey query parameter is required');
    }

    return this.servicesService.contactServices(organizationKey, contactServicesDto);
  }
}

