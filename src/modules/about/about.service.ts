// src/modules/about/about.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AboutSectionKey } from '@prisma/client';

@Injectable()
export class AboutService {
  constructor(private prisma: PrismaService) {}

  async getAllContent() {
    const [content, leadership, objectives, documents, contact, social] = await Promise.all([
      this.prisma.aboutContent.findMany({ where: { isVisible: true }, orderBy: { displayOrder: 'asc' } }),
      this.prisma.leadershipProfile.findMany({ where: { isActive: true, showOnAboutPage: true }, orderBy: { displayOrder: 'asc' } }),
      this.prisma.foundationObjective.findMany({ where: { isDisplayed: true }, orderBy: { displayOrder: 'asc' } }),
      this.prisma.foundationDocument.findMany({ where: { isVisible: true }, orderBy: { displayOrder: 'asc' } }),
      this.prisma.contactInfo.findMany({ where: { isActive: true }, orderBy: { displayOrder: 'asc' } }),
      this.prisma.socialMediaLink.findMany({ where: { isActive: true }, orderBy: { displayOrder: 'asc' } }),
    ]);
    return { data: { content, leadership, objectives, documents, contact, social } };
  }

  async updateContent(sectionKey: AboutSectionKey, data: { title?: string; content: string; subtitle?: string; imageUrl?: string }, adminId: string) {
    const existing = await this.prisma.aboutContent.findFirst({ where: { sectionKey } });
    if (existing) {
      const updated = await this.prisma.aboutContent.update({ where: { id: existing.id }, data: { ...data, updatedByAdminId: adminId } });
      return { message: 'Content updated', data: updated };
    }
    const created = await this.prisma.aboutContent.create({ data: { sectionKey, ...data, updatedByAdminId: adminId } });
    return { message: 'Content created', data: created };
  }

  async createLeadership(data: any) {
    const profile = await this.prisma.leadershipProfile.create({ data });
    return { message: 'Leadership profile created', data: profile };
  }

  async updateLeadership(id: string, data: any) {
    const profile = await this.prisma.leadershipProfile.update({ where: { id }, data });
    return { message: 'Updated', data: profile };
  }

  async deleteLeadership(id: string) {
    await this.prisma.leadershipProfile.delete({ where: { id } });
    return { message: 'Deleted' };
  }

  async createObjective(data: any) {
    const obj = await this.prisma.foundationObjective.create({ data });
    return { message: 'Objective created', data: obj };
  }

  async updateContactInfo(id: string, data: any) {
    const contact = await this.prisma.contactInfo.upsert({ where: { id }, update: data, create: { ...data, contactType: data.contactType || 'headquarters' } });
    return { message: 'Contact updated', data: contact };
  }
}