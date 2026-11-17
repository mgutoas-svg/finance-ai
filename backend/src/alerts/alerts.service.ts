import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AlertsService {
  constructor(private prisma: PrismaService) {}
  async create(tenantId: string, data: any) { return this.prisma.alertRule.create({ data: { ...data, tenantId } }); }
  async findAll(tenantId: string) { return this.prisma.alertRule.findMany({ where: { tenantId } }); }
  async update(id: string, data: any) { return this.prisma.alertRule.update({ where: { id }, data }); }
  async delete(id: string) { return this.prisma.alertRule.delete({ where: { id } }); }
}
