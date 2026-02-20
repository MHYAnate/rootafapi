// src/modules/search/search.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { VerificationStatus } from '@prisma/client';

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  async search(query: string, type: string = 'all', page: number = 1, limit: number = 12) {
    const skip = (page - 1) * limit;
    const results: any = {};
    const verifiedFilter = { user: { verificationStatus: VerificationStatus.VERIFIED, isActive: true } };

    if (type === 'all' || type === 'members') {
      results.members = await this.prisma.memberProfile.findMany({
        where: { ...verifiedFilter, OR: [{ user: { fullName: { contains: query, mode: 'insensitive' } } }, { bio: { contains: query, mode: 'insensitive' } }] },
        include: { user: { select: { fullName: true, phoneNumber: true } } },
        take: type === 'all' ? 5 : limit, skip: type === 'all' ? 0 : skip,
      });
    }
    if (type === 'all' || type === 'products') {
      results.products = await this.prisma.product.findMany({
        where: { isActive: true, member: verifiedFilter, OR: [{ name: { contains: query, mode: 'insensitive' } }, { description: { contains: query, mode: 'insensitive' } }] },
        include: { images: { where: { isPrimary: true }, take: 1 }, member: { select: { user: { select: { fullName: true } } } } },
        take: type === 'all' ? 5 : limit, skip: type === 'all' ? 0 : skip,
      });
    }
    if (type === 'all' || type === 'services') {
      results.services = await this.prisma.service.findMany({
        where: { isActive: true, member: verifiedFilter, OR: [{ name: { contains: query, mode: 'insensitive' } }, { description: { contains: query, mode: 'insensitive' } }] },
        include: { images: { where: { isPrimary: true }, take: 1 }, member: { select: { user: { select: { fullName: true } } } } },
        take: type === 'all' ? 5 : limit, skip: type === 'all' ? 0 : skip,
      });
    }
    if (type === 'all' || type === 'tools') {
      results.tools = await this.prisma.tool.findMany({
        where: { isActive: true, member: verifiedFilter, OR: [{ name: { contains: query, mode: 'insensitive' } }, { description: { contains: query, mode: 'insensitive' } }] },
        include: { images: { where: { isPrimary: true }, take: 1 }, member: { select: { user: { select: { fullName: true } } } } },
        take: type === 'all' ? 5 : limit, skip: type === 'all' ? 0 : skip,
      });
    }

    // Log the search
    await this.prisma.searchLog.create({
      data: { searchQuery: query, searchType: type, resultCount: Object.values(results).flat().length },
    }).catch(() => {}); // Don't fail if logging fails

    return { data: results };
  }
}