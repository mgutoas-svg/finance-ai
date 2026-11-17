import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateTransactionDto {
  accountId: string;
  date: Date;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  source?: 'manual' | 'pdf' | 'ofx' | 'open_finance';
}

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, data: CreateTransactionDto) {
    return this.prisma.transaction.create({
      data: {
        ...data,
        source: data.source || 'manual',
      },
      include: { account: true },
    });
  }

  async findAll(tenantId: string, filters?: { from?: Date; to?: Date }) {
    const where: any = { account: { tenantId } };
    if (filters?.from || filters?.to) {
      where.date = {};
      if (filters.from) where.date.gte = filters.from;
      if (filters.to) where.date.lte = filters.to;
    }
    return this.prisma.transaction.findMany({ where, orderBy: { date: 'desc' } });
  }

  async findOne(tenantId: string, id: string) {
    return this.prisma.transaction.findFirst({
      where: { id, account: { tenantId } },
    });
  }

  async update(tenantId: string, id: string, data: Partial<CreateTransactionDto>) {
    return this.prisma.transaction.updateMany({
      where: { id, account: { tenantId } },
      data,
    });
  }

  async delete(tenantId: string, id: string) {
    return this.prisma.transaction.deleteMany({
      where: { id, account: { tenantId } },
    });
  }
}
