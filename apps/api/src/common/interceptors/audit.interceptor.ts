import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditAction } from '@prisma/client';
import { Prisma } from '@prisma/client';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const path = request.route?.path || request.url;
    const user = request.user;

    // Only audit mutations
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      return next.handle();
    }

    // Skip auth routes
    if (path.includes('/auth/')) {
      return next.handle();
    }

    const startTime = Date.now();
    const entityType = this.getEntityType(path);
    const entityId = request.params?.id;
    const oldData = request.body ? { ...request.body } : null;

    return next.handle().pipe(
      tap({
        next: async (result) => {
          try {
            if (user?.id && entityType) {
              const action = this.getAction(method);
              await this.prisma.auditLog.create({
                data: {
                  userId: user.id,
                  entityType,
                  entityId: entityId || result?.id || 'unknown',
                  action,
                  oldData: method === 'PUT' || method === 'PATCH' ? oldData : null,
                  newData: result || null,
                  ipAddress: request.ip || request.headers['x-forwarded-for'],
                },
              });
            }
          } catch (err) {
            console.error('Failed to create audit log:', err);
          }
        },
        error: (err) => {
          // Log failed attempts too
          if (user?.id && entityType) {
            this.prisma.auditLog.create({
              data: {
                userId: user.id,
                entityType,
                entityId: entityId || 'unknown',
                action: this.getAction(method),
                oldData: { error: err.message, attempted: oldData },
                newData: Prisma.DbNull,
                ipAddress: request.ip,
              },
            }).catch(console.error);
          }
        },
      }),
    );
  }

  private getEntityType(path: string): string | null {
    if (path.includes('/events')) return 'event';
    if (path.includes('/sources')) return 'source';
    if (path.includes('/regions')) return 'region';
    if (path.includes('/users')) return 'user';
    if (path.includes('/people')) return 'person';
    return null;
  }

  private getAction(method: string): AuditAction {
    switch (method) {
      case 'POST':
        return 'CREATE';
      case 'PUT':
      case 'PATCH':
        return 'UPDATE';
      case 'DELETE':
        return 'DELETE';
      default:
        return 'UPDATE';
    }
  }
}
