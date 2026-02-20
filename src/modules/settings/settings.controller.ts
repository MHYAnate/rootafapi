// src/modules/settings/settings.controller.ts
import { Controller, Get, Put, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { AdminJwtAuthGuard } from '../../common/guards';
import { CurrentAdmin, Public } from '../../common/decorators';

@ApiTags('Settings')
@Controller('settings')
export class SettingsController {
  constructor(private readonly service: SettingsService) {}
  @Public() @Get('public') getPublic() { return this.service.getPublicSettings(); }
  @UseGuards(AdminJwtAuthGuard) @Get() @ApiBearerAuth('admin-jwt') getAll() { return this.service.getAllSettings(); }
  @UseGuards(AdminJwtAuthGuard) @Put(':key') @ApiBearerAuth('admin-jwt') update(@Param('key') key: string, @Body('value') value: string, @CurrentAdmin('id') aid: string) { return this.service.updateSetting(key, value, aid); }
}