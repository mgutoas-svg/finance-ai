import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Req, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TenantGuard } from '../tenants/tenant.guard';
import { TransactionsService, CreateTransactionDto } from './transactions.service';

@Controller('transactions')
@UseGuards(AuthGuard('jwt'), TenantGuard)
export class TransactionsController {
  constructor(private trans: TransactionsService) {}

  @Post()
  async create(@Body() body: CreateTransactionDto, @Req() req) {
    return this.trans.create(req.tenantId, body);
  }

  @Get()
  async list(@Req() req, @Query('from') from: string, @Query('to') to: string) {
    return this.trans.findAll(req.tenantId, {
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
    });
  }

  @Get(':id')
  async getOne(@Param('id') id: string, @Req() req) {
    return this.trans.findOne(req.tenantId, id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: Partial<CreateTransactionDto>, @Req() req) {
    return this.trans.update(req.tenantId, id, body);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Req() req) {
    return this.trans.delete(req.tenantId, id);
  }
}
