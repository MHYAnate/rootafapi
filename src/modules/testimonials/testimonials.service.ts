// src/modules/testimonials/testimonials.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PaginationUtil } from '../../common/utils';

@Injectable()
export class TestimonialsService {
  constructor(private prisma: PrismaService) {}

  async findAllPublic(page: number = 1, limit: number = 12) {
    const { skip, take } = PaginationUtil.getSkipTake(page, limit);
    const where = { isVisible: true, isApproved: true };
    const [testimonials, total] = await Promise.all([
      this.prisma.testimonial.findMany({ where, skip, take, orderBy: { displayOrder: 'asc' } }),
      this.prisma.testimonial.count({ where }),
    ]);
    return { data: testimonials, meta: PaginationUtil.createMeta(total, page, limit) };
  }

  async create(data: any) { const t = await this.prisma.testimonial.create({ data }); return { message: 'Created', data: t }; }
  async update(id: string, data: any) { const t = await this.prisma.testimonial.update({ where: { id }, data }); return { message: 'Updated', data: t }; }
  async approve(id: string, adminId: string) {
    const t = await this.prisma.testimonial.update({ where: { id }, data: { isApproved: true, approvedByAdminId: adminId, approvedAt: new Date() } });
    return { message: 'Approved', data: t };
  }
  async remove(id: string) { await this.prisma.testimonial.delete({ where: { id } }); return { message: 'Deleted' }; }
}