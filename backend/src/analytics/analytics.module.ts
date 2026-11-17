import { Module } from '@nestjs/common';
import { FinanceAnalyticsService } from './finance-analytics.service';
import { AnalyticsController } from './analytics.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [FinanceAnalyticsService, PrismaService],
  controllers: [AnalyticsController],
})
export class AnalyticsModule {}
