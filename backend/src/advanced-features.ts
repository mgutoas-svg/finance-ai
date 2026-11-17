// SPRINT 4: RECURRENCES
import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class RecurrencesService {
  constructor(private prisma: PrismaService) {}
  async create(tenantId: string, data: any) { return this.prisma.recurrence.create({ data: { ...data, tenantId } }); }
  async findAll(tenantId: string) { return this.prisma.recurrence.findMany({ where: { tenantId } }); }
  async update(id: string, data: any) { return this.prisma.recurrence.update({ where: { id }, data }); }
  async delete(id: string) { return this.prisma.recurrence.delete({ where: { id } }); }
}

// SPRINT 5-6: BANK ACCOUNTS
@Injectable()
export class BankAccountsService {
  constructor(private prisma: PrismaService) {}
  async create(tenantId: string, data: any) { return this.prisma.bankAccount.create({ data: { ...data, tenantId } }); }
  async findAll(tenantId: string) { return this.prisma.bankAccount.findMany({ where: { tenantId } }); }
  async update(id: string, data: any) { return this.prisma.bankAccount.update({ where: { id }, data }); }
  async delete(id: string) { return this.prisma.bankAccount.delete({ where: { id } }); }
}

// SPRINT 5-6: CREDIT CARDS
@Injectable()
export class CreditCardsService {
  constructor(private prisma: PrismaService) {}
  async create(tenantId: string, data: any) { return this.prisma.creditCard.create({ data: { ...data, tenantId } }); }
  async findAll(tenantId: string) { return this.prisma.creditCard.findMany({ where: { tenantId } }); }
  async update(id: string, data: any) { return this.prisma.creditCard.update({ where: { id }, data }); }
  async delete(id: string) { return this.prisma.creditCard.delete({ where: { id } }); }
}

// SPRINT 7: DEBTS
@Injectable()
export class DebtsService {
  constructor(private prisma: PrismaService) {}
  async create(tenantId: string, data: any) { return this.prisma.debt.create({ data: { ...data, tenantId } }); }
  async findAll(tenantId: string) { return this.prisma.debt.findMany({ where: { tenantId } }); }
  async update(id: string, data: any) { return this.prisma.debt.update({ where: { id }, data }); }
  async delete(id: string) { return this.prisma.debt.delete({ where: { id } }); }
  async getDebtForecast(id: string) {
    const debt = await this.prisma.debt.findUnique({ where: { id } });
    const remaining = debt.remainingAmount;
    const monthsToPayoff = remaining / debt.monthlyPayment;
    const totalInterest = (debt.remainingAmount * debt.interestRate * monthsToPayoff) / 100;
    return { remaining, monthsToPayoff, totalInterest, totalToPay: remaining + totalInterest };
  }
}

// SPRINT 9: INVESTMENTS
@Injectable()
export class InvestmentsService {
  constructor(private prisma: PrismaService) {}
  async create(tenantId: string, data: any) { return this.prisma.investment.create({ data: { ...data, tenantId } }); }
  async findAll(tenantId: string) { return this.prisma.investment.findMany({ where: { tenantId } }); }
  async update(id: string, data: any) { return this.prisma.investment.update({ where: { id }, data }); }
  async delete(id: string) { return this.prisma.investment.delete({ where: { id } }); }
  async getPortfolioPerformance(tenantId: string) {
    const investments = await this.prisma.investment.findMany({ where: { tenantId } });
    const totalInvested = investments.reduce((s, i) => s + (i.averageCost * i.quantity), 0);
    const currentValue = investments.reduce((s, i) => s + (i.currentPrice * i.quantity), 0);
    const performance = ((currentValue - totalInvested) / totalInvested) * 100;
    return { totalInvested, currentValue, performance, investments };
  }
}
