import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async log(tenantId: string, action: string, userId?: string, description?: string) {
    return this.prisma.auditLog.create({
      data: { tenantId, action, userId, description },
    });
  }

  async deleteUserData(tenantId: string, userId: string) {
    // Soft delete: mark as deleted but keep audit trail
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.tenantId !== tenantId) return;

    // Delete sensitive data
    await this.prisma.transaction.deleteMany({
      where: { account: { tenantId } },
    });

    await this.prisma.account.deleteMany({
      where: { tenantId },
    });

    await this.prisma.file.deleteMany({
      where: { tenantId },
    });

    // Log deletion
    await this.log(tenantId, 'user.data.deleted', userId, 'All user data deleted per LGPD request');
  }

  async getLogs(tenantId: string, limit = 100) {
    return this.prisma.auditLog.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
