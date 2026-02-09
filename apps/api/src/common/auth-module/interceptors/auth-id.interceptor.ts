import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { UsersService } from '../../../modules/users/users.service';
import { IntegrationAuth0Service } from '../../../modules/integration-auth0/integration-auth0.service';
import { getRolesMapped } from '../interfaces/valid-roles';

@Injectable()
export class AuthIdInterceptor implements NestInterceptor {
  constructor(
    private readonly usersService: UsersService,
    private readonly auth0Service: IntegrationAuth0Service,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<unknown>> {
    const req = context.switchToHttp().getRequest();
    const user = req.user as { email?: string; name?: string; sub?: string } | undefined;

    // Only process if user is authenticated
    if (user && user.email && user.sub) {
      try {
        const existingUser = await this.usersService.findByUserEmail(user.email);

        if (existingUser && !existingUser.authId) {
          // Assign roles if user has roles
          const rolesMapped = getRolesMapped();
          const validRoles = existingUser.roles
            ?.filter((role) => role && rolesMapped[role])
            .map((role) => rolesMapped[role]) || [];

          if (validRoles.length > 0) {
            await this.auth0Service.assignRoleToUser(user.sub, validRoles);
          }

          // Persist only the authId from Auth0; do not override local roles or other fields
          await this.usersService.updateUser(existingUser.email, {
            authId: user.sub,
          });
        }
      } catch (error) {
        // Log error but don't block the request
        console.error('Error assigning authId in interceptor:', error);
      }
    }

    return next.handle();
  }
}

