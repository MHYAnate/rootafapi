// src/modules/settings/settings.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async getPublicSettings() {
    const settings = await this.prisma.systemSetting.findMany({ where: { isPublic: true } });
    const map: Record<string, string> = {};
    settings.forEach((s) => { map[s.settingKey] = s.settingValue; });
    return { data: map };
  }

  async getAllSettings() {
    const settings = await this.prisma.systemSetting.findMany({ orderBy: { settingGroup: 'asc' } });
    return { data: settings };
  }

  async updateSetting(key: string, value: string, adminId: string) {
    const setting = await this.prisma.systemSetting.findUnique({ where: { settingKey: key } });
    if (!setting) throw new NotFoundException('Setting not found');
    if (!setting.isEditable) throw new NotFoundException('Setting is not editable');
    const updated = await this.prisma.systemSetting.update({ where: { settingKey: key }, data: { settingValue: value, updatedBy: adminId } });
    return { message: 'Setting updated', data: updated };
  }
}