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


  
    // ─── Objectives ───
    async updateObjective(id: string, data: any) {
      return this.prisma.foundationObjective.update({
        where: { id },
        data: {
          title: data.title,
          description: data.description,
          shortDescription: data.shortDescription,
          iconName: data.iconName,
          iconUrl: data.iconUrl,
          displayOrder: data.displayOrder,
          isDisplayed: data.isDisplayed,
        },
      });
    }
  
    async deleteObjective(id: string) {
      await this.prisma.foundationObjective.delete({ where: { id } });
      return { message: 'Objective deleted' };
    }
  
    // ─── Contact ───
    async updateContactInfo(id: string, data: any) {
      return this.prisma.contactInfo.update({
        where: { id },
        data: {
          label: data.label,
          address: data.address,
          landmark: data.landmark,
          city: data.city,
          localGovernmentArea: data.localGovernmentArea,
          state: data.state,
          country: data.country,
          postalCode: data.postalCode,
          phoneNumber1: data.phoneNumber1,
          phoneNumber2: data.phoneNumber2,
          phoneNumber3: data.phoneNumber3,
          whatsappNumber: data.whatsappNumber,
          email: data.email,
          alternateEmail: data.alternateEmail,
          website: data.website,
          officeHours: data.officeHours,
          isPrimary: data.isPrimary,
          isActive: data.isActive,
        },
      });
    }
  
    // ─── Social ───
    async updateSocialLink(id: string, data: any) {
      return this.prisma.socialMediaLink.update({
        where: { id },
        data: {
          url: data.url,
          username: data.username,
          iconName: data.iconName,
          iconUrl: data.iconUrl,
          isActive: data.isActive,
          displayOrder: data.displayOrder,
        },
      });
    }
}