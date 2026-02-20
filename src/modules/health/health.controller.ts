// src/modules/health/health.controller.ts
import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators';
import { PrismaService } from '../../prisma/prisma.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private prisma: PrismaService) {}

  @Public()
  @Get()
  async check() {
    let dbStatus = 'ok';
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      dbStatus = 'error';
    }
    return {
      raw: true,
      data: {
        status: 'ok',
        database: dbStatus,
        timestamp: new Date().toISOString(),
        service: 'RootAF Backend API',
        version: '1.0.0',
        uptime: process.uptime(),
      },
    };
  }
}