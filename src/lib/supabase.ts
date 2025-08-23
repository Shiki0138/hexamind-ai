// Supabase client configuration
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create Supabase client with validation
let supabase: SupabaseClient | null = null;

if (supabaseUrl && supabaseAnonKey && supabaseUrl !== 'https://your-project.supabase.co') {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
  console.warn('Supabase credentials not configured. Database features will be disabled.');
}

export { supabase };

// Database types
export interface User {
  id: string;
  email: string;
  name?: string;
  subscription_tier: 'free' | 'basic' | 'pro' | 'enterprise';
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  stripe_subscription_id?: string;
  status: 'active' | 'inactive' | 'canceled' | 'past_due';
  current_period_start?: string;
  current_period_end?: string;
  created_at: string;
}

export interface UsageStat {
  id: string;
  user_id: string;
  discussion_count: number;
  topic: string;
  agents: string[];
  thinking_mode: string;
  success: boolean;
  response_time: number;
  ai_provider: string;
  created_at: string;
}

export interface Discussion {
  id: string;
  user_id: string;
  topic: string;
  agents: string[];
  thinking_mode: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  result?: string;
  created_at: string;
  updated_at: string;
}

// Database helper functions
export class DatabaseService {
  // Check if Supabase is configured
  private static isConfigured(): boolean {
    return supabase !== null;
  }

  // User management
  static async createUser(userData: {
    email: string;
    name?: string;
    subscription_tier?: 'free' | 'basic' | 'pro' | 'enterprise';
  }): Promise<User> {
    if (!this.isConfigured()) {
      throw new Error('Supabase is not configured');
    }

    const { data, error } = await supabase!
      .from('users')
      .insert({
        email: userData.email,
        name: userData.name,
        subscription_tier: userData.subscription_tier || 'free'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getUserById(userId: string): Promise<User | null> {
    if (!this.isConfigured()) {
      return null;
    }

    const { data, error } = await supabase!
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  static async updateUserTier(userId: string, tier: 'free' | 'basic' | 'pro' | 'enterprise'): Promise<void> {
    if (!this.isConfigured()) {
      return;
    }

    const { error } = await supabase!
      .from('users')
      .update({ 
        subscription_tier: tier,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) throw error;
  }

  // Subscription management
  static async createSubscription(subscriptionData: {
    user_id: string;
    stripe_subscription_id?: string;
    status: 'active' | 'inactive' | 'canceled' | 'past_due';
    current_period_start?: string;
    current_period_end?: string;
  }): Promise<Subscription> {
    const { data, error } = await supabase
      .from('subscriptions')
      .insert(subscriptionData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getActiveSubscription(userId: string): Promise<Subscription | null> {
    if (!this.isConfigured()) {
      return null;
    }

    const { data, error } = await supabase!
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  static async updateSubscriptionStatus(
    subscriptionId: string, 
    status: 'active' | 'inactive' | 'canceled' | 'past_due'
  ): Promise<void> {
    const { error } = await supabase
      .from('subscriptions')
      .update({ status })
      .eq('stripe_subscription_id', subscriptionId);

    if (error) throw error;
  }

  // Usage tracking
  static async recordDiscussion(usageData: {
    user_id: string;
    topic: string;
    agents: string[];
    thinking_mode: string;
    success: boolean;
    response_time: number;
    ai_provider: string;
  }): Promise<UsageStat> {
    const { data, error } = await supabase
      .from('usage_stats')
      .insert({
        ...usageData,
        discussion_count: 1,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getMonthlyUsage(userId: string): Promise<number> {
    if (!this.isConfigured()) {
      return 0;
    }

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { data, error } = await supabase!
      .from('usage_stats')
      .select('discussion_count')
      .eq('user_id', userId)
      .gte('created_at', startOfMonth.toISOString());

    if (error) throw error;

    return data?.reduce((sum, stat) => sum + stat.discussion_count, 0) || 0;
  }

  static async getDailyUsage(userId: string): Promise<number> {
    if (!this.isConfigured()) {
      return 0;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const { data, error } = await supabase!
      .from('usage_stats')
      .select('discussion_count')
      .eq('user_id', userId)
      .gte('created_at', today.toISOString())
      .lt('created_at', tomorrow.toISOString());

    if (error) throw error;

    return data?.reduce((sum, stat) => sum + stat.discussion_count, 0) || 0;
  }

  static async getUserUsageHistory(
    userId: string, 
    limit: number = 50
  ): Promise<UsageStat[]> {
    const { data, error } = await supabase
      .from('usage_stats')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  // Discussion management
  static async saveDiscussion(discussionData: {
    user_id: string;
    topic: string;
    agents: string[];
    thinking_mode: string;
    result?: string;
    status?: 'pending' | 'in_progress' | 'completed' | 'failed';
  }): Promise<Discussion> {
    const { data, error } = await supabase
      .from('discussions')
      .insert({
        ...discussionData,
        status: discussionData.status || 'completed',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getDiscussionHistory(
    userId: string, 
    limit: number = 20
  ): Promise<Discussion[]> {
    if (!this.isConfigured()) {
      // Return mock data for development
      return [];
    }

    const { data, error } = await supabase!
      .from('discussions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  static async updateDiscussionStatus(
    discussionId: string, 
    status: 'pending' | 'in_progress' | 'completed' | 'failed',
    result?: string
  ): Promise<void> {
    const updateData: any = { 
      status, 
      updated_at: new Date().toISOString() 
    };
    
    if (result) {
      updateData.result = result;
    }

    const { error } = await supabase
      .from('discussions')
      .update(updateData)
      .eq('id', discussionId);

    if (error) throw error;
  }

  // Analytics and reporting
  static async getUserAnalytics(userId: string): Promise<{
    totalDiscussions: number;
    monthlyDiscussions: number;
    successRate: number;
    averageResponseTime: number;
    topAgents: string[];
    topModes: string[];
  }> {
    if (!this.isConfigured()) {
      // Return mock analytics for development
      return {
        totalDiscussions: 0,
        monthlyDiscussions: 0,
        successRate: 0,
        averageResponseTime: 0,
        topAgents: [],
        topModes: []
      };
    }

    // Get total discussions
    const { data: totalData, error: totalError } = await supabase!
      .from('usage_stats')
      .select('discussion_count, success, response_time, agents, thinking_mode')
      .eq('user_id', userId);

    if (totalError) throw totalError;

    // Get monthly discussions
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { data: monthlyData, error: monthlyError } = await supabase!
      .from('usage_stats')
      .select('discussion_count')
      .eq('user_id', userId)
      .gte('created_at', startOfMonth.toISOString());

    if (monthlyError) throw monthlyError;

    const totalDiscussions = totalData?.reduce((sum, stat) => sum + stat.discussion_count, 0) || 0;
    const monthlyDiscussions = monthlyData?.reduce((sum, stat) => sum + stat.discussion_count, 0) || 0;
    const successfulDiscussions = totalData?.filter(stat => stat.success).length || 0;
    const successRate = totalDiscussions > 0 ? (successfulDiscussions / totalData.length) * 100 : 0;
    const averageResponseTime = totalData?.reduce((sum, stat) => sum + stat.response_time, 0) / (totalData.length || 1);

    // Get top agents and modes
    const agentCount: Record<string, number> = {};
    const modeCount: Record<string, number> = {};

    totalData?.forEach(stat => {
      stat.agents?.forEach((agent: string) => {
        agentCount[agent] = (agentCount[agent] || 0) + 1;
      });
      modeCount[stat.thinking_mode] = (modeCount[stat.thinking_mode] || 0) + 1;
    });

    const topAgents = Object.entries(agentCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([agent]) => agent);

    const topModes = Object.entries(modeCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([mode]) => mode);

    return {
      totalDiscussions,
      monthlyDiscussions,
      successRate,
      averageResponseTime,
      topAgents,
      topModes
    };
  }
}

// Real-time subscriptions
export const subscribeToUserChanges = (userId: string, callback: (payload: any) => void) => {
  return supabase
    .channel('user-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'users',
        filter: `id=eq.${userId}`
      },
      callback
    )
    .subscribe();
};

export const subscribeToUsageUpdates = (userId: string, callback: (payload: any) => void) => {
  return supabase
    .channel('usage-updates')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'usage_stats',
        filter: `user_id=eq.${userId}`
      },
      callback
    )
    .subscribe();
};