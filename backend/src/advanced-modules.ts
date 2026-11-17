// GENERIC CRUD CONTROLLER
import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TenantGuard } from './tenants/tenant.guard';

function createCrudController(route: string, service: any) {
  @Controller(route)
  @UseGuards(AuthGuard('jwt'), TenantGuard)
  class CrudController {
    constructor(private svc: any) {}
    @Post() create(@Body() body: any, @Req() req: any) { return this.svc.create(req.tenantId, body); }
    @Get() list(@Req() req: any) { return this.svc.findAll(req.tenantId); }
    @Get(':id') get(@Param('id') id: string) { return this.svc.findOne(id); }
    @Patch(':id') update(@Param('id') id: string, @Body() body: any) { return this.svc.update(id, body); }
    @Delete(':id') delete(@Param('id') id: string) { return this.svc.delete(id); }
  }
  return CrudController;
}

// ALL MODULES
import { Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Module({ providers: [null], controllers: [] })
export class BudgetsModule {}

@Module({ providers: [null], controllers: [] })
export class GoalsModule {}

@Module({ providers: [null], controllers: [] })
export class AlertsModule {}

@Module({ providers: [null], controllers: [] })
export class RecurrencesModule {}

@Module({ providers: [null], controllers: [] })
export class BankAccountsModule {}

@Module({ providers: [null], controllers: [] })
export class CreditCardsModule {}

@Module({ providers: [null], controllers: [] })
export class DebtsModule {}

@Module({ providers: [null], controllers: [] })
export class InvestmentsModule {}
