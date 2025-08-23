// 複数のAIプロバイダーを統合した AI ディスカッションエンジン

import OpenAI from 'openai';
import { ThinkingMode, Agent } from './ai-agents';

export interface AIProvider {
  name: string;
  type: 'openai' | 'claude' | 'gemini' | 'local';
  tier: 'free' | 'subscription' | 'api';
  dailyLimit?: number;
  costPerToken?: number;
  available: boolean;
}

export const AI_PROVIDERS: AIProvider[] = [
  {
    name: 'OpenAI GPT-4o-mini',
    type: 'openai',
    tier: 'api',
    costPerToken: 0.00015, // per 1K tokens
    available: true
  },
  {
    name: 'OpenAI ChatGPT Plus',
    type: 'openai', 
    tier: 'subscription',
    dailyLimit: 40, // messages per 3 hours
    available: false // 要実装
  },
  {
    name: 'Claude (Anthropic API)',
    type: 'claude',
    tier: 'api',
    costPerToken: 0.00025,
    available: false // 要実装
  },
  {
    name: 'Claude Pro Subscription',
    type: 'claude',
    tier: 'subscription',
    dailyLimit: 100, // 推定
    available: false // 要実装
  },
  {
    name: 'Google Gemini Pro',
    type: 'gemini',
    tier: 'free',
    dailyLimit: 60, // requests per minute
    available: false // 要実装
  }
];

// 無料枠とサブスクリプション活用のための統合クラス
export class MultiProviderAIEngine {
  private providers: Map<string, any> = new Map();
  private usageTracker: Map<string, { count: number; resetTime: Date }> = new Map();
  
  constructor() {
    this.initializeProviders();
  }

  private initializeProviders() {
    // OpenAI API (サーバーサイドのみ)
    // クライアントサイドでのAPIキー使用は危険なため、APIルート経由で実行
    this.providers.set('openai-api', 'server-only');

    // Claude API (高品質だが有料)
    if (process.env.CLAUDE_API_KEY) {
      // Claude APIクライアントを初期化
      // この部分は後で実装
    }

    // その他のプロバイダー...
  }

  // 最適なプロバイダーを選択
  private selectBestProvider(priority: 'cost' | 'quality' | 'speed' = 'cost'): string {
    const available = Array.from(this.providers.keys()).filter(key => {
      const usage = this.usageTracker.get(key);
      if (!usage) return true;
      
      // 日次制限チェック
      const now = new Date();
      if (now > usage.resetTime) {
        this.usageTracker.set(key, { count: 0, resetTime: new Date(now.getTime() + 24*60*60*1000) });
        return true;
      }
      
      return usage.count < this.getDailyLimit(key);
    });

    if (available.length === 0) {
      throw new Error('利用可能なAIプロバイダーがありません。明日再度お試しください。');
    }

    // 優先順位に基づいて選択
    switch (priority) {
      case 'cost':
        return available.includes('gemini-free') ? 'gemini-free' : available[0];
      case 'quality': 
        return available.includes('claude-api') ? 'claude-api' : available[0];
      case 'speed':
        return available.includes('openai-api') ? 'openai-api' : available[0];
      default:
        return available[0];
    }
  }

  private getDailyLimit(provider: string): number {
    const limits: Record<string, number> = {
      'gemini-free': 60,
      'claude-pro': 100,
      'openai-plus': 40,
      'openai-api': 10000 // APIは実質無制限（コスト制限）
    };
    return limits[provider] || 1000;
  }

  // 使用量を追跡
  private trackUsage(provider: string) {
    const current = this.usageTracker.get(provider) || { count: 0, resetTime: new Date() };
    current.count++;
    this.usageTracker.set(provider, current);
  }

  async generateResponse(
    agent: Agent, 
    messages: any[], 
    thinkingMode: ThinkingMode,
    priority: 'cost' | 'quality' | 'speed' = 'cost'
  ): Promise<string> {
    const provider = this.selectBestProvider(priority);
    this.trackUsage(provider);

    try {
      switch (provider) {
        case 'openai-api':
          return await this.generateWithOpenAI(messages, thinkingMode);
        case 'claude-api':
          return await this.generateWithClaude(messages, thinkingMode);
        case 'gemini-free':
          return await this.generateWithGemini(messages, thinkingMode);
        default:
          throw new Error(`未対応のプロバイダー: ${provider}`);
      }
    } catch (error) {
      console.warn(`Provider ${provider} failed, trying fallback...`);
      // フォールバック: 他のプロバイダーを試す
      const fallback = Array.from(this.providers.keys()).find(key => key !== provider);
      if (fallback) {
        return await this.generateResponse(agent, messages, thinkingMode, 'speed');
      }
      throw error;
    }
  }

  private async generateWithOpenAI(messages: any[], thinkingMode: ThinkingMode): Promise<string> {
    const client = this.providers.get('openai-api');
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini', // コスト効率重視
      messages,
      max_tokens: 200,
      temperature: thinkingMode === 'creative' ? 0.9 : thinkingMode === 'critical' ? 0.7 : 0.8
    });
    return response.choices[0]?.message?.content || '';
  }

  private async generateWithClaude(messages: any[], thinkingMode: ThinkingMode): Promise<string> {
    // Claude API実装（後で追加）
    throw new Error('Claude API未実装');
  }

  private async generateWithGemini(messages: any[], thinkingMode: ThinkingMode): Promise<string> {
    // Google Gemini API実装（後で追加）
    throw new Error('Gemini API未実装');
  }

  // プロバイダーの状況を確認
  getProviderStatus(): { provider: string; available: boolean; remaining: number }[] {
    return Array.from(this.providers.keys()).map(provider => {
      const usage = this.usageTracker.get(provider);
      const limit = this.getDailyLimit(provider);
      const remaining = usage ? Math.max(0, limit - usage.count) : limit;
      
      return {
        provider,
        available: remaining > 0,
        remaining
      };
    });
  }

  // コスト見積もり
  estimateCost(messageCount: number, provider?: string): number {
    const selectedProvider = provider || this.selectBestProvider('cost');
    const tokensPerMessage = 150; // 推定
    const totalTokens = messageCount * tokensPerMessage;
    
    const costs: Record<string, number> = {
      'openai-api': 0.00015 * totalTokens / 1000,
      'claude-api': 0.00025 * totalTokens / 1000,
      'gemini-free': 0, // 無料
      'claude-pro': 0, // サブスク
      'openai-plus': 0  // サブスク
    };
    
    return costs[selectedProvider] || 0;
  }
}