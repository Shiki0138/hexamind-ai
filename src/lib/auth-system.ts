// 本格サービス向け認証・認可システム

import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { createClient } from '@supabase/supabase-js';

// ユーザーティア定義
export enum UserTier {
  FREE = 'free',
  BASIC = 'basic', 
  PRO = 'pro',
  ENTERPRISE = 'enterprise'
}

// サブスクリプション制限
export const TIER_LIMITS = {
  [UserTier.FREE]: {
    monthlyDiscussions: 10,
    maxAgents: 3,
    modes: ['normal'],
    aiQuality: 'good',
    features: ['save_results'],
    dailyLimit: 3
  },
  [UserTier.BASIC]: {
    monthlyDiscussions: 100,
    maxAgents: 6,
    modes: ['normal', 'creative'],
    aiQuality: 'high',
    features: ['premium_ai', 'history', 'export'],
    dailyLimit: 10
  },
  [UserTier.PRO]: {
    monthlyDiscussions: 500,
    maxAgents: 6,
    modes: ['normal', 'creative', 'deepthink', 'critical'],
    aiQuality: 'premium',
    features: ['all_ai', 'priority', 'analytics', 'team'],
    dailyLimit: 25
  },
  [UserTier.ENTERPRISE]: {
    monthlyDiscussions: -1, // unlimited
    maxAgents: 10,
    modes: ['all'],
    aiQuality: 'ultimate',
    features: ['dedicated_ai', 'sla', 'custom', 'white_label'],
    dailyLimit: -1 // unlimited
  }
} as const;

// Supabase設定
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

let supabase: any = null;
if (supabaseUrl && supabaseAnonKey && supabaseUrl !== 'https://your-project.supabase.co') {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

// NextAuth設定
export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        if (!supabase) {
          console.warn('Supabase not configured, using mock authentication');
          // Mock authentication for development
          if (credentials.email === 'test@example.com' && credentials.password === 'password') {
            return {
              id: '1',
              email: credentials.email,
              name: 'Test User'
            };
          }
          return null;
        }

        const { data, error } = await supabase.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password
        });

        if (error || !data.user) {
          return null;
        }

        return {
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.name || data.user.email
        };
      }
    })
  ],
  
  callbacks: {
    async jwt({ token, user, account }) {
      // 初回ログイン時にユーザーデータを取得
      if (user && account) {
        const userData = await getUserData(user.id);
        token.tier = userData.tier;
        token.usage = userData.monthlyUsage;
        token.subscriptionStatus = userData.subscriptionStatus;
      }
      
      return token;
    },
    
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
        session.user.tier = token.tier as UserTier;
        session.user.usage = token.usage as number;
        session.user.subscriptionStatus = token.subscriptionStatus as string;
      }
      
      return session;
    }
  },
  
  pages: {
    signIn: '/auth/signin',
    signUp: '/auth/signup',
    error: '/auth/error'
  }
};

// ユーザーデータ取得
export async function getUserData(userId: string) {
  if (!supabase) {
    // Return mock data for development
    return {
      id: userId,
      email: 'test@example.com',
      name: 'Test User',
      subscription_tier: UserTier.FREE,
      monthlyUsage: 0,
      subscriptionStatus: 'inactive'
    };
  }

  const { data, error } = await supabase
    .from('users')
    .select(`
      *,
      subscriptions(*),
      usage_stats(*)
    `)
    .eq('id', userId)
    .single();

  if (error) {
    throw new Error(`Failed to get user data: ${error.message}`);
  }

  const currentDate = new Date();
  const currentMonth = currentDate.toISOString().slice(0, 7); // YYYY-MM

  const monthlyUsage = data.usage_stats
    ?.filter((usage: any) => usage.created_at.startsWith(currentMonth))
    ?.reduce((sum: number, usage: any) => sum + usage.discussion_count, 0) || 0;

  return {
    ...data,
    tier: data.subscription_tier || UserTier.FREE,
    monthlyUsage,
    subscriptionStatus: data.subscriptions?.[0]?.status || 'inactive'
  };
}

// 使用制限チェック
export async function checkUsageLimit(userId: string, tier: UserTier): Promise<{
  canUse: boolean;
  remaining: number;
  resetDate: Date;
  reason?: string;
}> {
  const limits = TIER_LIMITS[tier];
  const userData = await getUserData(userId);
  
  // 月間制限チェック
  if (limits.monthlyDiscussions !== -1 && userData.monthlyUsage >= limits.monthlyDiscussions) {
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1, 1);
    nextMonth.setHours(0, 0, 0, 0);
    
    return {
      canUse: false,
      remaining: 0,
      resetDate: nextMonth,
      reason: `月間制限 ${limits.monthlyDiscussions} 回に達しました`
    };
  }

  // 日間制限チェック
  const today = new Date().toISOString().slice(0, 10);
  let dailyUsage: any = null;
  
  if (supabase) {
    const result = await supabase
      .from('usage_stats')
      .select('discussion_count')
      .eq('user_id', userId)
      .gte('created_at', today)
      .lt('created_at', today + 'T23:59:59');
    dailyUsage = result.data;
  }

  const todayUsage = dailyUsage?.reduce((sum, usage) => sum + usage.discussion_count, 0) || 0;

  if (limits.dailyLimit !== -1 && todayUsage >= limits.dailyLimit) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    return {
      canUse: false,
      remaining: 0,
      resetDate: tomorrow,
      reason: `日間制限 ${limits.dailyLimit} 回に達しました`
    };
  }

  const remaining = limits.monthlyDiscussions === -1 
    ? 999999 
    : limits.monthlyDiscussions - userData.monthlyUsage;

  return {
    canUse: true,
    remaining,
    resetDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
  };
}

// 使用量記録
export async function recordUsage(
  userId: string,
  discussionData: {
    topic: string;
    agents: string[];
    mode: string;
    success: boolean;
    responseTime: number;
    aiProvider: string;
  }
): Promise<void> {
  if (!supabase) {
    console.warn('Supabase not configured, skipping usage recording');
    return;
  }

  const { error } = await supabase
    .from('usage_stats')
    .insert({
      user_id: userId,
      discussion_count: 1,
      topic: discussionData.topic,
      agents: discussionData.agents,
      thinking_mode: discussionData.mode,
      success: discussionData.success,
      response_time: discussionData.responseTime,
      ai_provider: discussionData.aiProvider,
      created_at: new Date().toISOString()
    });

  if (error) {
    console.error('Failed to record usage:', error);
  }
}

// Rate limiting
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export async function checkRateLimit(
  userId: string,
  tier: UserTier,
  window: number = 60000 // 1分
): Promise<{ allowed: boolean; resetTime: number; remaining: number }> {
  const limits = {
    [UserTier.FREE]: 5,    // 1分間に5回
    [UserTier.BASIC]: 15,  // 1分間に15回
    [UserTier.PRO]: 30,    // 1分間に30回
    [UserTier.ENTERPRISE]: 100 // 1分間に100回
  };

  const maxRequests = limits[tier];
  const now = Date.now();
  const userLimit = rateLimitStore.get(userId);

  if (!userLimit || now > userLimit.resetTime) {
    // 新しいウィンドウを開始
    rateLimitStore.set(userId, {
      count: 1,
      resetTime: now + window
    });
    
    return {
      allowed: true,
      resetTime: now + window,
      remaining: maxRequests - 1
    };
  }

  if (userLimit.count >= maxRequests) {
    return {
      allowed: false,
      resetTime: userLimit.resetTime,
      remaining: 0
    };
  }

  // カウントを増加
  userLimit.count++;
  rateLimitStore.set(userId, userLimit);

  return {
    allowed: true,
    resetTime: userLimit.resetTime,
    remaining: maxRequests - userLimit.count
  };
}

// 権限チェックミドルウェア
export async function requireAuth(
  request: Request,
  requiredTier?: UserTier
): Promise<{ user: any; error?: string }> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return { user: null, error: 'Authentication required' };
  }

  const token = authHeader.substring(7);
  
  try {
    // JWT検証（実装は省略、実際にはjwtライブラリを使用）
    const payload = await verifyJWT(token);
    const userData = await getUserData(payload.userId);
    
    // ティア要件チェック
    if (requiredTier && !hasRequiredTier(userData.tier, requiredTier)) {
      return { 
        user: null, 
        error: `${requiredTier} tier required, but user has ${userData.tier}` 
      };
    }

    return { user: userData };
  } catch (error) {
    return { user: null, error: 'Invalid token' };
  }
}

// ティア階層チェック
function hasRequiredTier(userTier: UserTier, requiredTier: UserTier): boolean {
  const tierHierarchy = {
    [UserTier.FREE]: 0,
    [UserTier.BASIC]: 1,
    [UserTier.PRO]: 2,
    [UserTier.ENTERPRISE]: 3
  };

  return tierHierarchy[userTier] >= tierHierarchy[requiredTier];
}

// JWT検証（実装例）
async function verifyJWT(token: string): Promise<{ userId: string; tier: UserTier }> {
  // 実際の実装では、jose/jwtやjsonwebtokenライブラリを使用
  // ここでは簡略化
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch (error) {
    throw new Error('Invalid JWT token');
  }
}

// Supabaseデータベーススキーマ（参考）
export const DATABASE_SCHEMA = `
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  subscription_tier VARCHAR(50) DEFAULT 'free',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Subscriptions table
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  stripe_subscription_id VARCHAR(255) UNIQUE,
  status VARCHAR(50) NOT NULL,
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Usage stats table
CREATE TABLE usage_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  discussion_count INTEGER DEFAULT 1,
  topic TEXT,
  agents TEXT[],
  thinking_mode VARCHAR(50),
  success BOOLEAN DEFAULT true,
  response_time INTEGER,
  ai_provider VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_usage_stats_user_date ON usage_stats(user_id, created_at);
CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_users_tier ON users(subscription_tier);
`;