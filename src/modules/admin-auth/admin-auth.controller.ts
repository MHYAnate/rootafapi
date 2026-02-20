import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminAuthService } from './admin-auth.service';
import { AdminLoginDto, CreateAdminDto, AdminChangePasswordDto } from './dto';
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
  login(@Body() dto: AdminLoginDto) {
    return this.service.login(dto);
  }

  @UseGuards(AdminJwtAuthGuard)
  @Post('create')
  @ApiBearerAuth('admin-jwt')
  @ApiOperation({ summary: 'Create new admin (Super Admin only)' })
  createAdmin(@Body() dto: CreateAdminDto, @CurrentAdmin('id') adminId: string) {
    return this.service.createAdmin(dto, adminId);
  }

  @UseGuards(AdminJwtAuthGuard)
  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('admin-jwt')
  @ApiOperation({ summary: 'Change admin password' })
  changePassword(@CurrentAdmin('id') adminId: string, @Body() dto: AdminChangePasswordDto) {
    return this.service.changePassword(adminId, dto);
  }

  @UseGuards(AdminJwtAuthGuard)
  @Get('profile')
  @ApiBearerAuth('admin-jwt')
  @ApiOperation({ summary: 'Get admin profile' })
  getProfile(@CurrentAdmin('id') adminId: string) {
    return this.service.getProfile(adminId);
  }

  @UseGuards(AdminJwtAuthGuard)
  @Get('all')
  @ApiBearerAuth('admin-jwt')
  @ApiOperation({ summary: 'Get all admins' })
  getAllAdmins(@CurrentAdmin('id') adminId: string) {
    return this.service.getAllAdmins(adminId);
  }

  @UseGuards(AdminJwtAuthGuard)
  @Patch(':id/toggle-status')
  @ApiBearerAuth('admin-jwt')
  @ApiOperation({ summary: 'Activate/deactivate admin' })
  toggleStatus(@Param('id') id: string, @CurrentAdmin('id') adminId: string) {
    return this.service.toggleAdminStatus(id, adminId);
  }
}