import { Controller, Get, UseGuards, Req, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TenantGuard } from '../tenants/tenant.guard';
import { FinanceAnalyticsService } from './finance-analytics.service';

@Controller('analytics')
@UseGuards(AuthGuard('jwt'), TenantGuard)
export class AnalyticsController {
  constructor(private analytics: FinanceAnalyticsService) {}

  @Get('metrics')
  async getMetrics(@Req() req, @Query('days') days: string = '30') {
    const metrics = await this.analytics.calculateMetrics(req.tenantId, parseInt(days));
    return metrics;
  }

  @Get('health')
  async getHealthScore(@Req() req) {
    const score = await this.analytics.calculateHealthScore(req.tenantId);
    const nps = await this.analytics.calculateFinancialNPS(req.tenantId);
    const emergencyMonths = await this.analytics.calculateEmergencyFund(req.tenantId);
    const recommendations = await this.analytics.getRecommendations(req.tenantId);

    return {
      healthScore: score,
      nps,
      emergencyFundMonths: emergencyMonths,
      recommendations,
    };
  }

  @Get('categories')
  async getExpenseCategories(@Req() req, @Query('days') days: string = '30') {
    return this.analytics.analyzeExpenseCategories(req.tenantId, parseInt(days));
  }

  @Get('forecast')
  async getForecast(@Req() req) {
    const metrics = await this.analytics.calculateMetrics(req.tenantId, 90);

    return {
      monthlyExpenses: metrics.totalExpenses / 3,
      monthlyIncome: metrics.totalIncome / 3,
      projectedBalance: metrics.monthlyAverage,
      savingsRate: metrics.savingsRate,
    };
  }
}
