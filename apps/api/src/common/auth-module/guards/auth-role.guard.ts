import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { META_ROLES } from '../../decorators/auth.decorator';
import { UsersService } from '../../../modules/users/users.service';
import { IntegrationAuth0Service } from '../../../modules/integration-auth0/integration-auth0.service';
import { getRolesMapped } from '../interfaces/valid-roles';

@Injectable()
export class AuthRoleGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly usersService: UsersService,
    private readonly auth0Service: IntegrationAuth0Service,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const validateRoles = this.reflector.get<string[]>(
      META_ROLES,
      context.getHandler(),
    );
    if (!validateRoles) return true;
    if (!validateRoles.length) return true;

    const req = context.switchToHttp().getRequest();
    const user = req.user;
    if (!user) throw new Error('User not found');

    const existingUser = await this.usersService.findByUserEmail(
      user.email,
    );

    if (!existingUser) {
      throw new ForbiddenException(
        'This user does not exist in database. Please contact Maturescope support - User: ' +
          user.email,
      );
    }
      const rolesMapped = getRolesMapped();

      if (!existingUser.authId) {
        const validRoles = existingUser.roles
          ?.filter((role) => role && rolesMapped[role])
          .map((role) => rolesMapped[role]) || [];
      if (validRoles.length > 0) {
      
        await this.auth0Service.assignRoleToUser(user.sub, validRoles);
      }
      // Change the authId for userId from Auth0.
      await this.usersService.updateUser(existingUser.email, {
        ...user,
        authId: user.sub,
      });
    }

    const roles = await this.usersService.getUserRoles(
      existingUser.id,
    );
    const hasRole = validateRoles.some((role) => roles.includes(role));
    if (!hasRole) {
      throw new ForbiddenException(
        'You do not have permission to access this route - User: ' +
          user.name,
      );
    }

    return hasRole;
  }
}
