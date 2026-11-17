import { Controller, Get, Post, UseGuards, Req, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TenantGuard } from '../tenants/tenant.guard';
import { OpenFinanceService } from './open-finance.service';

@Controller('open-finance')
export class OpenFinanceController {
  constructor(private openFinance: OpenFinanceService) {}

  @Get('authorize')
  @UseGuards(AuthGuard('jwt'), TenantGuard)
  async authorize() {
    const url = this.openFinance.getAuthorizationUrl();
    return { authUrl: url };
  }

  @Get('callback')
  @UseGuards(AuthGuard('jwt'), TenantGuard)
  async callback(@Query('code') code: string, @Req() req) {
    if (!code) return { error: 'No authorization code' };
    const tokens = await this.openFinance.handleCallback(code, req.tenantId);
    const accounts = await this.openFinance.syncAccounts(req.tenantId, tokens.accessToken);
    return { success: true, accountsCreated: accounts.length, accounts };
  }

  @Post('sync')
  @UseGuards(AuthGuard('jwt'), TenantGuard)
  async sync(@Req() req) {
    // TODO: Implement sync with stored tokens
    return { message: 'Sync triggered' };
  }
}
