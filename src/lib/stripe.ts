// Stripe integration for subscription management
import Stripe from 'stripe';
import { UserTier } from './auth-system';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

// Pricing configuration
export const PRICING_PLANS = {
  [UserTier.BASIC]: {
    name: 'Basic Plan',
    price: 999, // ¥999 in cents
    currency: 'jpy',
    interval: 'month',
    stripePriceId: process.env.STRIPE_BASIC_PRICE_ID!,
    features: [
      '月100回の議論',
      '全エージェント利用可能',
      '高品質AI',
      '議論履歴保存',
      'エクスポート機能'
    ]
  },
  [UserTier.PRO]: {
    name: 'Pro Plan',
    price: 2999, // ¥2999 in cents
    currency: 'jpy',
    interval: 'month',
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID!,
    features: [
      '月500回の議論',
      '全モード利用可能',
      'プレミアムAI',
      '詳細分析レポート',
      '優先サポート',
      'チーム機能'
    ]
  },
  [UserTier.ENTERPRISE]: {
    name: 'Enterprise Plan',
    price: 9999, // ¥9999 in cents
    currency: 'jpy',
    interval: 'month',
    stripePriceId: process.env.STRIPE_ENTERPRISE_PRICE_ID!,
    features: [
      '無制限の議論',
      '専用AI',
      'SLA保証',
      'カスタム対応',
      'White Label',
      'API提供'
    ]
  }
};

// Stripe service class
export class StripeService {
  /**
   * Create a Stripe checkout session for subscription
   */
  static async createCheckoutSession({
    userId,
    userEmail,
    tier,
    successUrl,
    cancelUrl
  }: {
    userId: string;
    userEmail: string;
    tier: UserTier;
    successUrl: string;
    cancelUrl: string;
  }): Promise<Stripe.Checkout.Session> {
    const plan = PRICING_PLANS[tier];
    
    if (!plan) {
      throw new Error(`Invalid tier: ${tier}`);
    }

    try {
      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        customer_email: userEmail,
        line_items: [
          {
            price: plan.stripePriceId,
            quantity: 1,
          },
        ],
        metadata: {
          userId,
          tier,
        },
        subscription_data: {
          metadata: {
            userId,
            tier,
          },
        },
        success_url: successUrl,
        cancel_url: cancelUrl,
        allow_promotion_codes: true,
        billing_address_collection: 'required',
        locale: 'ja',
      });

      return session;
    } catch (error) {
      console.error('Stripe checkout session creation failed:', error);
      throw new Error('決済セッションの作成に失敗しました');
    }
  }

  /**
   * Create a customer portal session for managing subscription
   */
  static async createPortalSession({
    customerId,
    returnUrl
  }: {
    customerId: string;
    returnUrl: string;
  }): Promise<Stripe.BillingPortal.Session> {
    try {
      const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
      });

      return session;
    } catch (error) {
      console.error('Stripe portal session creation failed:', error);
      throw new Error('カスタマーポータルの作成に失敗しました');
    }
  }

  /**
   * Get subscription details
   */
  static async getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
        expand: ['customer', 'items.data.price']
      });

      return subscription;
    } catch (error) {
      console.error('Failed to retrieve subscription:', error);
      throw new Error('サブスクリプション情報の取得に失敗しました');
    }
  }

  /**
   * Cancel subscription at period end
   */
  static async cancelSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    try {
      const subscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      });

      return subscription;
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      throw new Error('サブスクリプションのキャンセルに失敗しました');
    }
  }

  /**
   * Reactivate a cancelled subscription
   */
  static async reactivateSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    try {
      const subscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: false,
      });

      return subscription;
    } catch (error) {
      console.error('Failed to reactivate subscription:', error);
      throw new Error('サブスクリプションの再開に失敗しました');
    }
  }

  /**
   * Update subscription to a different tier
   */
  static async updateSubscriptionTier(
    subscriptionId: string,
    newTier: UserTier
  ): Promise<Stripe.Subscription> {
    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const newPlan = PRICING_PLANS[newTier];

      if (!newPlan) {
        throw new Error(`Invalid tier: ${newTier}`);
      }

      const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
        items: [
          {
            id: subscription.items.data[0].id,
            price: newPlan.stripePriceId,
          },
        ],
        proration_behavior: 'create_prorations',
        metadata: {
          ...subscription.metadata,
          tier: newTier,
        },
      });

      return updatedSubscription;
    } catch (error) {
      console.error('Failed to update subscription tier:', error);
      throw new Error('プラン変更に失敗しました');
    }
  }

  /**
   * Get customer by email
   */
  static async getCustomerByEmail(email: string): Promise<Stripe.Customer | null> {
    try {
      const customers = await stripe.customers.list({
        email,
        limit: 1,
      });

      return customers.data.length > 0 ? customers.data[0] : null;
    } catch (error) {
      console.error('Failed to get customer by email:', error);
      return null;
    }
  }

  /**
   * Create a new customer
   */
  static async createCustomer({
    email,
    name,
    userId
  }: {
    email: string;
    name?: string;
    userId: string;
  }): Promise<Stripe.Customer> {
    try {
      const customer = await stripe.customers.create({
        email,
        name,
        metadata: {
          userId,
        },
      });

      return customer;
    } catch (error) {
      console.error('Failed to create customer:', error);
      throw new Error('カスタマー作成に失敗しました');
    }
  }

  /**
   * Get usage-based billing data
   */
  static async recordUsageForBilling(
    subscriptionItemId: string,
    quantity: number,
    timestamp?: number
  ): Promise<Stripe.UsageRecord> {
    try {
      const usageRecord = await stripe.subscriptionItems.createUsageRecord(
        subscriptionItemId,
        {
          quantity,
          timestamp: timestamp || Math.floor(Date.now() / 1000),
          action: 'increment',
        }
      );

      return usageRecord;
    } catch (error) {
      console.error('Failed to record usage:', error);
      throw new Error('使用量の記録に失敗しました');
    }
  }

  /**
   * Create discount coupon
   */
  static async createCoupon({
    id,
    percentOff,
    duration,
    durationInMonths
  }: {
    id: string;
    percentOff: number;
    duration: 'forever' | 'once' | 'repeating';
    durationInMonths?: number;
  }): Promise<Stripe.Coupon> {
    try {
      const coupon = await stripe.coupons.create({
        id,
        percent_off: percentOff,
        duration,
        duration_in_months: duration === 'repeating' ? durationInMonths : undefined,
        currency: 'jpy',
      });

      return coupon;
    } catch (error) {
      console.error('Failed to create coupon:', error);
      throw new Error('クーポンの作成に失敗しました');
    }
  }

  /**
   * Apply coupon to customer
   */
  static async applyCouponToCustomer(
    customerId: string,
    couponId: string
  ): Promise<Stripe.Customer> {
    try {
      const customer = await stripe.customers.update(customerId, {
        coupon: couponId,
      });

      return customer;
    } catch (error) {
      console.error('Failed to apply coupon:', error);
      throw new Error('クーポンの適用に失敗しました');
    }
  }

  /**
   * Get invoice by subscription
   */
  static async getInvoices(subscriptionId: string, limit = 10): Promise<Stripe.Invoice[]> {
    try {
      const invoices = await stripe.invoices.list({
        subscription: subscriptionId,
        limit,
      });

      return invoices.data;
    } catch (error) {
      console.error('Failed to get invoices:', error);
      throw new Error('請求書の取得に失敗しました');
    }
  }

  /**
   * Get upcoming invoice
   */
  static async getUpcomingInvoice(subscriptionId: string): Promise<Stripe.Invoice> {
    try {
      const invoice = await stripe.invoices.retrieveUpcoming({
        subscription: subscriptionId,
      });

      return invoice;
    } catch (error) {
      console.error('Failed to get upcoming invoice:', error);
      throw new Error('次回請求書の取得に失敗しました');
    }
  }
}

/**
 * Webhook event handlers
 */
export class StripeWebhookHandler {
  /**
   * Handle subscription created
   */
  static async handleSubscriptionCreated(subscription: Stripe.Subscription) {
    const { DatabaseService } = await import('./supabase');
    
    try {
      const userId = subscription.metadata.userId;
      const tier = subscription.metadata.tier as UserTier;
      
      if (!userId || !tier) {
        throw new Error('Missing userId or tier in subscription metadata');
      }

      // Update user tier in database
      await DatabaseService.updateUserTier(userId, tier);

      // Create subscription record
      await DatabaseService.createSubscription({
        user_id: userId,
        stripe_subscription_id: subscription.id,
        status: 'active',
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      });

      console.log(`Subscription created for user ${userId} with tier ${tier}`);
    } catch (error) {
      console.error('Failed to handle subscription created:', error);
      throw error;
    }
  }

  /**
   * Handle subscription updated
   */
  static async handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    const { DatabaseService } = await import('./supabase');
    
    try {
      const userId = subscription.metadata.userId;
      const tier = subscription.metadata.tier as UserTier;
      
      if (!userId || !tier) {
        throw new Error('Missing userId or tier in subscription metadata');
      }

      // Update user tier
      await DatabaseService.updateUserTier(userId, tier);

      // Update subscription status
      const status = subscription.cancel_at_period_end ? 'canceled' : 
                    subscription.status === 'active' ? 'active' :
                    subscription.status === 'past_due' ? 'past_due' : 'inactive';

      await DatabaseService.updateSubscriptionStatus(subscription.id, status as any);

      console.log(`Subscription updated for user ${userId}: ${status}`);
    } catch (error) {
      console.error('Failed to handle subscription updated:', error);
      throw error;
    }
  }

  /**
   * Handle subscription deleted
   */
  static async handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    const { DatabaseService } = await import('./supabase');
    
    try {
      const userId = subscription.metadata.userId;
      
      if (!userId) {
        throw new Error('Missing userId in subscription metadata');
      }

      // Downgrade user to free tier
      await DatabaseService.updateUserTier(userId, UserTier.FREE);

      // Update subscription status
      await DatabaseService.updateSubscriptionStatus(subscription.id, 'canceled');

      console.log(`Subscription deleted for user ${userId}`);
    } catch (error) {
      console.error('Failed to handle subscription deleted:', error);
      throw error;
    }
  }

  /**
   * Handle invoice payment succeeded
   */
  static async handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
    const { DatabaseService } = await import('./supabase');
    
    try {
      if (invoice.subscription) {
        const subscription = await StripeService.getSubscription(invoice.subscription as string);
        const userId = subscription.metadata.userId;
        
        if (userId) {
          // Reset monthly usage on successful payment
          // This could be implemented as needed
          console.log(`Payment succeeded for user ${userId}`);
        }
      }
    } catch (error) {
      console.error('Failed to handle invoice payment succeeded:', error);
      throw error;
    }
  }

  /**
   * Handle invoice payment failed
   */
  static async handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
    const { DatabaseService } = await import('./supabase');
    
    try {
      if (invoice.subscription) {
        const subscription = await StripeService.getSubscription(invoice.subscription as string);
        const userId = subscription.metadata.userId;
        
        if (userId) {
          // Update subscription status to past_due
          await DatabaseService.updateSubscriptionStatus(subscription.id, 'past_due');
          
          // TODO: Send notification email to user
          console.log(`Payment failed for user ${userId}`);
        }
      }
    } catch (error) {
      console.error('Failed to handle invoice payment failed:', error);
      throw error;
    }
  }
}

export { stripe };