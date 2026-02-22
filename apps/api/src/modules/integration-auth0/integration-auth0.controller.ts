import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { IntegrationAuth0Service } from './integration-auth0.service';
import { UpdateRoleIntegrationAuth0Dto } from './dto/upadate-role-integration-auth0.dto';

@ApiTags('auth0')
@Controller('auth0')
export class IntegrationAuth0Controller {
  constructor(private readonly auth0Service: IntegrationAuth0Service) {}

  @Post('assign-role')
  @ApiOperation({ 
    summary: 'Assign role to Auth0 user (Internal)',
    description: 'Assigns roles to a user in Auth0. This is an internal endpoint for Auth0 integration.'
  })
  @ApiResponse({ status: 200, description: 'Role assigned successfully' })
  @ApiResponse({ status: 400, description: 'Invalid user ID or roles' })
  @ApiResponse({ status: 500, description: 'Auth0 integration error' })
  async assignRole(@Body() body: UpdateRoleIntegrationAuth0Dto) {
    return this.auth0Service.assignRoleToUser(body.userId, body.roles);
  }
}
