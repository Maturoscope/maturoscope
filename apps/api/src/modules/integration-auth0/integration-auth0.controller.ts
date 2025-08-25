import { Controller, Post, Body } from '@nestjs/common';
import { IntegrationAuth0Service } from './integration-auth0.service';
import { UpdateRoleIntegrationAuth0Dto } from './dto/upadate-role-integration-auth0.dto';

@Controller('auth0')
export class IntegrationAuth0Controller {
  constructor(private readonly auth0Service: IntegrationAuth0Service) {}

  @Post('assign-role')
  async assignRole(@Body() body: UpdateRoleIntegrationAuth0Dto) {
    return this.auth0Service.assignRoleToUser(body.userId, body.userRoles);
  }
}
