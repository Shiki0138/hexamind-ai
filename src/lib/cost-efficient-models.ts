// コスト効率的なAIモデル設定と料金計算システム

export interface ModelConfig {
  provider: 'openai' | 'anthropic' | 'google';
  model: string;
  displayName: string;
  inputCostPer1M: number;   // $per 1M tokens
  outputCostPer1M: number;  // $per 1M tokens
  contextWindow: number;
  quality: number;          // 1-10
  speed: number;            // 1-10
}

// コスト効率の良いモデル選定
export const COST_EFFICIENT_MODELS: ModelConfig[] = [
  {
    provider: 'google',
    model: 'gemini-1.5-pro',
    displayName: 'Gemini 1.5 Pro',
    inputCostPer1M: 3.5,
    outputCostPer1M: 10.5,
    contextWindow: 1000000,
    quality: 8,
    speed: 9
  },
  {
    provider: 'anthropic',
    model: 'claude-3-5-sonnet-20241022',
    displayName: 'Claude 3.5 Sonnet',
    inputCostPer1M: 3,
    outputCostPer1M: 15,
    contextWindow: 200000,
    quality: 9,
    speed: 8
  },
  {
    provider: 'openai',
    model: 'gpt-4-turbo-preview',
    displayName: 'GPT-4 Turbo',
    inputCostPer1M: 10,
    outputCostPer1M: 30,
    contextWindow: 128000,
    quality: 8.5,
    speed: 8
  },
  {
    provider: 'anthropic',
    model: 'claude-3-haiku-20240307',
    displayName: 'Claude 3 Haiku',
    inputCostPer1M: 0.25,
    outputCostPer1M: 1.25,
    contextWindow: 200000,
    quality: 7,
    speed: 10
  },
  {
    provider: 'openai',
    model: 'gpt-3.5-turbo',
    displayName: 'GPT-3.5 Turbo',
    inputCostPer1M: 0.5,
    outputCostPer1M: 1.5,
    contextWindow: 16000,
    quality: 6.5,
    speed: 10
  }
];

// 議論あたりのコスト計算
export interface DiscussionCostEstimate {
  model: ModelConfig;
  estimatedInputTokens: number;
  estimatedOutputTokens: number;
  estimatedCost: number;
  rounds: number;
  agents: number;
}

export function calculateDiscussionCost(
  model: ModelConfig,
  agents: number = 6,
  rounds: number = 3,
  avgInputTokensPerTurn: number = 500,
  avgOutputTokensPerTurn: number = 300
): DiscussionCostEstimate {
  const totalTurns = agents * rounds;
  const estimatedInputTokens = totalTurns * avgInputTokensPerTurn;
  const estimatedOutputTokens = totalTurns * avgOutputTokensPerTurn;
  
  const inputCost = (estimatedInputTokens / 1000000) * model.inputCostPer1M;
  const outputCost = (estimatedOutputTokens / 1000000) * model.outputCostPer1M;
  const estimatedCost = inputCost + outputCost;

  return {
    model,
    estimatedInputTokens,
    estimatedOutputTokens,
    estimatedCost,
    rounds,
    agents
  };
}

// サブスクリプションプラン設計
export interface SubscriptionPlan {
  id: string;
  name: string;
  displayName: string;
  monthlyPrice: number;     // 月額料金（円）
  monthlyDiscussions: number;  // 月間議論回数
  features: string[];
  recommendedModels: string[];
  maxAgents: number;
  maxRounds: number;
  priority: 'low' | 'medium' | 'high';
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free',
    displayName: '無料プラン',
    monthlyPrice: 0,
    monthlyDiscussions: 5,
    features: [
      '月5回まで議論可能',
      '3エージェントまで',
      '基本的なAIモデル',
      'シミュレーション議論'
    ],
    recommendedModels: ['gpt-3.5-turbo', 'claude-3-haiku-20240307'],
    maxAgents: 3,
    maxRounds: 2,
    priority: 'low'
  },
  {
    id: 'starter',
    name: 'Starter',
    displayName: 'スタータープラン',
    monthlyPrice: 2980,
    monthlyDiscussions: 50,
    features: [
      '月50回まで議論可能',
      '6エージェントまで',
      '高品質AIモデル',
      '議論履歴エクスポート',
      'メール通知'
    ],
    recommendedModels: ['gemini-1.5-pro', 'claude-3-5-sonnet-20241022'],
    maxAgents: 6,
    maxRounds: 3,
    priority: 'medium'
  },
  {
    id: 'professional',
    name: 'Professional',
    displayName: 'プロフェッショナル',
    monthlyPrice: 9800,
    monthlyDiscussions: 200,
    features: [
      '月200回まで議論可能',
      '全エージェント利用可能',
      '最高品質AIモデル',
      'API統合',
      '優先サポート',
      'カスタムエージェント作成'
    ],
    recommendedModels: ['claude-3-5-sonnet-20241022', 'gpt-4-turbo-preview', 'gemini-1.5-pro'],
    maxAgents: 10,
    maxRounds: 5,
    priority: 'high'
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    displayName: 'エンタープライズ',
    monthlyPrice: 49800,
    monthlyDiscussions: -1, // 無制限
    features: [
      '無制限の議論',
      '専用インスタンス',
      'SLA保証',
      'カスタムモデル選択',
      '専任サポート',
      'オンプレミス対応'
    ],
    recommendedModels: ['all'],
    maxAgents: -1,
    maxRounds: -1,
    priority: 'high'
  }
];

// コスト最適化戦略
export class CostOptimizationStrategy {
  // エージェントごとに適切なモデルを選択
  static selectModelForAgent(
    agent: string,
    plan: SubscriptionPlan,
    currentUsage: number
  ): ModelConfig {
    // プランの推奨モデルから選択
    const recommendedModels = COST_EFFICIENT_MODELS.filter(m => 
      plan.recommendedModels.includes(m.model) || 
      plan.recommendedModels.includes('all')
    );

    // エージェントの特性に応じてモデルを選択
    switch (agent) {
      case 'ceo':
      case 'devil':
        // 重要な役割は高品質モデル
        return recommendedModels.sort((a, b) => b.quality - a.quality)[0];
      
      case 'cfo':
      case 'cto':
        // 技術的な精度が必要
        return recommendedModels.find(m => m.quality >= 8) || recommendedModels[0];
      
      default:
        // その他は速度重視
        return recommendedModels.sort((a, b) => b.speed - a.speed)[0];
    }
  }

  // ラウンドごとにモデルを調整
  static adjustModelByRound(
    baseModel: ModelConfig,
    round: number,
    totalRounds: number
  ): ModelConfig {
    // 最終ラウンドは高品質モデルを使用
    if (round === totalRounds - 1) {
      const higherQualityModel = COST_EFFICIENT_MODELS
        .filter(m => m.provider === baseModel.provider && m.quality > baseModel.quality)
        .sort((a, b) => a.outputCostPer1M - b.outputCostPer1M)[0];
      
      return higherQualityModel || baseModel;
    }
    
    return baseModel;
  }
}

// 利用統計とコスト追跡
export interface UsageStatistics {
  userId: string;
  planId: string;
  currentMonth: {
    discussions: number;
    totalCost: number;
    tokenUsage: {
      input: number;
      output: number;
    };
    modelBreakdown: Record<string, {
      count: number;
      cost: number;
    }>;
  };
}

// ROI計算
export function calculateROI(
  monthlyPrice: number,
  discussionsPerMonth: number,
  avgTimePerDiscussion: number,  // 分
  executiveHourlyRate: number = 10000  // 円/時
): {
  costPerDiscussion: number;
  timeSaved: number;
  moneySaved: number;
  roi: number;
} {
  const costPerDiscussion = monthlyPrice / discussionsPerMonth;
  const timeSaved = avgTimePerDiscussion * discussionsPerMonth / 60; // 時間
  const moneySaved = timeSaved * executiveHourlyRate;
  const roi = ((moneySaved - monthlyPrice) / monthlyPrice) * 100;

  return {
    costPerDiscussion,
    timeSaved,
    moneySaved,
    roi
  };
}