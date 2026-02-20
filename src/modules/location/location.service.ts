// src/modules/location/location.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class LocationService {
  constructor(private prisma: PrismaService) {}

  async getStates() {
    const states = await this.prisma.nigerianState.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } });
    return { data: states };
  }

  async getLgasByState(stateId: string) {
    const lgas = await this.prisma.nigerianLGA.findMany({ where: { stateId, isActive: true }, orderBy: { name: 'asc' } });
    return { data: lgas };
  }

  async getLgasByStateName(stateName: string) {
    const state = await this.prisma.nigerianState.findFirst({ where: { name: { equals: stateName, mode: 'insensitive' } } });
    if (!state) return { data: [] };
    const lgas = await this.prisma.nigerianLGA.findMany({ where: { stateId: state.id, isActive: true }, orderBy: { name: 'asc' } });
    return { data: lgas };
  }
}