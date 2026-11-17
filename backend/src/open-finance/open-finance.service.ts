import { Injectable } from '@nestjs/common';
import { BacenClient } from './bacen.client';
import { PrismaService } from '../prisma/prisma.service';
import { EncryptionService } from '../security/encryption.service';

@Injectable()
export class OpenFinanceService {
  constructor(
    private bacen: BacenClient,
    private prisma: PrismaService,
    private encryption: EncryptionService,
  ) {}

  getAuthorizationUrl(): string {
    return this.bacen.getAuthorizationUrl();
  }

  async handleCallback(code: string, tenantId: string) {
    const tokens = await this.bacen.exchangeCodeForToken(code);
    // Store encrypted tokens - in production, associate with specific account
    return { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken };
  }

  async syncAccounts(tenantId: string, accessToken: string) {
    const accounts = await this.bacen.fetchAccounts(accessToken);
    const created = [];
    for (const acc of accounts) {
      const existing = await this.prisma.account.findFirst({
        where: { tenantId, openFinanceId: acc.id },
      });
      if (!existing) {
        const newAcc = await this.prisma.account.create({
          data: {
            tenantId,
            bankCode: acc.bank_code,
            bankName: acc.name,
            openFinanceId: acc.id,
            syncedAt: new Date(),
          },
        });
        created.push(newAcc);
      }
    }
    return created;
  }

  async syncTransactions(accountId: string, accessToken: string) {
    const account = await this.prisma.account.findUnique({ where: { id: accountId } });
    if (!account?.openFinanceId) return [];

    const txns = await this.bacen.fetchTransactions(accessToken, account.openFinanceId);
    const created = [];
    for (const txn of txns) {
      const existing = await this.prisma.transaction.findFirst({
        where: {
          accountId,
          date: new Date(txn.date),
          description: txn.description,
        },
      });
      if (!existing) {
        const newTxn = await this.prisma.transaction.create({
          data: {
            accountId,
            date: new Date(txn.date),
            description: txn.description,
            amount: parseFloat(txn.amount),
            type: txn.type === 'DEBIT' ? 'expense' : 'income',
            source: 'open_finance',
          },
        });
        created.push(newTxn);
      }
    }
    return created;
  }
}
