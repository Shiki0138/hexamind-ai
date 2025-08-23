// プレミアムサブスクリプション使用量トラッキングシステム

export interface UsageRecord {
  timestamp: Date;
  service: 'claude-pro' | 'chatgpt-plus' | 'gemini-ultra';
  agent: string;
  topic: string;
  thinkingMode: string;
  success: boolean;
  responseTime: number;
  errorMessage?: string;
}

export interface UsageStats {
  service: string;
  dailyUsage: number;
  weeklyUsage: number;
  monthlyUsage: number;
  dailyLimit: number;
  weeklyLimit: number;
  monthlyLimit: number;
  lastResetDate: Date;
  averageResponseTime: number;
  successRate: number;
}

export class UsageTracker {
  private records: UsageRecord[] = [];
  private readonly STORAGE_KEY = 'night-shift-ai-usage';
  
  // サービス別制限設定
  private readonly SERVICE_LIMITS = {
    'claude-pro': {
      daily: 166,    // 月5000 ÷ 30日
      weekly: 1166,  // 月5000 ÷ 4.3週
      monthly: 5000
    },
    'chatgpt-plus': {
      daily: 106,    // 月3200 ÷ 30日
      weekly: 744,   // 月3200 ÷ 4.3週
      monthly: 3200
    },
    'gemini-ultra': {
      daily: 66,     // 月2000 ÷ 30日
      weekly: 465,   // 月2000 ÷ 4.3週
      monthly: 2000
    }
  };

  constructor() {
    this.loadFromStorage();
    this.startPeriodicCleanup();
  }

  /**
   * 使用量を記録
   */
  recordUsage(
    service: 'claude-pro' | 'chatgpt-plus' | 'gemini-ultra',
    agent: string,
    topic: string,
    thinkingMode: string,
    success: boolean,
    responseTime: number,
    errorMessage?: string
  ): void {
    const record: UsageRecord = {
      timestamp: new Date(),
      service,
      agent,
      topic,
      thinkingMode,
      success,
      responseTime,
      errorMessage
    };

    this.records.push(record);
    this.saveToStorage();

    console.log(`Usage recorded: ${service} - ${agent} - ${success ? 'SUCCESS' : 'FAILED'}`);
  }

  /**
   * サービス別使用統計を取得
   */
  getUsageStats(service: 'claude-pro' | 'chatgpt-plus' | 'gemini-ultra'): UsageStats {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const serviceRecords = this.records.filter(r => r.service === service);
    const dailyRecords = serviceRecords.filter(r => r.timestamp > oneDayAgo);
    const weeklyRecords = serviceRecords.filter(r => r.timestamp > oneWeekAgo);
    const monthlyRecords = serviceRecords.filter(r => r.timestamp > oneMonthAgo);

    const successfulRecords = serviceRecords.filter(r => r.success);
    const avgResponseTime = successfulRecords.length > 0 
      ? successfulRecords.reduce((sum, r) => sum + r.responseTime, 0) / successfulRecords.length
      : 0;

    const successRate = serviceRecords.length > 0 
      ? (successfulRecords.length / serviceRecords.length) * 100
      : 0;

    const limits = this.SERVICE_LIMITS[service];

    return {
      service,
      dailyUsage: dailyRecords.length,
      weeklyUsage: weeklyRecords.length,
      monthlyUsage: monthlyRecords.length,
      dailyLimit: limits.daily,
      weeklyLimit: limits.weekly,
      monthlyLimit: limits.monthly,
      lastResetDate: this.getLastResetDate(),
      averageResponseTime: Math.round(avgResponseTime),
      successRate: Math.round(successRate * 10) / 10
    };
  }

  /**
   * 全サービスの使用統計を取得
   */
  getAllUsageStats(): UsageStats[] {
    return [
      this.getUsageStats('claude-pro'),
      this.getUsageStats('chatgpt-plus'),
      this.getUsageStats('gemini-ultra')
    ];
  }

  /**
   * 使用可能かチェック
   */
  canUseService(service: 'claude-pro' | 'chatgpt-plus' | 'gemini-ultra'): {
    canUse: boolean;
    reason?: string;
    nextAvailableTime?: Date;
  } {
    const stats = this.getUsageStats(service);

    // 月間制限チェック
    if (stats.monthlyUsage >= stats.monthlyLimit) {
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1, 1);
      nextMonth.setHours(0, 0, 0, 0);
      
      return {
        canUse: false,
        reason: `月間制限 (${stats.monthlyLimit}) に達しました`,
        nextAvailableTime: nextMonth
      };
    }

    // 週間制限チェック
    if (stats.weeklyUsage >= stats.weeklyLimit) {
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + (7 - nextWeek.getDay()));
      nextWeek.setHours(0, 0, 0, 0);
      
      return {
        canUse: false,
        reason: `週間制限 (${stats.weeklyLimit}) に達しました`,
        nextAvailableTime: nextWeek
      };
    }

    // 日間制限チェック
    if (stats.dailyUsage >= stats.dailyLimit) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      return {
        canUse: false,
        reason: `日間制限 (${stats.dailyLimit}) に達しました`,
        nextAvailableTime: tomorrow
      };
    }

    return { canUse: true };
  }

  /**
   * 最適なサービスを選択
   */
  selectBestAvailableService(): {
    service: 'claude-pro' | 'chatgpt-plus' | 'gemini-ultra' | null;
    reason: string;
  } {
    const services: ('claude-pro' | 'chatgpt-plus' | 'gemini-ultra')[] = [
      'claude-pro', 'chatgpt-plus', 'gemini-ultra'
    ];

    // 使用可能なサービスを品質順で確認
    for (const service of services) {
      const availability = this.canUseService(service);
      if (availability.canUse) {
        const stats = this.getUsageStats(service);
        const remainingDaily = stats.dailyLimit - stats.dailyUsage;
        
        return {
          service,
          reason: `${service} を選択 (本日残り: ${remainingDaily}回, 成功率: ${stats.successRate}%)`
        };
      }
    }

    return {
      service: null,
      reason: '全てのプレミアムサービスが制限に達しています'
    };
  }

  /**
   * 使用量レポート生成
   */
  generateUsageReport(): {
    summary: string;
    details: UsageStats[];
    recommendations: string[];
  } {
    const allStats = this.getAllUsageStats();
    const totalMonthlyUsage = allStats.reduce((sum, stat) => sum + stat.monthlyUsage, 0);
    const totalMonthlyLimit = allStats.reduce((sum, stat) => sum + stat.monthlyLimit, 0);
    const utilizationRate = (totalMonthlyUsage / totalMonthlyLimit) * 100;

    const recommendations: string[] = [];

    if (utilizationRate > 80) {
      recommendations.push('月間使用量が80%を超えています。使用頻度を調整することを検討してください。');
    }

    if (utilizationRate < 30) {
      recommendations.push('プレミアムサブスクリプションの価値を十分活用できていません。より多くの議論を実施することをお勧めします。');
    }

    allStats.forEach(stat => {
      if (stat.successRate < 90) {
        recommendations.push(`${stat.service} の成功率が低下しています (${stat.successRate}%)。接続状況を確認してください。`);
      }
    });

    return {
      summary: `月間利用率: ${Math.round(utilizationRate)}% (${totalMonthlyUsage}/${totalMonthlyLimit}回)`,
      details: allStats,
      recommendations
    };
  }

  /**
   * 使用履歴をエクスポート
   */
  exportUsageHistory(): string {
    const csvHeader = 'Timestamp,Service,Agent,Topic,ThinkingMode,Success,ResponseTime,ErrorMessage\n';
    const csvData = this.records.map(record => 
      `${record.timestamp.toISOString()},${record.service},${record.agent},"${record.topic}",${record.thinkingMode},${record.success},${record.responseTime},"${record.errorMessage || ''}"`
    ).join('\n');
    
    return csvHeader + csvData;
  }

  /**
   * ローカルストレージから読み込み
   */
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        this.records = data.map((record: any) => ({
          ...record,
          timestamp: new Date(record.timestamp)
        }));
      }
    } catch (error) {
      console.error('Failed to load usage data from storage:', error);
      this.records = [];
    }
  }

  /**
   * ローカルストレージに保存
   */
  private saveToStorage(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.records));
    } catch (error) {
      console.error('Failed to save usage data to storage:', error);
    }
  }

  /**
   * 古いレコードのクリーンアップ
   */
  private startPeriodicCleanup(): void {
    // 1時間毎に実行
    setInterval(() => {
      const oneMonthAgo = new Date();
      oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);
      
      const initialLength = this.records.length;
      this.records = this.records.filter(record => record.timestamp > oneMonthAgo);
      
      if (this.records.length !== initialLength) {
        console.log(`Cleaned up ${initialLength - this.records.length} old usage records`);
        this.saveToStorage();
      }
    }, 60 * 60 * 1000);
  }

  /**
   * 最終リセット日を取得
   */
  private getLastResetDate(): Date {
    const now = new Date();
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return firstOfMonth;
  }

  /**
   * 使用データをリセット（テスト用）
   */
  resetUsageData(): void {
    this.records = [];
    this.saveToStorage();
    console.log('Usage data has been reset');
  }
}