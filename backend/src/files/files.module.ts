import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionsService } from '../transactions/transactions.service';

@Module({
  providers: [FilesService, PrismaService, TransactionsService],
  controllers: [FilesController],
})
export class FilesModule {}
