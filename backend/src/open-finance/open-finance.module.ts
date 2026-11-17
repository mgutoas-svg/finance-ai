import { Module } from '@nestjs/common';
import { OpenFinanceService } from './open-finance.service';
import { OpenFinanceController } from './open-finance.controller';
import { BacenClient } from './bacen.client';
import { PrismaService } from '../prisma/prisma.service';
import { EncryptionService } from '../security/encryption.service';

@Module({
  providers: [OpenFinanceService, BacenClient, PrismaService, EncryptionService],
  controllers: [OpenFinanceController],
})
export class OpenFinanceModule {}
