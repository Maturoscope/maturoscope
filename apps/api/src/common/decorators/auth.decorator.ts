import { applyDecorators, UseGuards, SetMetadata } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthRoleGuard } from '../auth-module/guards/auth-role.guard';
import { ValidRoles } from '../auth-module/interfaces/valid-roles';

export const META_ROLES = 'roles';

export function Auth(...roles: ValidRoles[]) {
  return applyDecorators(
    SetMetadata(META_ROLES, roles),
    UseGuards(AuthGuard(), AuthRoleGuard),
  );
}
