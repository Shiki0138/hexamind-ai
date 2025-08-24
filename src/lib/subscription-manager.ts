// サブスクリプション管理システム
// 各AIサービスのサブスクリプションを統合管理

import { BrowserAutomationService } from './browser-automation';
import { ClaudeIntegrationService } from './claude-integration';
import { PremiumSubscriptionService } from './premium-subscription-integration';

export interface SubscriptionConfig {
  claudePro: {
    enabled: boolean;
    email?: string;
    sessionCookie?: string;
    useBrowserAutomation: boolean;
  };
  chatGPTPlus: {
    enabled: boolean;
    email?: string;
    sessionCookie?: string;
    useBrowserAutomation: boolean;
  };
  geminiUltra: {
    enabled: boolean;
    email?: string;
    sessionCookie?: string;
    useBrowserAutomation: boolean;
  };
  apiKeys: {
    openai?: string;
    claude?: string;
    gemini?: string;
  };
}

export interface UsageTracker {
  service: 'claude' | 'chatgpt' | 'gemini';
  date: Date;
  messagesUsed: number;
  tokensUsed?: number;
}

export class SubscriptionManager {
  private browserService: BrowserAutomationService;
  private claudeService: ClaudeIntegrationService;
  private premiumService: PremiumSubscriptionService;
  private usage: UsageTracker[] = [];
  
  // サブスクリプション制限（推定値）
  private readonly LIMITS = {
    claudePro: {
      messagesPerMonth: 5000,
      messagesPerDay: 200,
      contextWindow: 200000
    },
    chatGPTPlus: {
      messagesPerMonth: 10000,
      messagesPerHour: 50,
      contextWindow: 128000
    },
    geminiUltra: {
      messagesPerMonth: 8000,
      messagesPerDay: 300,
      contextWindow: 1000000
    }
  };

  constructor(private config: SubscriptionConfig) {
    this.browserService = new BrowserAutomationService();
    this.claudeService = new ClaudeIntegrationService();
    this.premiumService = new PremiumSubscriptionService();
    this.loadUsageHistory();
  }

  // 使用履歴の読み込み
  private loadUsageHistory() {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('hexamind_usage_history');
      if (stored) {
        this.usage = JSON.parse(stored);
      }
    }
  }

  // 使用履歴の保存
  private saveUsageHistory() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('hexamind_usage_history', JSON.stringify(this.usage));
    }
  }

  // 利用可能なサービスを判定
  async getAvailableService(preferredService?: string): Promise<'claude' | 'chatgpt' | 'gemini' | null> {
    const services = ['claude', 'chatgpt', 'gemini'] as const;
    
    // 優先サービスがあればそれを先に確認
    if (preferredService && this.canUseService(preferredService as any)) {
      return preferredService as any;
    }

    // 利用可能なサービスを探す
    for (const service of services) {
      if (this.canUseService(service)) {
        return service;
      }
    }

    return null;
  }

  // サービスが利用可能か確認
  private canUseService(service: 'claude' | 'chatgpt' | 'gemini'): boolean {
    const today = new Date();
    const todayUsage = this.usage.filter(u => 
      u.service === service && 
      u.date.toDateString() === today.toDateString()
    );

    const dailyMessages = todayUsage.reduce((sum, u) => sum + u.messagesUsed, 0);

    switch (service) {
      case 'claude':
        return this.config.claudePro.enabled && 
               dailyMessages < this.LIMITS.claudePro.messagesPerDay;
      case 'chatgpt':
        return this.config.chatGPTPlus.enabled && 
               dailyMessages < (this.LIMITS.chatGPTPlus.messagesPerMonth / 30);
      case 'gemini':
        return this.config.geminiUltra.enabled && 
               dailyMessages < this.LIMITS.geminiUltra.messagesPerDay;
      default:
        return false;
    }
  }

  // 統合議論実行
  async executeDiscussion(params: {
    topic: string;
    agents: string[];
    thinkingMode: string;
    round: number;
  }): Promise<Record<string, string>> {
    const results: Record<string, string> = {};

    for (const agent of params.agents) {
      const service = await this.getAvailableService();
      
      if (!service) {
        // すべてのサービスが制限に達した場合はフォールバック
        results[agent] = await this.generateFallbackResponse(agent, params);
        continue;
      }

      try {
        let response: string;

        // サブスクリプション利用優先
        if (this.shouldUseBrowserAutomation(service)) {
          response = await this.executeViaBrowser(service, agent, params);
        } else {
          // API利用（サブスクリプションが使えない場合）
          response = await this.executeViaAPI(service, agent, params);
        }

        results[agent] = response;
        
        // 使用履歴を記録
        this.recordUsage(service, 1);
        
      } catch (error) {
        console.error(`Error with ${service}:`, error);
        results[agent] = await this.generateFallbackResponse(agent, params);
      }
    }

    return results;
  }

  // ブラウザ自動化を使うべきか判定
  private shouldUseBrowserAutomation(service: 'claude' | 'chatgpt' | 'gemini'): boolean {
    switch (service) {
      case 'claude':
        return this.config.claudePro.useBrowserAutomation && 
               !!this.config.claudePro.sessionCookie;
      case 'chatgpt':
        return this.config.chatGPTPlus.useBrowserAutomation && 
               !!this.config.chatGPTPlus.sessionCookie;
      case 'gemini':
        return this.config.geminiUltra.useBrowserAutomation && 
               !!this.config.geminiUltra.sessionCookie;
      default:
        return false;
    }
  }

  // ブラウザ経由で実行
  private async executeViaBrowser(
    service: 'claude' | 'chatgpt' | 'gemini',
    agent: string,
    params: any
  ): Promise<string> {
    const prompt = this.buildPrompt(agent, params);

    switch (service) {
      case 'claude':
        return await this.browserService.executeClaudeProSession({
          agent,
          topic: params.topic,
          prompt,
          sessionCookie: this.config.claudePro.sessionCookie
        });
      
      case 'chatgpt':
        return await this.browserService.executeChatGPTPlusSession({
          agent,
          topic: params.topic,
          prompt,
          sessionCookie: this.config.chatGPTPlus.sessionCookie
        });
      
      case 'gemini':
        return await this.browserService.executeGeminiUltraSession({
          agent,
          topic: params.topic,
          prompt,
          sessionCookie: this.config.geminiUltra.sessionCookie
        });
      
      default:
        throw new Error(`Unknown service: ${service}`);
    }
  }

  // API経由で実行
  private async executeViaAPI(
    service: 'claude' | 'chatgpt' | 'gemini',
    agent: string,
    params: any
  ): Promise<string> {
    const prompt = this.buildPrompt(agent, params);

    switch (service) {
      case 'claude':
        if (this.config.apiKeys.claude) {
          return await this.claudeService.generateResponse(
            agent, 
            params.topic, 
            params.thinkingMode, 
            params.round
          );
        }
        break;
      
      case 'chatgpt':
        if (this.config.apiKeys.openai) {
          // OpenAI API実装
          return `[ChatGPT API] ${agent}の応答`;
        }
        break;
      
      case 'gemini':
        if (this.config.apiKeys.gemini) {
          // Gemini API実装
          return `[Gemini API] ${agent}の応答`;
        }
        break;
    }

    return this.generateFallbackResponse(agent, params);
  }

  // プロンプト生成
  private buildPrompt(agent: string, params: any): string {
    return `あなたは${agent}として、「${params.topic}」について${params.thinkingMode}モードで議論してください。
    
これはラウンド${params.round + 1}の発言です。
他の参加者の意見も考慮しながら、あなたの専門的な視点から建設的な意見を述べてください。`;
  }

  // フォールバック応答生成
  private async generateFallbackResponse(agent: string, params: any): Promise<string> {
    return this.premiumService.generateFallbackMessage('general', { agent, ...params });
  }

  // 使用履歴記録
  private recordUsage(service: 'claude' | 'chatgpt' | 'gemini', messages: number) {
    this.usage.push({
      service,
      date: new Date(),
      messagesUsed: messages
    });
    this.saveUsageHistory();
  }

  // 使用統計取得
  getUsageStats() {
    const stats: Record<string, any> = {};
    const today = new Date();
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    for (const service of ['claude', 'chatgpt', 'gemini'] as const) {
      const todayUsage = this.usage.filter(u => 
        u.service === service && 
        u.date.toDateString() === today.toDateString()
      );
      
      const monthUsage = this.usage.filter(u => 
        u.service === service && 
        u.date >= thisMonth
      );

      stats[service] = {
        today: todayUsage.reduce((sum, u) => sum + u.messagesUsed, 0),
        month: monthUsage.reduce((sum, u) => sum + u.messagesUsed, 0),
        limits: this.LIMITS[service === 'claude' ? 'claudePro' : 
                service === 'chatgpt' ? 'chatGPTPlus' : 'geminiUltra']
      };
    }

    return stats;
  }
}