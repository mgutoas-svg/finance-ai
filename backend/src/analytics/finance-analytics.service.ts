import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface FinancialMetrics {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  monthlyAverage: number;
  expenseRatio: number;
  savingsRate: number;
}

export interface FinancialHealth {
  emergencyFundMonths: number; // Quantos meses de despesas está coberto
  emergencyFundTarget: number; // Recomendação
  nps: number; // Net Promoter Score de satisfação financeira
  healthScore: number; // 0-100
  recommendations: string[];
}

@Injectable()
export class FinanceAnalyticsService {
  constructor(private prisma: PrismaService) {}

  // Calcula métricas financeiras principais
  async calculateMetrics(tenantId: string, days: number = 30): Promise<FinancialMetrics> {
    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - days);

    const transactions = await this.prisma.transaction.findMany({
      where: {
        account: { tenantId },
        date: { gte: dateFrom },
      },
    });

    const income = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const netBalance = income - expenses;
    const monthsOfData = Math.max(days / 30, 1);

    return {
      totalIncome: income,
      totalExpenses: expenses,
      netBalance,
      monthlyAverage: netBalance / monthsOfData,
      expenseRatio: income > 0 ? (expenses / income) * 100 : 0,
      savingsRate: income > 0 ? ((income - expenses) / income) * 100 : 0,
    };
  }

  // Fundo de emergência (recomendação: 3-6 meses de despesas)
  async calculateEmergencyFund(tenantId: string): Promise<FinancialHealth['emergencyFundMonths']> {
    const metrics = await this.calculateMetrics(tenantId, 90);
    const monthlyExpenses = metrics.totalExpenses / 3;

    // Assumindo que tem saldo em conta (simplificado - seria consultado via conta bancária)
    // Para demo, assumimos proporcional ao savings rate
    const estimatedSavings = metrics.monthlyAverage * 3;

    return monthlyExpenses > 0 ? estimatedSavings / monthlyExpenses : 0;
  }

  // NPS de Satisfação Financeira (0-100 escala simplificada)
  async calculateFinancialNPS(tenantId: string): Promise<number> {
    const metrics = await this.calculateMetrics(tenantId, 30);

    // NPS baseado em:
    // - Savings rate (ideal: >20%)
    // - Expense ratio (ideal: <60%)
    // - Positive balance

    let nps = 50; // Base 50

    if (metrics.savingsRate > 20) nps += 15; // Excelente poupança
    if (metrics.savingsRate > 35) nps += 10; // Muito excelente
    if (metrics.expenseRatio < 60) nps += 10; // Despesas controladas
    if (metrics.expenseRatio < 40) nps += 10; // Despesas muito controladas
    if (metrics.netBalance > 0) nps += 15; // Superavit no mês

    return Math.min(nps, 100);
  }

  // Health Score geral (0-100)
  async calculateHealthScore(tenantId: string): Promise<number> {
    const metrics = await this.calculateMetrics(tenantId, 30);
    const emergencyMonths = await this.calculateEmergencyFund(tenantId);
    const nps = await this.calculateFinancialNPS(tenantId);

    let score = 50; // Base

    // Emergency Fund (ideal: 3-6 meses)
    if (emergencyMonths >= 1) score += 10;
    if (emergencyMonths >= 3) score += 10;
    if (emergencyMonths >= 6) score += 10;

    // NPS contribution
    score += (nps / 100) * 20;

    return Math.min(score, 100);
  }

  // Recomendações personalizadas
  async getRecommendations(tenantId: string): Promise<string[]> {
    const recommendations = [];
    const metrics = await this.calculateMetrics(tenantId, 30);
    const emergencyMonths = await this.calculateEmergencyFund(tenantId);

    if (metrics.savingsRate < 10) {
      recommendations.push('💰 Aumente sua taxa de poupança para pelo menos 10% de suas receitas');
    }
    if (metrics.expenseRatio > 80) {
      recommendations.push('⚠️ Suas despesas estão muito altas. Considere revisar o orçamento');
    }
    if (emergencyMonths < 1) {
      recommendations.push('🚨 Construa um fundo de emergência com 3 meses de despesas');
    }
    if (emergencyMonths >= 3 && emergencyMonths < 6) {
      recommendations.push('💡 Continue construindo seu fundo de emergência para 6 meses');
    }
    if (metrics.netBalance < 0) {
      recommendations.push('📉 Você teve despesas maiores que receitas este mês');
    } else if (metrics.netBalance > metrics.monthlyAverage * 2) {
      recommendations.push('🎉 Ótimo desempenho! Considere investir seu excedente');
    }

    return recommendations;
  }

  // Análise de categorias de despesas
  async analyzeExpenseCategories(tenantId: string, days: number = 30) {
    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - days);

    const transactions = await this.prisma.transaction.findMany({
      where: {
        account: { tenantId },
        date: { gte: dateFrom },
        type: 'expense',
      },
    });

    // Categorizar por palavra-chave na descrição
    const categories: Record<string, number> = {
      'Alimentação': 0,
      'Transporte': 0,
      'Moradia': 0,
      'Saúde': 0,
      'Educação': 0,
      'Entretenimento': 0,
      'Outros': 0,
    };

    for (const txn of transactions) {
      const desc = txn.description.toLowerCase();

      if (desc.includes('alimento') || desc.includes('mercado') || desc.includes('restaurante')) {
        categories['Alimentação'] += txn.amount;
      } else if (desc.includes('transporte') || desc.includes('uber') || desc.includes('combustível')) {
        categories['Transporte'] += txn.amount;
      } else if (desc.includes('aluguel') || desc.includes('moradia') || desc.includes('condomínio')) {
        categories['Moradia'] += txn.amount;
      } else if (desc.includes('saúde') || desc.includes('médico') || desc.includes('farmácia')) {
        categories['Saúde'] += txn.amount;
      } else if (desc.includes('educação') || desc.includes('aula') || desc.includes('curso')) {
        categories['Educação'] += txn.amount;
      } else if (desc.includes('cinema') || desc.includes('lazer') || desc.includes('diversão')) {
        categories['Entretenimento'] += txn.amount;
      } else {
        categories['Outros'] += txn.amount;
      }
    }

    return Object.entries(categories)
      .filter(([_, value]) => value > 0)
      .map(([name, value]) => ({ name, value }));
  }
}
