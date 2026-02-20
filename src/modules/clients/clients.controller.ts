import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ClientsService } from './clients.service';
import { UpdateClientProfileDto } from './dto';
import { JwtAuthGuard } from '../../common/guards';
import { CurrentUser } from '../../common/decorators';

@ApiTags('Clients')
@Controller('clients')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('user-jwt')
export class ClientsController {
  constructor(private readonly service: ClientsService) {}

  @Get('me/profile')
  @ApiOperation({ summary: 'Get my client profile' })
  getMyProfile(@CurrentUser('id') userId: string) {
    return this.service.getMyProfile(userId);
  }

  @Put('me/profile')
  @ApiOperation({ summary: 'Update my client profile' })
  updateProfile(@CurrentUser('id') userId: string, @Body() dto: UpdateClientProfileDto) {
    return this.service.updateProfile(userId, dto);
  }
}