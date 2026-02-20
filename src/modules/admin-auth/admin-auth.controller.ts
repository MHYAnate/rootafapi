import {
  Controller,
  Post,
  Get,
  Put,
  Patch,
  Body,
  Param,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
  Headers,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import type { Request } from 'express';
import { AdminAuthService } from './admin-auth.service';
import {
  AdminLoginDto,
  CreateAdminDto,
  AdminChangePasswordDto,
  UpdateAdminDto,
} from './dto';
import { AdminJwtAuthGuard } from '../../common/guards';
import { CurrentAdmin, Public } from '../../common/decorators';

@ApiTags('Admin Auth')
@Controller('admin/auth')
export class AdminAuthController {
  constructor(private readonly service: AdminAuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Admin login' })
  login(@Body() dto: AdminLoginDto, @Req() req: Request) {
    const ip =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
      req.socket.remoteAddress;
    return this.service.login(dto, ip);
  }

  @UseGuards(AdminJwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('admin-jwt')
  @ApiOperation({ summary: 'Admin logout' })
  logout(
    @CurrentAdmin('id') adminId: string,
    @Headers('authorization') auth: string,
  ) {
    const token = auth?.replace('Bearer ', '');
    return this.service.logout(adminId, token);
  }

  @UseGuards(AdminJwtAuthGuard)
  @Post('create')
  @ApiBearerAuth('admin-jwt')
  @ApiOperation({ summary: 'Create new admin (Super Admin only)' })
  createAdmin(
    @Body() dto: CreateAdminDto,
    @CurrentAdmin('id') adminId: string,
  ) {
    return this.service.createAdmin(dto, adminId);
  }

  @UseGuards(AdminJwtAuthGuard)
  @Put(':id')
  @ApiBearerAuth('admin-jwt')
  @ApiOperation({ summary: 'Update admin (Super Admin only)' })
  updateAdmin(
    @Param('id') id: string,
    @Body() dto: UpdateAdminDto,
    @CurrentAdmin('id') adminId: string,
  ) {
    return this.service.updateAdmin(id, dto, adminId);
  }

  @UseGuards(AdminJwtAuthGuard)
  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('admin-jwt')
  @ApiOperation({ summary: 'Change own password' })
  changePassword(
    @CurrentAdmin('id') adminId: string,
    @Body() dto: AdminChangePasswordDto,
  ) {
    return this.service.changePassword(adminId, dto);
  }

  @UseGuards(AdminJwtAuthGuard)
  @Post(':id/reset-password')
  @ApiBearerAuth('admin-jwt')
  @ApiOperation({ summary: 'Reset another admin password (Super Admin)' })
  resetPassword(
    @Param('id') id: string,
    @Body('newPassword') newPassword: string,
    @CurrentAdmin('id') adminId: string,
  ) {
    return this.service.resetAdminPassword(id, newPassword, adminId);
  }

  @UseGuards(AdminJwtAuthGuard)
  @Get('profile')
  @ApiBearerAuth('admin-jwt')
  @ApiOperation({ summary: 'Get current admin profile' })
  getProfile(@CurrentAdmin('id') adminId: string) {
    return this.service.getProfile(adminId);
  }

  @UseGuards(AdminJwtAuthGuard)
  @Get('all')
  @ApiBearerAuth('admin-jwt')
  @ApiOperation({ summary: 'Get all admin accounts' })
  getAllAdmins() {
    return this.service.getAllAdmins();
  }

  @UseGuards(AdminJwtAuthGuard)
  @Patch(':id/toggle-status')
  @ApiBearerAuth('admin-jwt')
  @ApiOperation({ summary: 'Activate/deactivate admin (Super Admin)' })
  toggleStatus(
    @Param('id') id: string,
    @CurrentAdmin('id') adminId: string,
  ) {
    return this.service.toggleAdminStatus(id, adminId);
  }

  @UseGuards(AdminJwtAuthGuard)
  @Get(':id/sessions')
  @ApiBearerAuth('admin-jwt')
  @ApiOperation({ summary: 'Get admin sessions' })
  getSessions(@Param('id') id: string) {
    return this.service.getAdminSessions(id);
  }

  @UseGuards(AdminJwtAuthGuard)
  @Post(':id/terminate-sessions')
  @ApiBearerAuth('admin-jwt')
  @ApiOperation({ summary: 'Force terminate all admin sessions' })
  terminateSessions(
    @Param('id') id: string,
    @CurrentAdmin('id') adminId: string,
  ) {
    return this.service.terminateAllSessions(id, adminId);
  }
}