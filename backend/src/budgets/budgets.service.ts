import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BudgetsService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, data: any) {
    return this.prisma.budget.create({ data: { ...data, tenantId } });
  }

  async findAll(tenantId: string) {
    return this.prisma.budget.findMany({ where: { tenantId } });
  }

  async getSpent(tenantId: string, categoryId: string, period: string) {
    const budget = await this.prisma.budget.findUnique({ where: { id: categoryId } });
    const dateFrom = this.getPeriodStart(period);
    const spent = await this.prisma.transaction.aggregate({
      where: { account: { tenantId }, date: { gte: dateFrom }, type: 'expense', description: { contains: budget.category } },
      _sum: { amount: true },
    });
    return { limit: budget.limit, spent: spent._sum.amount || 0, percentage: ((spent._sum.amount || 0) / budget.limit) * 100, remaining: budget.limit - (spent._sum.amount || 0) };
  }

  async update(tenantId: string, id: string, data: any) {
    return this.prisma.budget.update({ where: { id }, data });
  }

  async delete(tenantId: string, id: string) {
    return this.prisma.budget.delete({ where: { id } });
  }

  private getPeriodStart(period: string): Date {
    const now = new Date();
    if (period === 'weekly') now.setDate(now.getDate() - 7);
    else if (period === 'monthly') now.setMonth(now.getMonth() - 1);
    else if (period === 'annual') now.setFullYear(now.getFullYear() - 1);
    return now;
  }
}
