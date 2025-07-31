import { applyDecorators, UseGuards } from '@nestjs/common';
import { type UserRole } from '@prisma/client';
import { AuthGuard } from '../guards/auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from './roles.decorator';

export function Authorization(...roles: UserRole[]) {
  if (roles.length === 0) {
    return applyDecorators(UseGuards(AuthGuard));
  }
  return applyDecorators(Roles(...roles), UseGuards(AuthGuard, RolesGuard));
}
