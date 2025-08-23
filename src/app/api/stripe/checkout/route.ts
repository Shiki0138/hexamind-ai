import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { StripeService } from '@/lib/stripe';
import { UserTier } from '@/lib/auth-system';
import { authOptions } from '@/lib/auth-system';

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

    const { tier } = await request.json();

    // Validate tier
    if (!tier || !Object.values(UserTier).includes(tier)) {
      return NextResponse.json(
        { error: 'Invalid tier specified' },
        { status: 400 }
      );
    }

    // Prevent downgrade to free (should be handled through cancellation)
    if (tier === UserTier.FREE) {
      return NextResponse.json(
        { error: 'Cannot subscribe to free tier' },
        { status: 400 }
      );
    }

    // Get the origin URL for success/cancel URLs
    const origin = request.headers.get('origin') || process.env.NEXTAUTH_URL || 'http://localhost:3000';
    
    // Create checkout session
    const checkoutSession = await StripeService.createCheckoutSession({
      userId: session.user.id,
      userEmail: session.user.email!,
      tier: tier as UserTier,
      successUrl: `${origin}/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${origin}/dashboard?canceled=true`,
    });

    return NextResponse.json({
      sessionId: checkoutSession.id,
      url: checkoutSession.url
    });

  } catch (error: any) {
    console.error('Checkout session creation error:', error);
    
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}