// src/modules/sponsors/sponsors.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PaginationUtil } from '../../common/utils';
import { IngestionService } from '../ai/ingestion.service';

@Injectable()
export class SponsorsService {
  constructor(private prisma: PrismaService, private ingestionService: IngestionService,) {}

  private triggerReindex() {
    this.ingestionService.ingestAll().catch((err) =>
      console.error('RAG re-indexing failed:', err.message),
    );
  }

  async findAll(page: number = 1, limit: number = 20) {
    const { skip, take } = PaginationUtil.getSkipTake(page, limit);
    const [sponsors, total] = await Promise.all([
      this.prisma.sponsorPartner.findMany({ where: { isActive: true }, skip, take, orderBy: { displayOrder: 'asc' } }),
      this.prisma.sponsorPartner.count({ where: { isActive: true } }),
    ]);
    return { data: sponsors, meta: PaginationUtil.createMeta(total, page, limit) };
  }

  async findOne(id: string) {
    const s = await this.prisma.sponsorPartner.findUnique({ where: { id } });
    if (!s) throw new NotFoundException('Sponsor not found');
   
    return { data: s };
  }

  async create(data: any) {
    const s = await this.prisma.sponsorPartner.create({ data });
    this.triggerReindex();
    return { message: 'Sponsor created', data: s };
  }

  async update(id: string, data: any) {
    const s = await this.prisma.sponsorPartner.update({ where: { id }, data });
    this.triggerReindex();
    return { message: 'Updated', data: s };
  }

  async remove(id: string) {
    await this.prisma.sponsorPartner.update({ where: { id }, data: { isActive: false } });
    this.triggerReindex();
    return { message: 'Removed' };
  }
}