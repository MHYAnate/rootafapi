import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AdminRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { PasswordUtil } from '../../common/utils';
import { AdminLoginDto } from './dto/admin-login.dto';
import { CreateAdminDto } from './dto/create-admin.dto';
import { AdminChangePasswordDto } from './dto/admin-change-password.dto';

@Injectable()
export class AdminAuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async login(dto: AdminLoginDto) {
    const admin = await this.prisma.adminUser.findUnique({
      where: { username: dto.username },
    });
    if (!admin) throw new UnauthorizedException('Invalid credentials');

    if (admin.lockedUntil && admin.lockedUntil > new Date()) {
      throw new UnauthorizedException('Account locked. Try again later.');
    }

    const valid = await PasswordUtil.compare(dto.password, admin.passwordHash);
    if (!valid) {
      const attempts = admin.failedLoginAttempts + 1;
      await this.prisma.adminUser.update({
        where: { id: admin.id },
        data: {
          failedLoginAttempts: attempts,
          ...(attempts >= 5 && {
            lockedUntil: new Date(Date.now() + 60 * 60 * 1000),
          }),
        },
      });
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!admin.isActive) throw new UnauthorizedException('Account deactivated');

    const token = this.jwtService.sign(
      { sub: admin.id, username: admin.username, role: admin.role },
      {
        secret: this.configService.get('ADMIN_JWT_SECRET'),
        expiresIn: this.configService.get('ADMIN_JWT_EXPIRATION', '8h'),
      },
    );

    await this.prisma.adminUser.update({
      where: { id: admin.id },
      data: {
        lastLoginAt: new Date(),
        loginCount: { increment: 1 },
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    });

    await this.prisma.adminActivityLog.create({
      data: {
        adminId: admin.id,
        actionType: 'LOGIN',
        actionDescription: `Admin ${admin.username} logged in`,
      },
    });

    return {
      message: 'Login successful',
      data: {
        accessToken: token,
        admin: {
          id: admin.id,
          username: admin.username,
          fullName: admin.fullName,
          role: admin.role,
          mustChangePassword: admin.mustChangePassword,
        },
      },
    };
  }

  async createAdmin(dto: CreateAdminDto, createdById: string) {
    const existing = await this.prisma.adminUser.findUnique({
      where: { username: dto.username },
    });
    if (existing) throw new ConflictException('Username already exists');

    const rounds = parseInt(this.configService.get('BCRYPT_SALT_ROUNDS', '12'));
    const hash = await PasswordUtil.hash(dto.password, rounds);

    const admin = await this.prisma.adminUser.create({
      data: {
        username: dto.username,
        passwordHash: hash,
        fullName: dto.fullName,
        role: dto.role,
        email: dto.email,
        phoneNumber: dto.phoneNumber,
        canVerifyMembers: dto.canVerifyMembers ?? false,
        canVerifyClients: dto.canVerifyClients ?? false,
        canResetPasswords: dto.canResetPasswords ?? false,
        canManageContent: dto.canManageContent ?? false,
        canManageEvents: dto.canManageEvents ?? false,
        canManageAdmins: dto.canManageAdmins ?? false,
        canExportData: dto.canExportData ?? false,
        canAccessReports: dto.canAccessReports ?? false,
        mustChangePassword: true,
        createdByAdminId: createdById,
      },
    });

    await this.prisma.adminActivityLog.create({
      data: {
        adminId: createdById,
        actionType: 'ADMIN_CREATED',
        actionDescription: `Created admin ${admin.username}`,
        targetType: 'admin',
        targetId: admin.id,
        targetName: admin.fullName,
      },
    });

    return {
      message: 'Admin created successfully',
      data: {
        id: admin.id,
        username: admin.username,
        fullName: admin.fullName,
        role: admin.role,
      },
    };
  }

  async changePassword(adminId: string, dto: AdminChangePasswordDto) {
    const admin = await this.prisma.adminUser.findUnique({ where: { id: adminId } });
    if (!admin) throw new NotFoundException('Admin not found');

    const valid = await PasswordUtil.compare(dto.currentPassword, admin.passwordHash);
    if (!valid) throw new BadRequestException('Current password is incorrect');

    const rounds = parseInt(this.configService.get('BCRYPT_SALT_ROUNDS', '12'));
    const hash = await PasswordUtil.hash(dto.newPassword, rounds);

    await this.prisma.adminUser.update({
      where: { id: adminId },
      data: { passwordHash: hash, mustChangePassword: false },
    });

    return { message: 'Password changed successfully' };
  }

  async getProfile(adminId: string) {
    const admin = await this.prisma.adminUser.findUnique({
      where: { id: adminId },
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        phoneNumber: true,
        role: true,
        isActive: true,
        canVerifyMembers: true,
        canVerifyClients: true,
        canResetPasswords: true,
        canManageContent: true,
        canManageEvents: true,
        canManageAdmins: true,
        canExportData: true,
        canAccessReports: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });
    if (!admin) throw new NotFoundException('Admin not found');
    return { data: admin };
  }

  async getAllAdmins(requestingAdminId: string) {
    const admins = await this.prisma.adminUser.findMany({
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return { data: admins };
  }

  async toggleAdminStatus(adminId: string, requestingAdminId: string) {
    if (adminId === requestingAdminId) {
      throw new ForbiddenException('Cannot deactivate your own account');
    }
    const admin = await this.prisma.adminUser.findUnique({ where: { id: adminId } });
    if (!admin) throw new NotFoundException('Admin not found');

    const updated = await this.prisma.adminUser.update({
      where: { id: adminId },
      data: {
        isActive: !admin.isActive,
        deactivatedAt: admin.isActive ? new Date() : null,
      },
    });

    await this.prisma.adminActivityLog.create({
      data: {
        adminId: requestingAdminId,
        actionType: updated.isActive ? 'ADMIN_REACTIVATED' : 'ADMIN_DEACTIVATED',
        actionDescription: `${updated.isActive ? 'Reactivated' : 'Deactivated'} admin ${admin.username}`,
        targetType: 'admin',
        targetId: adminId,
        targetName: admin.fullName,
      },
    });

    return {
      message: `Admin ${updated.isActive ? 'reactivated' : 'deactivated'} successfully`,
    };
  }
}