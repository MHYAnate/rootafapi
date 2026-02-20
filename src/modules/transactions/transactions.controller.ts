// src/modules/transactions/transactions.controller.ts
import { Controller, Get, Post, Patch, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto';
import { JwtAuthGuard, VerifiedUserGuard } from '../../common/guards';
import { CurrentUser } from '../../common/decorators';

@ApiTags('Transactions')
@Controller('transactions')
@UseGuards(JwtAuthGuard, VerifiedUserGuard)
@ApiBearerAuth('user-jwt')
export class TransactionsController {
  constructor(private readonly service: TransactionsService) {}
  @Post() create(@CurrentUser('id') uid: string, @Body() dto: CreateTransactionDto) { return this.service.create(uid, dto); }
  @Get('me') getMy(@CurrentUser('id') uid: string, @Query('page') p?: number, @Query('limit') l?: number) { return this.service.getMyTransactions(uid, p, l); }
  @Patch(':id/status') updateStatus(@CurrentUser('id') uid: string, @Param('id') id: string, @Body('status') s: string) { return this.service.updateStatus(uid, id, s); }
}