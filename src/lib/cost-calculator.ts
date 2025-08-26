/**
 * AIディスカッションのコスト計算機能
 */

import { AI_MODELS } from './model-config';

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface CostBreakdown {
  model: string;
  totalMessages: number;
  estimatedTokens: {
    input: number;
    output: number;
    total: number;
  };
  estimatedCost: {
    usd: number;
    jpy: number;
  };
  costPerMessage: {
    usd: number;
    jpy: number;
  };
}

// 為替レート（1ドル = 150円として計算）
const USD_TO_JPY_RATE = 150;

// 最新のOpenAI料金（2025年8月）
const OPENAI_PRICING = {
  'gpt-4o': {
    input: 0.0025,   // $0.0025 per 1K tokens
    output: 0.01     // $0.01 per 1K tokens
  },
  'gpt-4o-mini': {
    input: 0.00015,  // $0.00015 per 1K tokens
    output: 0.0006   // $0.0006 per 1K tokens
  },
  'gpt-4-turbo-preview': {
    input: 0.01,     // $0.01 per 1K tokens
    output: 0.03     // $0.03 per 1K tokens
  },
  'gpt-4': {
    input: 0.03,     // $0.03 per 1K tokens
    output: 0.06     // $0.06 per 1K tokens
  },
  'gpt-3.5-turbo': {
    input: 0.0005,   // $0.0005 per 1K tokens
    output: 0.0015   // $0.0015 per 1K tokens
  }
};

// Gemini料金（2025年8月）
const GEMINI_PRICING = {
  'gemini-2.0-flash': {
    input: 0.00001875,  // $0.01875 per 1M characters
    output: 0.000075    // $0.075 per 1M characters
  },
  'gemini-1.5-flash-8b': {
    input: 0.00001875,
    output: 0.000075
  },
  'gemini-1.5-pro': {
    input: 0.00125,
    output: 0.005
  }
};

/**
 * トークン数の推定（日本語の場合、文字数×1.5程度）
 */
export function estimateTokens(text: string): number {
  // 日本語は平均して1文字≈1.5トークン
  // 英語は平均して4文字≈1トークン
  const japaneseCharCount = (text.match(/[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf\u3400-\u4dbf]/g) || []).length;
  const englishCharCount = (text.match(/[a-zA-Z]/g) || []).length;
  const otherCharCount = text.length - japaneseCharCount - englishCharCount;
  
  return Math.ceil(japaneseCharCount * 1.5 + englishCharCount * 0.25 + otherCharCount * 0.5);
}

/**
 * 1回のディスカッションの推定コストを計算
 */
export function calculateDiscussionCost(
  model: string,
  agentCount: number,
  thinkingMode: string
): CostBreakdown {
  // 基本的なメッセージ数の計算
  let messagesPerAgent = 2; // 各エージェント2回発言（初回 + 追加）
  if (thinkingMode === 'deepthink') {
    messagesPerAgent = 3; // 深い思考モードでは3回
  }
  
  const totalMessages = agentCount * messagesPerAgent + 1; // +1は最終総括
  
  // トークン推定（メッセージあたり）
  const avgInputTokensPerMessage = 3000;  // システムプロンプト + 履歴
  const avgOutputTokensPerMessage = 800;   // 300-500文字の応答 ≈ 500-800トークン
  
  // 累積的な入力トークン（会話履歴が増える）
  let totalInputTokens = 0;
  let totalOutputTokens = 0;
  
  for (let i = 0; i < totalMessages; i++) {
    // 入力は累積的に増加
    const historyTokens = i * avgOutputTokensPerMessage * 0.7; // 履歴の70%を次の入力に含める
    totalInputTokens += avgInputTokensPerMessage + historyTokens;
    totalOutputTokens += avgOutputTokensPerMessage;
  }
  
  // コスト計算
  let costUSD = 0;
  
  if (model.startsWith('gpt-')) {
    const pricing = OPENAI_PRICING[model as keyof typeof OPENAI_PRICING];
    if (pricing) {
      costUSD = (totalInputTokens / 1000) * pricing.input + 
                (totalOutputTokens / 1000) * pricing.output;
    }
  } else if (model.startsWith('gemini-')) {
    const pricing = GEMINI_PRICING[model as keyof typeof GEMINI_PRICING];
    if (pricing) {
      costUSD = (totalInputTokens / 1000) * pricing.input + 
                (totalOutputTokens / 1000) * pricing.output;
    }
  }
  
  return {
    model,
    totalMessages,
    estimatedTokens: {
      input: totalInputTokens,
      output: totalOutputTokens,
      total: totalInputTokens + totalOutputTokens
    },
    estimatedCost: {
      usd: costUSD,
      jpy: costUSD * USD_TO_JPY_RATE
    },
    costPerMessage: {
      usd: costUSD / totalMessages,
      jpy: (costUSD * USD_TO_JPY_RATE) / totalMessages
    }
  };
}

/**
 * コスト上限に基づいてメッセージ数を制限
 */
export function calculateMaxMessagesForBudget(
  model: string,
  budgetJPY: number,
  agentCount: number
): number {
  const budgetUSD = budgetJPY / USD_TO_JPY_RATE;
  
  // 1メッセージあたりの推定コスト
  const avgInputTokens = 3500;  // 平均的な入力トークン数
  const avgOutputTokens = 800;   // 平均的な出力トークン数
  
  let costPerMessage = 0;
  
  if (model.startsWith('gpt-')) {
    const pricing = OPENAI_PRICING[model as keyof typeof OPENAI_PRICING];
    if (pricing) {
      costPerMessage = (avgInputTokens / 1000) * pricing.input + 
                      (avgOutputTokens / 1000) * pricing.output;
    }
  } else if (model.startsWith('gemini-')) {
    const pricing = GEMINI_PRICING[model as keyof typeof GEMINI_PRICING];
    if (pricing) {
      costPerMessage = (avgInputTokens / 1000) * pricing.input + 
                      (avgOutputTokens / 1000) * pricing.output;
    }
  }
  
  if (costPerMessage === 0) return 20; // デフォルト値
  
  const maxMessages = Math.floor(budgetUSD / costPerMessage);
  
  // 最小でも各エージェント1回は発言できるように
  return Math.max(agentCount + 1, Math.min(maxMessages, 20));
}

/**
 * 推奨モデルを予算に基づいて選択
 */
export function recommendModelForBudget(budgetJPY: number, quality: 'low' | 'medium' | 'high'): string {
  if (budgetJPY < 10) {
    return 'gemini-2.0-flash'; // 最安値
  } else if (budgetJPY < 50) {
    return quality === 'high' ? 'gpt-4o-mini' : 'gemini-2.0-flash';
  } else if (budgetJPY < 200) {
    return quality === 'high' ? 'gpt-4o' : 'gpt-4o-mini';
  } else {
    return 'gpt-4o'; // 高品質
  }
}

/**
 * 月次使用量に基づくコスト予測
 */
export function estimateMonthlyCost(
  dailyDiscussions: number,
  model: string,
  agentCount: number = 6
): {
  daily: { usd: number; jpy: number };
  weekly: { usd: number; jpy: number };
  monthly: { usd: number; jpy: number };
} {
  const costBreakdown = calculateDiscussionCost(model, agentCount, 'normal');
  const dailyCostUSD = costBreakdown.estimatedCost.usd * dailyDiscussions;
  
  return {
    daily: {
      usd: dailyCostUSD,
      jpy: dailyCostUSD * USD_TO_JPY_RATE
    },
    weekly: {
      usd: dailyCostUSD * 7,
      jpy: dailyCostUSD * 7 * USD_TO_JPY_RATE
    },
    monthly: {
      usd: dailyCostUSD * 30,
      jpy: dailyCostUSD * 30 * USD_TO_JPY_RATE
    }
  };
}