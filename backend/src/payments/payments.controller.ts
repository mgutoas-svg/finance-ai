import { Controller, Post, Body, UseGuards, Req, RawBodyRequest } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TenantGuard } from '../tenants/tenant.guard';
import { StripeService } from './stripe.service';

@Controller('payments')
export class PaymentsController {
  constructor(private stripe: StripeService) {}

  @Post('checkout')
  @UseGuards(AuthGuard('jwt'), TenantGuard)
  async checkout(@Body() body: { planId: 'basic' | 'pro' }, @Req() req) {
    const session = await this.stripe.createCheckoutSession(req.tenantId, body.planId);
    return { sessionId: session.id, url: session.url };
  }

  @Post('webhook')
  async webhook(@Req() req: RawBodyRequest<any>) {
    const sig = req.headers['stripe-signature'] as string;
    const event = JSON.parse(req.rawBody?.toString() || '{}');
    // In production, verify signature properly
    return this.stripe.handleWebhook(event);
  }
}
