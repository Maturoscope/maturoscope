import { applyDecorators, UseGuards, SetMetadata } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtLoggingAuthGuard } from '../auth-module/guards/jwt-logging.guard';
import { AuthRoleGuard } from '../auth-module/guards/auth-role.guard';
import { ValidRoles } from '../auth-module/interfaces/valid-roles';

export const META_ROLES = 'roles';

export function Auth(...roles: ValidRoles[]) {
  const guardToUse = process.env.AUTH_DEBUG !== 'false' ? JwtLoggingAuthGuard : AuthGuard('jwt');
  return applyDecorators(SetMetadata(META_ROLES, roles), UseGuards(guardToUse, AuthRoleGuard));
}
