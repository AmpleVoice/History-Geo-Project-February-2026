import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('audit')
@Controller('audit')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@ApiBearerAuth()
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @ApiOperation({ summary: 'Get recent audit logs (Admin only)' })
  async getRecent(@Query('limit') limit?: string) {
    return this.auditService.findRecent(parseInt(limit || '100'));
  }

  @Get('entity/:type/:id')
  @ApiOperation({ summary: 'Get audit logs for a specific entity' })
  async getByEntity(@Param('type') type: string, @Param('id') id: string) {
    return this.auditService.findByEntity(type, id);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get audit logs for a specific user' })
  async getByUser(@Param('userId') userId: string, @Query('limit') limit?: string) {
    return this.auditService.findByUser(userId, parseInt(limit || '50'));
  }
}
