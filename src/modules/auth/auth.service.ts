import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserType, VerificationStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { PasswordUtil } from '../../common/utils';
import { MESSAGES } from '../../common/constants';
import { RegisterMemberDto } from './dto/register-member.dto';
import { RegisterClientDto } from './dto/register-client.dto';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { RequestPasswordResetDto } from './dto/request-password-reset.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  private generateTokens(payload: { sub: string; phoneNumber: string; userType: string }) {
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: this.configService.get('JWT_EXPIRATION', '24h'),
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION', '7d'),
    });
    return { accessToken, refreshToken };
  }

  async registerMember(dto: RegisterMemberDto) {
    const existing = await this.prisma.user.findUnique({
      where: { phoneNumber: dto.phoneNumber },
    });
    if (existing) throw new ConflictException(MESSAGES.USER.PHONE_EXISTS);

    const rounds = parseInt(this.configService.get('BCRYPT_SALT_ROUNDS', '12'));
    const passwordHash = await PasswordUtil.hash(dto.password, rounds);

    const user = await this.prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          phoneNumber: dto.phoneNumber,
          fullName: dto.fullName,
          passwordHash,
          userType: UserType.MEMBER,
          email: dto.email,
          verificationStatus: VerificationStatus.PENDING,
          verificationSubmittedAt: new Date(),
        },
      });
      await tx.memberProfile.create({
        data: {
          userId: newUser.id,
          providerType: dto.providerType,
          address: dto.address,
          localGovernmentArea: dto.localGovernmentArea,
          state: dto.state,
        },
      });
      return newUser;
    });

    return {
      message: MESSAGES.AUTH.REGISTERED,
      data: {
        id: user.id,
        phoneNumber: user.phoneNumber,
        fullName: user.fullName,
        userType: user.userType,
        verificationStatus: user.verificationStatus,
      },
    };
  }

  async registerClient(dto: RegisterClientDto) {
    const existing = await this.prisma.user.findUnique({
      where: { phoneNumber: dto.phoneNumber },
    });
    if (existing) throw new ConflictException(MESSAGES.USER.PHONE_EXISTS);

    const rounds = parseInt(this.configService.get('BCRYPT_SALT_ROUNDS', '12'));
    const passwordHash = await PasswordUtil.hash(dto.password, rounds);

    const user = await this.prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          phoneNumber: dto.phoneNumber,
          fullName: dto.fullName,
          passwordHash,
          userType: UserType.CLIENT,
          email: dto.email,
          verificationStatus: VerificationStatus.PENDING,
          verificationSubmittedAt: new Date(),
        },
      });
      await tx.clientProfile.create({
        data: {
          userId: newUser.id,
          state: dto.state,
          localGovernmentArea: dto.localGovernmentArea,
        },
      });
      return newUser;
    });

    return {
      message: MESSAGES.AUTH.REGISTERED,
      data: {
        id: user.id,
        phoneNumber: user.phoneNumber,
        fullName: user.fullName,
        userType: user.userType,
        verificationStatus: user.verificationStatus,
      },
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { phoneNumber: dto.phoneNumber },
    });
    if (!user) throw new UnauthorizedException(MESSAGES.AUTH.INVALID_CREDENTIALS);

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new UnauthorizedException(MESSAGES.AUTH.ACCOUNT_LOCKED);
    }

    const valid = await PasswordUtil.compare(dto.password, user.passwordHash);
    if (!valid) {
      const attempts = user.failedLoginAttempts + 1;
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: attempts,
          ...(attempts >= 5 && {
            lockedUntil: new Date(Date.now() + 30 * 60 * 1000),
          }),
        },
      });
      throw new UnauthorizedException(MESSAGES.AUTH.INVALID_CREDENTIALS);
    }

    if (!user.isActive) throw new UnauthorizedException(MESSAGES.AUTH.ACCOUNT_SUSPENDED);

    const tokens = this.generateTokens({
      sub: user.id,
      phoneNumber: user.phoneNumber,
      userType: user.userType,
    });

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
        loginCount: { increment: 1 },
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    });

    return {
      message: MESSAGES.AUTH.LOGIN_SUCCESS,
      data: {
        ...tokens,
        user: {
          id: user.id,
          phoneNumber: user.phoneNumber,
          fullName: user.fullName,
          userType: user.userType,
          verificationStatus: user.verificationStatus,
          email: user.email,
        },
      },
    };
  }

  async refreshToken(dto: RefreshTokenDto) {
    try {
      const payload = this.jwtService.verify(dto.refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });
      const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
      if (!user || !user.isActive) throw new UnauthorizedException();

      const tokens = this.generateTokens({
        sub: user.id,
        phoneNumber: user.phoneNumber,
        userType: user.userType,
      });
      return { message: 'Token refreshed', data: tokens };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException(MESSAGES.USER.NOT_FOUND);

    const valid = await PasswordUtil.compare(dto.currentPassword, user.passwordHash);
    if (!valid) throw new BadRequestException('Current password is incorrect');

    const rounds = parseInt(this.configService.get('BCRYPT_SALT_ROUNDS', '12'));
    const hash = await PasswordUtil.hash(dto.newPassword, rounds);
    await this.prisma.user.update({ where: { id: userId }, data: { passwordHash: hash } });

    return { message: MESSAGES.AUTH.PASSWORD_CHANGED };
  }

  async requestPasswordReset(dto: RequestPasswordResetDto) {
    const user = await this.prisma.user.findUnique({
      where: { phoneNumber: dto.phoneNumber },
    });
    if (!user) throw new NotFoundException(MESSAGES.USER.NOT_FOUND);

    await this.prisma.passwordResetRequest.create({
      data: {
        userId: user.id,
        phoneNumber: dto.phoneNumber,
        requestReason: dto.reason,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    return { message: 'Password reset request submitted. Admin will process it.' };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        phoneNumber: true,
        fullName: true,
        email: true,
        userType: true,
        verificationStatus: true,
        isActive: true,
        createdAt: true,
        memberProfile: {
          include: {
            specializations: { include: { category: true } },
          },
        },
        clientProfile: true,
      },
    });
    if (!user) throw new NotFoundException(MESSAGES.USER.NOT_FOUND);
    return { data: user };
  }
}