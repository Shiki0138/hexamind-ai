import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { StripeService } from '@/lib/stripe';
import { DatabaseService } from '@/lib/supabase';
import { authOptions } from '@/lib/auth-system';

// 動的ルートとして設定（ビルド時の静的解析を回避）
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user's active subscription
    const activeSubscription = await DatabaseService.getActiveSubscription(session.user.id);
    
    if (!activeSubscription || !activeSubscription.stripe_subscription_id) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 404 }
      );
    }

    // Get subscription from Stripe to get customer ID
    const stripeSubscription = await StripeService.getSubscription(
      activeSubscription.stripe_subscription_id
    );

    const customerId = typeof stripeSubscription.customer === 'string' 
      ? stripeSubscription.customer 
      : stripeSubscription.customer.id;

    // Get the origin URL for return URL
    const origin = request.headers.get('origin') || process.env.NEXTAUTH_URL || 'http://localhost:3000';
    
    // Create portal session
    const portalSession = await StripeService.createPortalSession({
      customerId,
      returnUrl: `${origin}/dashboard`,
    });

    return NextResponse.json({
      url: portalSession.url
    });

  } catch (error: any) {
    console.error('Portal session creation error:', error);
    
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}