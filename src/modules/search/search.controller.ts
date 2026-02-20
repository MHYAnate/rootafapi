// src/modules/search/search.controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { Public } from '../../common/decorators';

@ApiTags('Search')
@Controller('search')
export class SearchController {
  constructor(private readonly service: SearchService) {}
  @Public() @Get() search(@Query('q') q: string, @Query('type') type?: string, @Query('page') p?: number, @Query('limit') l?: number) { return this.service.search(q || '', type, p, l); }
}