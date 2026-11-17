import { Module } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { PaymentsController } from './payments.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [StripeService, PrismaService],
  controllers: [PaymentsController],
})
export class PaymentsModule {}
