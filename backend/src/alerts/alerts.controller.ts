import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TenantGuard } from '../tenants/tenant.guard';
import { AlertsService } from './alerts.service';

@Controller('alerts')
@UseGuards(AuthGuard('jwt'), TenantGuard)
export class AlertsController {
  constructor(private svc: AlertsService) {}
  @Post() async create(@Body() body: any, @Req() req) { return this.svc.create(req.tenantId, body); }
  @Get() async list(@Req() req) { return this.svc.findAll(req.tenantId); }
  @Patch(':id') async update(@Param('id') id: string, @Body() body: any) { return this.svc.update(id, body); }
  @Delete(':id') async delete(@Param('id') id: string) { return this.svc.delete(id); }
}
