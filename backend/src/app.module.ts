import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { TransactionsModule } from './transactions/transactions.module';
import { PaymentsModule } from './payments/payments.module';
import { FilesModule } from './files/files.module';
import { OpenFinanceModule } from './open-finance/open-finance.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { PrismaService } from './prisma/prisma.service';
import { EncryptionService } from './security/encryption.service';
import { AuditService } from './audit/audit.service';

@Module({
  imports: [AuthModule, TransactionsModule, PaymentsModule, FilesModule, OpenFinanceModule, AnalyticsModule],
  providers: [PrismaService, EncryptionService, AuditService],
})
export class AppModule {}
