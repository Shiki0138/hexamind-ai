/**
 * モックデータベースサービス
 * 開発環境やデモ環境で使用
 * データはメモリ内に保存され、リロードで消える
 */

import { User, Subscription, UsageStat, Discussion } from './supabase';

// メモリ内データストア
const dataStore = {
  users: new Map<string, User>(),
  subscriptions: new Map<string, Subscription>(),
  usageStats: new Map<string, UsageStat>(),
  discussions: new Map<string, Discussion>()
};

// 初期データ（管理者用）
const ADMIN_USER: User = {
  id: 'admin-001',
  email: 'admin@hexamind.ai',
  name: '管理者',
  subscription_tier: 'enterprise',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

// 初期化
dataStore.users.set(ADMIN_USER.id, ADMIN_USER);

export class MockDatabaseService {
  // Check if Mock database is configured
  private static isConfigured(): boolean {
    return true; // Mock database is always available
  }

  // User management
  static async createUser(userData: {
    email: string;
    name?: string;
    subscription_tier?: 'free' | 'basic' | 'pro' | 'enterprise';
  }): Promise<User> {
    const user: User = {
      id: `user-${Date.now()}`,
      email: userData.email,
      name: userData.name,
      subscription_tier: userData.subscription_tier || 'free',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    dataStore.users.set(user.id, user);
    return user;
  }

  static async getUserById(userId: string): Promise<User | null> {
    return dataStore.users.get(userId) || null;
  }

  static async getUserByEmail(email: string): Promise<User | null> {
    for (const user of dataStore.users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return null;
  }

  static async updateUserTier(userId: string, tier: 'free' | 'basic' | 'pro' | 'enterprise'): Promise<void> {
    const user = dataStore.users.get(userId);
    if (user) {
      user.subscription_tier = tier;
      user.updated_at = new Date().toISOString();
      dataStore.users.set(userId, user);
    }
  }

  // Subscription management
  static async createSubscription(subscriptionData: {
    user_id: string;
    stripe_subscription_id?: string;
    status: 'active' | 'inactive' | 'canceled' | 'past_due';
    current_period_start?: string;
    current_period_end?: string;
  }): Promise<Subscription> {
    const subscription: Subscription = {
      id: `sub-${Date.now()}`,
      ...subscriptionData,
      created_at: new Date().toISOString()
    };

    dataStore.subscriptions.set(subscription.id, subscription);
    return subscription;
  }

  static async getActiveSubscription(userId: string): Promise<Subscription | null> {
    for (const sub of dataStore.subscriptions.values()) {
      if (sub.user_id === userId && sub.status === 'active') {
        return sub;
      }
    }
    return null;
  }

  static async updateSubscriptionStatus(
    subscriptionId: string, 
    status: 'active' | 'inactive' | 'canceled' | 'past_due'
  ): Promise<void> {
    for (const sub of dataStore.subscriptions.values()) {
      if (sub.stripe_subscription_id === subscriptionId) {
        sub.status = status;
        dataStore.subscriptions.set(sub.id, sub);
        break;
      }
    }
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
    const usage: UsageStat = {
      id: `usage-${Date.now()}`,
      ...usageData,
      discussion_count: 1,
      created_at: new Date().toISOString()
    };

    dataStore.usageStats.set(usage.id, usage);
    return usage;
  }

  static async getMonthlyUsage(userId: string): Promise<number> {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    let count = 0;
    for (const usage of dataStore.usageStats.values()) {
      if (usage.user_id === userId && 
          new Date(usage.created_at) >= startOfMonth) {
        count += usage.discussion_count;
      }
    }

    return count;
  }

  static async getDailyUsage(userId: string): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let count = 0;
    for (const usage of dataStore.usageStats.values()) {
      if (usage.user_id === userId && 
          new Date(usage.created_at) >= today) {
        count += usage.discussion_count;
      }
    }

    return count;
  }

  static async getUserUsageHistory(
    userId: string, 
    limit: number = 50
  ): Promise<UsageStat[]> {
    const userStats = Array.from(dataStore.usageStats.values())
      .filter(stat => stat.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit);

    return userStats;
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
    const discussion: Discussion = {
      id: `disc-${Date.now()}`,
      ...discussionData,
      status: discussionData.status || 'completed',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    dataStore.discussions.set(discussion.id, discussion);
    return discussion;
  }

  static async getDiscussionHistory(
    userId: string, 
    limit: number = 20
  ): Promise<Discussion[]> {
    const userDiscussions = Array.from(dataStore.discussions.values())
      .filter(disc => disc.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit);

    return userDiscussions;
  }

  static async getUserDiscussions(
    userId: string, 
    limit: number = 20
  ): Promise<Array<{
    id: string;
    title: string;
    created_at: string;
    status: 'completed' | 'in_progress' | 'failed';
    mode: string;
    agents_used: string[];
  }>> {
    const userDiscussions = Array.from(dataStore.discussions.values())
      .filter(disc => disc.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit);

    return userDiscussions.map(disc => ({
      id: disc.id,
      title: disc.topic,
      created_at: disc.created_at,
      status: disc.status as 'completed' | 'in_progress' | 'failed',
      mode: disc.thinking_mode,
      agents_used: disc.agents
    }));
  }

  static async updateDiscussionStatus(
    discussionId: string, 
    status: 'pending' | 'in_progress' | 'completed' | 'failed',
    result?: string
  ): Promise<void> {
    const discussion = dataStore.discussions.get(discussionId);
    if (discussion) {
      discussion.status = status;
      discussion.updated_at = new Date().toISOString();
      if (result) {
        discussion.result = result;
      }
      dataStore.discussions.set(discussionId, discussion);
    }
  }

  // Analytics
  static async getUserAnalytics(userId: string): Promise<{
    totalDiscussions: number;
    monthlyDiscussions: number;
    successRate: number;
    averageResponseTime: number;
    topAgents: string[];
    topModes: string[];
  }> {
    const allStats = await this.getUserUsageHistory(userId, 1000);
    const monthlyUsage = await this.getMonthlyUsage(userId);

    const totalDiscussions = allStats.length;
    const successfulDiscussions = allStats.filter(stat => stat.success).length;
    const successRate = totalDiscussions > 0 ? (successfulDiscussions / totalDiscussions) * 100 : 0;
    const averageResponseTime = allStats.reduce((sum, stat) => sum + stat.response_time, 0) / (allStats.length || 1);

    // Calculate top agents and modes
    const agentCount: Record<string, number> = {};
    const modeCount: Record<string, number> = {};

    allStats.forEach(stat => {
      stat.agents?.forEach(agent => {
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
      monthlyDiscussions: monthlyUsage,
      successRate,
      averageResponseTime,
      topAgents,
      topModes
    };
  }
}

// Real-time subscriptions (mock implementation)
export const subscribeToUserChanges = (userId: string, callback: (payload: any) => void) => {
  // モック実装：実際のリアルタイム更新はなし
  console.log(`Mock: Subscribed to user changes for ${userId}`);
  return {
    unsubscribe: () => Promise.resolve({ error: null })
  };
};

export const subscribeToUsageUpdates = (userId: string, callback: (payload: any) => void) => {
  // モック実装：実際のリアルタイム更新はなし
  console.log(`Mock: Subscribed to usage updates for ${userId}`);
  return {
    unsubscribe: () => Promise.resolve({ error: null })
  };
};