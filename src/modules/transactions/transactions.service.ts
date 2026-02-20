// src/modules/transactions/transactions.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { PaginationUtil } from '../../common/utils';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  private async getMemberId(userId: string) {
    const p = await this.prisma.memberProfile.findUnique({ where: { userId } });
    if (!p) throw new NotFoundException('Profile not found');
    return p.id;
  }

  async create(userId: string, dto: CreateTransactionDto) {
    const memberId = await this.getMemberId(userId);
    const tx = await this.prisma.transaction.create({
      data: { memberId, ...dto, transactionDate: new Date(dto.transactionDate) },
    });
    await this.prisma.memberProfile.update({ where: { id: memberId }, data: { totalTransactions: { increment: 1 } } });
    return { message: 'Transaction recorded', data: tx };
  }

  async getMyTransactions(userId: string, page: number = 1, limit: number = 12) {
    const memberId = await this.getMemberId(userId);
    const { skip, take } = PaginationUtil.getSkipTake(page, limit);
    const [txs, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where: { memberId },
        include: { product: { select: { name: true } }, service: { select: { name: true } }, tool: { select: { name: true } } },
        skip, take, orderBy: { transactionDate: 'desc' },
      }),
      this.prisma.transaction.count({ where: { memberId } }),
    ]);
    return { data: txs, meta: PaginationUtil.createMeta(total, page, limit) };
  }

  async updateStatus(userId: string, txId: string, status: string) {
    const memberId = await this.getMemberId(userId);
    const tx = await this.prisma.transaction.findFirst({ where: { id: txId, memberId } });
    if (!tx) throw new NotFoundException('Transaction not found');
    const updated = await this.prisma.transaction.update({ where: { id: txId }, data: { status: status as any } });
    return { message: 'Transaction updated', data: updated };
  }
}