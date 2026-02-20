// src/modules/certificates/certificates.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCertificateDto } from './dto/create-certificate.dto';

@Injectable()
export class CertificatesService {
  constructor(private prisma: PrismaService) {}

  private async getMemberId(userId: string) {
    const p = await this.prisma.memberProfile.findUnique({ where: { userId } });
    if (!p) throw new NotFoundException('Profile not found');
    return p.id;
  }

  async create(userId: string, dto: CreateCertificateDto) {
    const memberId = await this.getMemberId(userId);
    const cert = await this.prisma.certificate.create({
      data: { memberId, ...dto, dateIssued: new Date(dto.dateIssued), expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : null },
    });
    await this.prisma.memberProfile.update({ where: { id: memberId }, data: { totalCertificates: { increment: 1 } } });
    return { message: 'Certificate uploaded', data: cert };
  }

  async findByMember(memberId: string) {
    const certs = await this.prisma.certificate.findMany({
      where: { memberId, isVisible: true },
      orderBy: { displayOrder: 'asc' },
    });
    return { data: certs };
  }

  async getMyCertificates(userId: string) {
    const memberId = await this.getMemberId(userId);
    const certs = await this.prisma.certificate.findMany({ where: { memberId }, orderBy: { createdAt: 'desc' } });
    return { data: certs };
  }

  async remove(userId: string, certId: string) {
    const memberId = await this.getMemberId(userId);
    const cert = await this.prisma.certificate.findFirst({ where: { id: certId, memberId } });
    if (!cert) throw new NotFoundException('Certificate not found');
    await this.prisma.certificate.delete({ where: { id: certId } });
    await this.prisma.memberProfile.update({ where: { id: memberId }, data: { totalCertificates: { decrement: 1 } } });
    return { message: 'Certificate removed' };
  }
}