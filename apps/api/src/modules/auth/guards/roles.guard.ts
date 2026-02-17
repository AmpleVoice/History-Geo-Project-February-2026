import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // No roles required, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Check if user has required role (with hierarchy)
    const hasRole = this.checkRoleHierarchy(user.role, requiredRoles);

    if (!hasRole) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }

  /**
   * Check role with hierarchy: ADMIN > EDITOR > VIEWER
   */
  private checkRoleHierarchy(userRole: UserRole, requiredRoles: UserRole[]): boolean {
    const roleHierarchy: Record<UserRole, number> = {
      VIEWER: 1,
      EDITOR: 2,
      ADMIN: 3,
    };

    const userLevel = roleHierarchy[userRole];

    // User has access if their level is >= any required role level
    return requiredRoles.some((role) => userLevel >= roleHierarchy[role]);
  }
}
