import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TenantGuard } from '../tenants/tenant.guard';
import { BudgetsService } from './budgets.service';

@Controller('budgets')
@UseGuards(AuthGuard('jwt'), TenantGuard)
export class BudgetsController {
  constructor(private svc: BudgetsService) {}

  @Post() async create(@Body() body: any, @Req() req) { return this.svc.create(req.tenantId, body); }
  @Get() async list(@Req() req) { return this.svc.findAll(req.tenantId); }
  @Get(':id/spent') async getSpent(@Param('id') id: string, @Req() req) { return this.svc.getSpent(req.tenantId, id, 'monthly'); }
  @Patch(':id') async update(@Param('id') id: string, @Body() body: any, @Req() req) { return this.svc.update(req.tenantId, id, body); }
  @Delete(':id') async delete(@Param('id') id: string, @Req() req) { return this.svc.delete(req.tenantId, id); }
}
