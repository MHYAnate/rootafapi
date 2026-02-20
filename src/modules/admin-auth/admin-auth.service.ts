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
import { AdminRole, AdminActionType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { PasswordUtil } from '../../common/utils';
import { AdminLoginDto } from './dto/admin-login.dto';
import { CreateAdminDto } from './dto/create-admin.dto';
import { AdminChangePasswordDto } from './dto/admin-change-password.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';

@Injectable()
export class AdminAuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  // ═══════════════════════════════════════════════════════════
  // ADMIN ACTIVITY LOGGER — Used across all admin operations
  // ═══════════════════════════════════════════════════════════
  async logActivity(
    adminId: string,
    actionType: AdminActionType,
    description: string,
    targetType?: string,
    targetId?: string,
    targetName?: string,
    previousValues?: any,
    newValues?: any,
    changedFields?: string[],
    ipAddress?: string,
  ) {
    await this.prisma.adminActivityLog.create({
      data: {
        adminId,
        actionType,
        actionDescription: description,
        targetType,
        targetId,
        targetName,
        previousValues,
        newValues,
        changedFields,
        ipAddress,
      },
    });
  }

  // ═══════════════════════════════════════════════════════════
  // ADMIN LOGIN
  // ═══════════════════════════════════════════════════════════
  async login(dto: AdminLoginDto, ipAddress?: string) {
    const admin = await this.prisma.adminUser.findUnique({
      where: { username: dto.username },
    });
    if (!admin) throw new UnauthorizedException('Invalid credentials');

    if (admin.lockedUntil && admin.lockedUntil > new Date()) {
      const minutesLeft = Math.ceil(
        (admin.lockedUntil.getTime() - Date.now()) / 60000,
      );
      throw new UnauthorizedException(
        `Account locked. Try again in ${minutesLeft} minutes.`,
      );
    }

    const valid = await PasswordUtil.compare(dto.password, admin.passwordHash);
    if (!valid) {
      const attempts = admin.failedLoginAttempts + 1;
      const lockData: any = { failedLoginAttempts: attempts };
      if (attempts >= 5) {
        lockData.lockedUntil = new Date(Date.now() + 60 * 60 * 1000);
      }
      await this.prisma.adminUser.update({
        where: { id: admin.id },
        data: lockData,
      });
      throw new UnauthorizedException(
        `Invalid credentials. ${5 - attempts} attempts remaining.`,
      );
    }

    if (!admin.isActive) throw new UnauthorizedException('Account deactivated');

    const token = this.jwtService.sign(
      { sub: admin.id, username: admin.username, role: admin.role },
      {
        secret: this.configService.get('ADMIN_JWT_SECRET'),
        expiresIn: this.configService.get('ADMIN_JWT_EXPIRATION', '8h'),
      },
    );

    // Create admin session
    const session = await this.prisma.adminSession.create({
      data: {
        adminId: admin.id,
        token,
        ipAddress,
        expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000),
      },
    });

    // Update login tracking
    await this.prisma.adminUser.update({
      where: { id: admin.id },
      data: {
        lastLoginAt: new Date(),
        lastLoginIp: ipAddress,
        loginCount: { increment: 1 },
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    });

    await this.logActivity(
      admin.id,
      AdminActionType.LOGIN,
      `Admin ${admin.username} logged in from ${ipAddress || 'unknown'}`,
      undefined,
      undefined,
      undefined,
      null,
      null,
      undefined,
      ipAddress,
    );

    return {
      message: 'Login successful',
      data: {
        accessToken: token,
        sessionId: session.id,
        admin: {
          id: admin.id,
          username: admin.username,
          fullName: admin.fullName,
          role: admin.role,
          mustChangePassword: admin.mustChangePassword,
          permissions: {
            canVerifyMembers: admin.canVerifyMembers,
            canVerifyClients: admin.canVerifyClients,
            canResetPasswords: admin.canResetPasswords,
            canManageContent: admin.canManageContent,
            canManageEvents: admin.canManageEvents,
            canManageAdmins: admin.canManageAdmins,
            canExportData: admin.canExportData,
            canAccessReports: admin.canAccessReports,
          },
        },
      },
    };
  }

  // ═══════════════════════════════════════════════════════════
  // ADMIN LOGOUT
  // ═══════════════════════════════════════════════════════════
  async logout(adminId: string, token: string) {
    await this.prisma.adminSession.updateMany({
      where: { adminId, token, isActive: true },
      data: {
        isActive: false,
        terminatedAt: new Date(),
        terminatedReason: 'manual_logout',
      },
    });

    await this.logActivity(
      adminId,
      AdminActionType.LOGOUT,
      'Admin logged out',
    );

    return { message: 'Logged out successfully' };
  }

  // ═══════════════════════════════════════════════════════════
  // CREATE ADMIN (Super Admin only)
  // ═══════════════════════════════════════════════════════════
  async createAdmin(dto: CreateAdminDto, createdById: string) {
    const creator = await this.prisma.adminUser.findUnique({
      where: { id: createdById },
    });
    if (!creator || creator.role !== AdminRole.SUPER_ADMIN) {
      throw new ForbiddenException('Only Super Admins can create admin accounts');
    }

    const existing = await this.prisma.adminUser.findUnique({
      where: { username: dto.username },
    });
    if (existing) throw new ConflictException('Username already exists');

    const rounds = parseInt(this.configService.get('BCRYPT_SALT_ROUNDS', '12'));
    const hash = await PasswordUtil.hash(dto.password, rounds);

    // Set permissions based on role
    const permissions = this.getDefaultPermissions(dto.role);

    const admin = await this.prisma.adminUser.create({
      data: {
        username: dto.username,
        passwordHash: hash,
        fullName: dto.fullName,
        role: dto.role,
        email: dto.email,
        phoneNumber: dto.phoneNumber,
        canVerifyMembers: dto.canVerifyMembers ?? permissions.canVerifyMembers,
        canVerifyClients: dto.canVerifyClients ?? permissions.canVerifyClients,
        canResetPasswords: dto.canResetPasswords ?? permissions.canResetPasswords,
        canManageContent: dto.canManageContent ?? permissions.canManageContent,
        canManageEvents: dto.canManageEvents ?? permissions.canManageEvents,
        canManageAdmins: dto.canManageAdmins ?? permissions.canManageAdmins,
        canExportData: dto.canExportData ?? permissions.canExportData,
        canAccessReports: dto.canAccessReports ?? permissions.canAccessReports,
        mustChangePassword: true,
        createdByAdminId: createdById,
      },
    });

    await this.logActivity(
      createdById,
      AdminActionType.ADMIN_CREATED,
      `Created admin account: ${admin.username} (${admin.role})`,
      'admin',
      admin.id,
      admin.fullName,
    );

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

  private getDefaultPermissions(role: AdminRole) {
    switch (role) {
      case AdminRole.SUPER_ADMIN:
        return {
          canVerifyMembers: true,
          canVerifyClients: true,
          canResetPasswords: true,
          canManageContent: true,
          canManageEvents: true,
          canManageAdmins: true,
          canExportData: true,
          canAccessReports: true,
        };
      case AdminRole.VERIFICATION_ADMIN:
        return {
          canVerifyMembers: true,
          canVerifyClients: true,
          canResetPasswords: true,
          canManageContent: false,
          canManageEvents: false,
          canManageAdmins: false,
          canExportData: false,
          canAccessReports: true,
        };
      case AdminRole.CONTENT_ADMIN:
        return {
          canVerifyMembers: false,
          canVerifyClients: false,
          canResetPasswords: false,
          canManageContent: true,
          canManageEvents: true,
          canManageAdmins: false,
          canExportData: false,
          canAccessReports: true,
        };
      case AdminRole.REPORT_ADMIN:
        return {
          canVerifyMembers: false,
          canVerifyClients: false,
          canResetPasswords: false,
          canManageContent: false,
          canManageEvents: false,
          canManageAdmins: false,
          canExportData: true,
          canAccessReports: true,
        };
    }
  }

  // ═══════════════════════════════════════════════════════════
  // UPDATE ADMIN
  // ═══════════════════════════════════════════════════════════
  async updateAdmin(adminId: string, dto: UpdateAdminDto, updatedById: string) {
    const updater = await this.prisma.adminUser.findUnique({
      where: { id: updatedById },
    });
    if (!updater || updater.role !== AdminRole.SUPER_ADMIN) {
      throw new ForbiddenException('Only Super Admins can update admin accounts');
    }

    const admin = await this.prisma.adminUser.findUnique({ where: { id: adminId } });
    if (!admin) throw new NotFoundException('Admin not found');

    const previousValues = {
      fullName: admin.fullName,
      role: admin.role,
      email: admin.email,
      canVerifyMembers: admin.canVerifyMembers,
      canVerifyClients: admin.canVerifyClients,
      canResetPasswords: admin.canResetPasswords,
      canManageContent: admin.canManageContent,
      canManageEvents: admin.canManageEvents,
      canManageAdmins: admin.canManageAdmins,
    };

    const updated = await this.prisma.adminUser.update({
      where: { id: adminId },
      data: { ...dto },
      select: {
        id: true,
        username: true,
        fullName: true,
        role: true,
        email: true,
        isActive: true,
        canVerifyMembers: true,
        canVerifyClients: true,
        canResetPasswords: true,
        canManageContent: true,
        canManageEvents: true,
        canManageAdmins: true,
        canExportData: true,
        canAccessReports: true,
      },
    });

    const changedFields = Object.keys(dto).filter(
      (key) => dto[key] !== undefined,
    );

    await this.logActivity(
      updatedById,
      AdminActionType.ADMIN_UPDATED,
      `Updated admin ${admin.username}: ${changedFields.join(', ')}`,
      'admin',
      adminId,
      admin.fullName,
      previousValues,
      dto,
      changedFields,
    );

    return { message: 'Admin updated', data: updated };
  }

  // ═══════════════════════════════════════════════════════════
  // CHANGE PASSWORD
  // ═══════════════════════════════════════════════════════════
  async changePassword(adminId: string, dto: AdminChangePasswordDto) {
    const admin = await this.prisma.adminUser.findUnique({
      where: { id: adminId },
    });
    if (!admin) throw new NotFoundException('Admin not found');

    const valid = await PasswordUtil.compare(
      dto.currentPassword,
      admin.passwordHash,
    );
    if (!valid) throw new BadRequestException('Current password is incorrect');

    const rounds = parseInt(this.configService.get('BCRYPT_SALT_ROUNDS', '12'));
    const hash = await PasswordUtil.hash(dto.newPassword, rounds);

    await this.prisma.adminUser.update({
      where: { id: adminId },
      data: { passwordHash: hash, mustChangePassword: false },
    });

    await this.logActivity(
      adminId,
      AdminActionType.PASSWORD_CHANGED,
      'Admin changed their password',
    );

    return { message: 'Password changed successfully' };
  }

  // ═══════════════════════════════════════════════════════════
  // RESET ADMIN PASSWORD (Super Admin)
  // ═══════════════════════════════════════════════════════════
  async resetAdminPassword(
    adminId: string,
    newPassword: string,
    resetById: string,
  ) {
    const resetter = await this.prisma.adminUser.findUnique({
      where: { id: resetById },
    });
    if (!resetter || resetter.role !== AdminRole.SUPER_ADMIN) {
      throw new ForbiddenException('Only Super Admins can reset admin passwords');
    }

    const admin = await this.prisma.adminUser.findUnique({
      where: { id: adminId },
    });
    if (!admin) throw new NotFoundException('Admin not found');

    const rounds = parseInt(this.configService.get('BCRYPT_SALT_ROUNDS', '12'));
    const hash = await PasswordUtil.hash(newPassword, rounds);

    await this.prisma.adminUser.update({
      where: { id: adminId },
      data: {
        passwordHash: hash,
        mustChangePassword: true,
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    });

    await this.logActivity(
      resetById,
      AdminActionType.USER_PASSWORD_RESET,
      `Reset password for admin ${admin.username}`,
      'admin',
      adminId,
      admin.fullName,
    );

    return { message: 'Admin password reset. User must change on next login.' };
  }

  // ═══════════════════════════════════════════════════════════
  // GET ADMIN PROFILE
  // ═══════════════════════════════════════════════════════════
  async getProfile(adminId: string) {
    const admin = await this.prisma.adminUser.findUnique({
      where: { id: adminId },
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        phoneNumber: true,
        profilePhotoUrl: true,
        role: true,
        isActive: true,
        mustChangePassword: true,
        canVerifyMembers: true,
        canVerifyClients: true,
        canResetPasswords: true,
        canManageContent: true,
        canManageEvents: true,
        canManageAdmins: true,
        canExportData: true,
        canAccessReports: true,
        lastLoginAt: true,
        lastLoginIp: true,
        loginCount: true,
        createdAt: true,
        createdByAdmin: {
          select: { fullName: true, username: true },
        },
      },
    });
    if (!admin) throw new NotFoundException('Admin not found');
    return { data: admin };
  }

  // ═══════════════════════════════════════════════════════════
  // GET ALL ADMINS
  // ═══════════════════════════════════════════════════════════
  async getAllAdmins() {
    const admins = await this.prisma.adminUser.findMany({
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        loginCount: true,
        createdAt: true,
        deactivatedAt: true,
        canVerifyMembers: true,
        canVerifyClients: true,
        canResetPasswords: true,
        canManageContent: true,
        canManageEvents: true,
        canManageAdmins: true,
        canExportData: true,
        canAccessReports: true,
      },
      orderBy: { createdAt: 'asc' },
    });
    return { data: admins };
  }

  // ═══════════════════════════════════════════════════════════
  // TOGGLE ADMIN STATUS
  // ═══════════════════════════════════════════════════════════
  async toggleAdminStatus(adminId: string, requestingAdminId: string) {
    if (adminId === requestingAdminId) {
      throw new ForbiddenException('Cannot deactivate your own account');
    }

    const requester = await this.prisma.adminUser.findUnique({
      where: { id: requestingAdminId },
    });
    if (!requester || requester.role !== AdminRole.SUPER_ADMIN) {
      throw new ForbiddenException('Only Super Admins can toggle admin status');
    }

    const admin = await this.prisma.adminUser.findUnique({
      where: { id: adminId },
    });
    if (!admin) throw new NotFoundException('Admin not found');

    const newStatus = !admin.isActive;
    await this.prisma.adminUser.update({
      where: { id: adminId },
      data: {
        isActive: newStatus,
        deactivatedAt: newStatus ? null : new Date(),
      },
    });

    // Terminate all active sessions if deactivating
    if (!newStatus) {
      await this.prisma.adminSession.updateMany({
        where: { adminId, isActive: true },
        data: {
          isActive: false,
          terminatedAt: new Date(),
          terminatedReason: 'admin_deactivated',
        },
      });
    }

    await this.logActivity(
      requestingAdminId,
      newStatus
        ? AdminActionType.ADMIN_REACTIVATED
        : AdminActionType.ADMIN_DEACTIVATED,
      `${newStatus ? 'Reactivated' : 'Deactivated'} admin ${admin.username}`,
      'admin',
      adminId,
      admin.fullName,
    );

    return {
      message: `Admin ${newStatus ? 'reactivated' : 'deactivated'} successfully`,
    };
  }

  // ═══════════════════════════════════════════════════════════
  // GET ADMIN SESSIONS
  // ═══════════════════════════════════════════════════════════
  async getAdminSessions(adminId: string) {
    const sessions = await this.prisma.adminSession.findMany({
      where: { adminId },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true,
        ipAddress: true,
        deviceInfo: true,
        isActive: true,
        createdAt: true,
        lastUsedAt: true,
        terminatedAt: true,
        terminatedReason: true,
      },
    });
    return { data: sessions };
  }

  // ═══════════════════════════════════════════════════════════
  // TERMINATE ALL SESSIONS FOR AN ADMIN
  // ═══════════════════════════════════════════════════════════
  async terminateAllSessions(adminId: string, requesterId: string) {
    await this.prisma.adminSession.updateMany({
      where: { adminId, isActive: true },
      data: {
        isActive: false,
        terminatedAt: new Date(),
        terminatedReason: 'force_terminated_by_admin',
      },
    });

    await this.logActivity(
      requesterId,
      AdminActionType.OTHER,
      `Terminated all sessions for admin ${adminId}`,
      'admin',
      adminId,
    );

    return { message: 'All sessions terminated' };
  }
}