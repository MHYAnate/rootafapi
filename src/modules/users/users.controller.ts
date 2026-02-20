import { Controller, Get, Patch, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { AdminJwtAuthGuard } from '../../common/guards';
import { CurrentAdmin } from '../../common/decorators';

@ApiTags('Users')
@Controller('admin/users')
@UseGuards(AdminJwtAuthGuard)
@ApiBearerAuth('admin-jwt')
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all users (Admin)' })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('userType') userType?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.service.findAll({ page, limit, userType, status, search });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID (Admin)' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id/suspend')
  @ApiOperation({ summary: 'Suspend user (Admin)' })
  suspend(
    @Param('id') id: string,
    @CurrentAdmin('id') adminId: string,
    @Body('reason') reason: string,
  ) {
    return this.service.suspendUser(id, adminId, reason);
  }

  @Patch(':id/reactivate')
  @ApiOperation({ summary: 'Reactivate user (Admin)' })
  reactivate(@Param('id') id: string, @CurrentAdmin('id') adminId: string) {
    return this.service.reactivateUser(id, adminId);
  }
}