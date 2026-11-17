import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GoalsService {
  constructor(private prisma: PrismaService) {}
  async create(tenantId: string, data: any) { return this.prisma.goal.create({ data: { ...data, tenantId } }); }
  async findAll(tenantId: string) { return this.prisma.goal.findMany({ where: { tenantId }, orderBy: { deadline: 'asc' } }); }
  async update(id: string, data: any) { return this.prisma.goal.update({ where: { id }, data }); }
  async delete(id: string) { return this.prisma.goal.delete({ where: { id } }); }
  async getProgress(id: string) {
    const goal = await this.prisma.goal.findUnique({ where: { id } });
    const progress = (goal.currentAmount / goal.targetAmount) * 100;
    const daysLeft = Math.ceil((goal.deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return { ...goal, progress, daysLeft, monthlyTarget: (goal.targetAmount - goal.currentAmount) / Math.max(daysLeft / 30, 1) };
  }
}
