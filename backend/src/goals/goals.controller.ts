import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TenantGuard } from '../tenants/tenant.guard';
import { GoalsService } from './goals.service';

@Controller('goals')
@UseGuards(AuthGuard('jwt'), TenantGuard)
export class GoalsController {
  constructor(private svc: GoalsService) {}
  @Post() async create(@Body() body: any, @Req() req) { return this.svc.create(req.tenantId, body); }
  @Get() async list(@Req() req) { return this.svc.findAll(req.tenantId); }
  @Get(':id/progress') async progress(@Param('id') id: string) { return this.svc.getProgress(id); }
  @Patch(':id') async update(@Param('id') id: string, @Body() body: any) { return this.svc.update(id, body); }
  @Delete(':id') async delete(@Param('id') id: string) { return this.svc.delete(id); }
}
