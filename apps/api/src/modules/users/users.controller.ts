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
  ForbiddenException,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UuidParamDto } from './dto/uuid-param.dto';
import { Auth } from '../../common/decorators/auth.decorator';
import { ValidRoles } from '../../common/auth-module/interfaces/valid-roles';
import { Request } from 'express';
import { AuthenticatedUser } from '../../common/auth-module/interfaces/authenticated-user.interface';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Auth(ValidRoles.admin)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Create a new user (admin only)',
    description: 'Directly creates a user record. Requires admin role. Normal user creation flows go through POST /user-invitation/invite, which calls this service internally.',
  })
  @ApiResponse({ status: 201, description: 'User successfully created' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Missing or invalid JWT token' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Auth()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Get all users',
    description: 'Retrieves a list of all users in the system. Requires authentication.'
  })
  @ApiResponse({ status: 200, description: 'List of users retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing JWT token' })
  findAll() {
   return this.usersService.findAll();
  }

  @Get('organization/:organizationId')
  @Auth()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Get users by organization',
    description: 'Retrieves all users belonging to a specific organization. The requester must belong to the same organization.'
  })
  @ApiParam({ name: 'organizationId', description: 'UUID of the organization', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiResponse({ status: 200, description: 'List of users in the organization' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - User does not have access to this organization' })
  async findByOrganization(
    @Param('organizationId') organizationId: string,
    @Req() req: Request & { user?: AuthenticatedUser },
  ) {
    const requesterEmail = req.user?.email;
    if (!requesterEmail) {
      throw new ForbiddenException('Unable to determine requester identity');
    }

    const requester = await this.usersService.findByUserEmail(requesterEmail);

    // Access is allowed for platform super-admins, or for members with an active
    // membership in the requested organization (multi-organization aware).
    const isMember =
      !!requester &&
      (await this.usersService.hasActiveMembership(requester.id, organizationId));
    if (!requester || (!requester.isSuperAdmin && !isMember)) {
      throw new ForbiddenException('You do not have access to this organization');
    }

    // Return all users including the admin (user with same email as organization)
    return this.usersService.findByOrganization(organizationId);
  }

  @Get('email/:email')
  @Auth()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Get user by email',
    description: 'Retrieves a user by their email address.'
  })
  @ApiParam({ name: 'email', description: 'User email address', example: 'user@example.com' })
  @ApiResponse({ status: 200, description: 'User found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  findByEmail(@Param('email') email: string) {
    return this.usersService.findByEmail(email);
  }

  @Get(':id')
  @Auth(ValidRoles.admin)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Get user by ID',
    description: 'Retrieves a specific user by their UUID. Requires admin role.'
  })
  @ApiParam({ name: 'id', description: 'User UUID', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiResponse({ status: 200, description: 'User found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 404, description: 'User not found' })
  findOne(@Param() params: UuidParamDto) {
    return this.usersService.findOne(params.id);
  }

  @Patch(':id')
  @Auth()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Update user by ID',
    description: 'Updates user information by UUID.'
  })
  @ApiParam({ name: 'id', description: 'User UUID', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  update(@Param() params: UuidParamDto, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(params.id, updateUserDto);
  }

  @Patch('email/:email')
  @Auth()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Update user by email',
    description: 'Updates user information by email address.'
  })
  @ApiParam({ name: 'email', description: 'User email address', example: 'user@example.com' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  updateByEmail(@Param('email') email: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.updateByEmail(email, updateUserDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Auth()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Delete user',
    description: 'Deletes a user by their UUID.'
  })
  @ApiParam({ name: 'id', description: 'User UUID', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiResponse({ status: 204, description: 'User deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  remove(@Param() params: UuidParamDto) {
    return this.usersService.remove(params.id);
  }

  // --- Current user's organization memberships (multi-organization) ---

  private async getRequesterId(req: Request & { user?: AuthenticatedUser }): Promise<string> {
    const email = req.user?.email;
    if (!email) {
      throw new ForbiddenException('Unable to determine requester identity');
    }
    const requester = await this.usersService.findByUserEmail(email);
    if (!requester) {
      throw new ForbiddenException('User not found');
    }
    return requester.id;
  }

  @Get('me/organizations')
  @Auth()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: "Current user's organizations",
    description: 'Active memberships (with the default flagged) and pending invitations.',
  })
  @ApiResponse({ status: 200, description: 'Memberships overview' })
  async getMyOrganizations(@Req() req: Request & { user?: AuthenticatedUser }) {
    const userId = await this.getRequesterId(req);
    const memberships = await this.usersService.getMembershipsOverview(userId);

    const toSummary = (m: (typeof memberships)[number]) => ({
      id: m.organization.id,
      key: m.organization.key,
      name: m.organization.name,
      avatar: m.organization.avatar,
      isDefault: m.isDefault,
      invitedAt: m.invitedAt,
      joinedAt: m.joinedAt,
    });

    return {
      active: memberships
        .filter((m) => m.status === 'active')
        .map(toSummary),
      pending: memberships
        .filter((m) => m.status === 'invited')
        .map(toSummary),
    };
  }

  @Post('me/organizations/:organizationId/accept')
  @Auth()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Accept a pending organization invitation' })
  @ApiParam({ name: 'organizationId', description: 'Organization UUID' })
  @ApiResponse({ status: 201, description: 'Invitation accepted' })
  async acceptInvitation(
    @Param('organizationId') organizationId: string,
    @Req() req: Request & { user?: AuthenticatedUser },
  ) {
    const userId = await this.getRequesterId(req);
    await this.usersService.acceptInvitation(userId, organizationId);
    return { message: 'Invitation accepted' };
  }

  @Post('me/organizations/:organizationId/decline')
  @Auth()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Decline a pending organization invitation' })
  @ApiParam({ name: 'organizationId', description: 'Organization UUID' })
  @ApiResponse({ status: 201, description: 'Invitation declined' })
  async declineInvitation(
    @Param('organizationId') organizationId: string,
    @Req() req: Request & { user?: AuthenticatedUser },
  ) {
    const userId = await this.getRequesterId(req);
    await this.usersService.declineInvitation(userId, organizationId);
    return { message: 'Invitation declined' };
  }

  @Post('me/organizations/:organizationId/leave')
  @Auth()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Leave an organization (not the default one)' })
  @ApiParam({ name: 'organizationId', description: 'Organization UUID' })
  @ApiResponse({ status: 201, description: 'Left the organization' })
  @ApiResponse({ status: 400, description: 'Cannot leave the default organization' })
  async leaveOrganization(
    @Param('organizationId') organizationId: string,
    @Req() req: Request & { user?: AuthenticatedUser },
  ) {
    const userId = await this.getRequesterId(req);
    await this.usersService.leaveOrganization(userId, organizationId);
    return { message: 'Left the organization' };
  }

  @Patch('me/organizations/default')
  @Auth()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Set the default organization' })
  @ApiResponse({ status: 200, description: 'Default organization updated' })
  @ApiResponse({ status: 400, description: 'Organization must be an active membership' })
  async setDefaultOrganization(
    @Body('organizationId') organizationId: string,
    @Req() req: Request & { user?: AuthenticatedUser },
  ) {
    if (!organizationId) {
      throw new ForbiddenException('organizationId is required');
    }
    const userId = await this.getRequesterId(req);
    await this.usersService.setDefaultOrganization(userId, organizationId);
    return { message: 'Default organization updated' };
  }
}
