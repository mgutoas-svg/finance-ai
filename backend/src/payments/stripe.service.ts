import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(private prisma: PrismaService) {
    this.stripe = new Stripe(process.env.STRIPE_API_KEY || '', {
      apiVersion: '2023-10-16' as any,
    });
  }

  async createCheckoutSession(tenantId: string, planId: 'basic' | 'pro') {
    const prices = { basic: 900, pro: 2900 }; // in cents
    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: { name: `Finance AI - ${planId.toUpperCase()}` },
            unit_amount: prices[planId],
            recurring: { interval: 'month' },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL}/success?sessionId={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/cancel`,
      metadata: { tenantId },
    });
    return session;
  }

  async handleWebhook(event: any) {
    switch (event.type) {
      case 'payment_intent.succeeded':
        // Handle payment succeeded
        break;
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await this.updateSubscription(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await this.updateSubscription(event.data.object, 'canceled');
        break;
    }
    return { received: true };
  }

  private async updateSubscription(subscription: any, status?: string) {
    const tenantId = subscription.metadata?.tenantId;
    if (!tenantId) return;

    const sub = await this.prisma.subscription.findFirst({
      where: { stripeCustomerId: subscription.customer },
    });

    if (sub) {
      await this.prisma.subscription.update({
        where: { id: sub.id },
        data: {
          status: status || subscription.status,
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        },
      });
    }
  }
}
