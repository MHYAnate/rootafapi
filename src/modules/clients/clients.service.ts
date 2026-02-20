import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateClientProfileDto } from './dto/update-client-profile.dto';

@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) {}

  async getMyProfile(userId: string) {
    const profile = await this.prisma.clientProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: { id: true, fullName: true, phoneNumber: true, email: true, verificationStatus: true },
        },
        ratingsGiven: {
          include: { member: { include: { user: { select: { fullName: true } } } } },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });
    if (!profile) throw new NotFoundException('Profile not found');
    return { data: profile };
  }

  async updateProfile(userId: string, dto: UpdateClientProfileDto) {
    const updated = await this.prisma.clientProfile.update({
      where: { userId },
      data: { ...dto },
    });
    return { message: 'Profile updated', data: updated };
  }

  async uploadNinPhoto(userId: string, ninPhotoUrl: string) {
    await this.prisma.clientProfile.update({
      where: { userId },
      data: { ninPhotoUrl, ninPhotoUploadedAt: new Date() },
    });
    return { message: 'NIN photo uploaded' };
  }
}