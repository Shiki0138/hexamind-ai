// ユーザー利用制限システム

import { SUBSCRIPTION_PLANS, SubscriptionPlan } from './cost-efficient-models';

export interface UserQuota {
  userId: string;
  planId: string;
  currentPeriod: {
    start: Date;
    end: Date;
    discussionsUsed: number;
    discussionsLimit: number;
    tokensUsed: {
      input: number;
      output: number;
    };
    costIncurred: number;
  };
  history: QuotaHistory[];
}

export interface QuotaHistory {
  period: {
    start: Date;
    end: Date;
  };
  discussions: number;
  tokensUsed: {
    input: number;
    output: number;
  };
  cost: number;
}

export class UsageLimiter {
  private readonly STORAGE_KEY = 'hexamind_user_quota';
  
  // ユーザーの利用状況を取得
  getUserQuota(userId: string): UserQuota | null {
    if (typeof window === 'undefined') return null;
    
    const stored = localStorage.getItem(`${this.STORAGE_KEY}_${userId}`);
    if (!stored) return null;
    
    try {
      const quota = JSON.parse(stored);
      // Date型の復元
      quota.currentPeriod.start = new Date(quota.currentPeriod.start);
      quota.currentPeriod.end = new Date(quota.currentPeriod.end);
      return quota;
    } catch (error) {
      console.error('Failed to load user quota:', error);
      return null;
    }
  }

  // 新規ユーザーの初期化
  initializeUser(userId: string, planId: string = 'free'): UserQuota {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId) || SUBSCRIPTION_PLANS[0];
    
    const quota: UserQuota = {
      userId,
      planId,
      currentPeriod: {
        start,
        end,
        discussionsUsed: 0,
        discussionsLimit: plan.monthlyDiscussions,
        tokensUsed: {
          input: 0,
          output: 0
        },
        costIncurred: 0
      },
      history: []
    };
    
    this.saveUserQuota(quota);
    return quota;
  }

  // 利用可能かチェック
  canUseService(userId: string): {
    allowed: boolean;
    reason?: string;
    remainingDiscussions?: number;
    resetDate?: Date;
  } {
    let quota = this.getUserQuota(userId);
    
    if (!quota) {
      quota = this.initializeUser(userId);
    }
    
    // 期間のチェックと更新
    const now = new Date();
    if (now > quota.currentPeriod.end) {
      this.resetMonthlyQuota(quota);
    }
    
    const plan = SUBSCRIPTION_PLANS.find(p => p.id === quota.planId);
    if (!plan) {
      return {
        allowed: false,
        reason: 'Invalid subscription plan'
      };
    }
    
    // 無制限プランのチェック
    if (plan.monthlyDiscussions === -1) {
      return {
        allowed: true,
        remainingDiscussions: -1
      };
    }
    
    // 利用制限のチェック
    if (quota.currentPeriod.discussionsUsed >= quota.currentPeriod.discussionsLimit) {
      return {
        allowed: false,
        reason: `月間利用上限（${quota.currentPeriod.discussionsLimit}回）に達しました`,
        remainingDiscussions: 0,
        resetDate: quota.currentPeriod.end
      };
    }
    
    return {
      allowed: true,
      remainingDiscussions: quota.currentPeriod.discussionsLimit - quota.currentPeriod.discussionsUsed,
      resetDate: quota.currentPeriod.end
    };
  }

  // 利用記録
  recordUsage(
    userId: string,
    discussion: {
      id: string;
      agents: string[];
      rounds: number;
      tokensUsed: {
        input: number;
        output: number;
      };
      cost: number;
    }
  ): boolean {
    const quota = this.getUserQuota(userId);
    if (!quota) return false;
    
    // 利用可能チェック
    const canUse = this.canUseService(userId);
    if (!canUse.allowed) return false;
    
    // 利用記録を更新
    quota.currentPeriod.discussionsUsed++;
    quota.currentPeriod.tokensUsed.input += discussion.tokensUsed.input;
    quota.currentPeriod.tokensUsed.output += discussion.tokensUsed.output;
    quota.currentPeriod.costIncurred += discussion.cost;
    
    this.saveUserQuota(quota);
    return true;
  }

  // 月次リセット
  private resetMonthlyQuota(quota: UserQuota): void {
    // 履歴に追加
    quota.history.push({
      period: {
        start: quota.currentPeriod.start,
        end: quota.currentPeriod.end
      },
      discussions: quota.currentPeriod.discussionsUsed,
      tokensUsed: { ...quota.currentPeriod.tokensUsed },
      cost: quota.currentPeriod.costIncurred
    });
    
    // 新しい期間を設定
    const now = new Date();
    quota.currentPeriod = {
      start: new Date(now.getFullYear(), now.getMonth(), 1),
      end: new Date(now.getFullYear(), now.getMonth() + 1, 0),
      discussionsUsed: 0,
      discussionsLimit: quota.currentPeriod.discussionsLimit,
      tokensUsed: {
        input: 0,
        output: 0
      },
      costIncurred: 0
    };
    
    // 最大12ヶ月分の履歴を保持
    if (quota.history.length > 12) {
      quota.history = quota.history.slice(-12);
    }
    
    this.saveUserQuota(quota);
  }

  // プラン変更
  upgradePlan(userId: string, newPlanId: string): boolean {
    const quota = this.getUserQuota(userId);
    if (!quota) return false;
    
    const newPlan = SUBSCRIPTION_PLANS.find(p => p.id === newPlanId);
    if (!newPlan) return false;
    
    quota.planId = newPlanId;
    quota.currentPeriod.discussionsLimit = newPlan.monthlyDiscussions;
    
    this.saveUserQuota(quota);
    return true;
  }

  // 利用統計の取得
  getUsageStats(userId: string): {
    current: {
      used: number;
      limit: number;
      percentage: number;
      daysRemaining: number;
      averagePerDay: number;
      projectedMonthlyUsage: number;
    };
    cost: {
      current: number;
      average: number;
      projected: number;
    };
    history: QuotaHistory[];
  } | null {
    const quota = this.getUserQuota(userId);
    if (!quota) return null;
    
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const daysPassed = now.getDate();
    const daysRemaining = daysInMonth - daysPassed;
    
    const averagePerDay = quota.currentPeriod.discussionsUsed / daysPassed;
    const projectedMonthlyUsage = averagePerDay * daysInMonth;
    
    const percentage = quota.currentPeriod.discussionsLimit === -1 
      ? 0 
      : (quota.currentPeriod.discussionsUsed / quota.currentPeriod.discussionsLimit) * 100;
    
    return {
      current: {
        used: quota.currentPeriod.discussionsUsed,
        limit: quota.currentPeriod.discussionsLimit,
        percentage,
        daysRemaining,
        averagePerDay,
        projectedMonthlyUsage
      },
      cost: {
        current: quota.currentPeriod.costIncurred,
        average: quota.currentPeriod.discussionsUsed > 0 
          ? quota.currentPeriod.costIncurred / quota.currentPeriod.discussionsUsed 
          : 0,
        projected: averagePerDay * daysInMonth * 
          (quota.currentPeriod.discussionsUsed > 0 
            ? quota.currentPeriod.costIncurred / quota.currentPeriod.discussionsUsed 
            : 0)
      },
      history: quota.history
    };
  }

  // 保存
  private saveUserQuota(quota: UserQuota): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(
        `${this.STORAGE_KEY}_${quota.userId}`,
        JSON.stringify(quota)
      );
    } catch (error) {
      console.error('Failed to save user quota:', error);
    }
  }

  // 管理者向け: 全ユーザーの利用状況
  getAllUsersStats(): Record<string, any> {
    if (typeof window === 'undefined') return {};
    
    const stats: Record<string, any> = {};
    const keys = Object.keys(localStorage).filter(k => k.startsWith(this.STORAGE_KEY));
    
    keys.forEach(key => {
      try {
        const quota = JSON.parse(localStorage.getItem(key) || '{}');
        stats[quota.userId] = {
          plan: quota.planId,
          usage: quota.currentPeriod.discussionsUsed,
          limit: quota.currentPeriod.discussionsLimit,
          cost: quota.currentPeriod.costIncurred
        };
      } catch (error) {
        console.error('Failed to parse user quota:', error);
      }
    });
    
    return stats;
  }
}

// シングルトンインスタンス
export const usageLimiter = new UsageLimiter();