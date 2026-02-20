// src/modules/location/location.controller.ts
import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { LocationService } from './location.service';
import { Public } from '../../common/decorators';

@ApiTags('Location')
@Controller('location')
export class LocationController {
  constructor(private readonly service: LocationService) {}
  @Public() @Get('states') getStates() { return this.service.getStates(); }
  @Public() @Get('states/:id/lgas') getLgas(@Param('id') id: string) { return this.service.getLgasByState(id); }
  @Public() @Get('lgas') getLgasByName(@Query('state') state: string) { return this.service.getLgasByStateName(state); }
}