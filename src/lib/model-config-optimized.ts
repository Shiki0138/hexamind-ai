/**
 * 最適化されたAIモデル設定
 * コストパフォーマンスを重視した新設定
 */

export interface ModelConfig {
  name: string;
  displayName: string;
  maxTokens: number;
  costPer1kTokens: number;
  quality: 'basic' | 'standard' | 'advanced' | 'premium';
  provider: 'openai' | 'anthropic' | 'google';
}

export const OPTIMIZED_AI_MODELS: Record<string, ModelConfig> = {
  // Geminiシリーズ（コスト最優先）
  'gemini-1.5-flash-8b': {
    name: 'gemini-1.5-flash-8b',
    displayName: 'Gemini 1.5 Flash 8B',
    maxTokens: 1_000_000,
    costPer1kTokens: 0.000075, // 入力コスト
    quality: 'standard',
    provider: 'google'
  },
  'gemini-2.0-flash': {
    name: 'gemini-2.0-flash',
    displayName: 'Gemini 2.0 Flash',
    maxTokens: 1_000_000,
    costPer1kTokens: 0.000075,
    quality: 'advanced',
    provider: 'google'
  },
  'gemini-1.5-pro': {
    name: 'gemini-1.5-pro',
    displayName: 'Gemini 1.5 Pro',
    maxTokens: 2_000_000,
    costPer1kTokens: 0.00125,
    quality: 'premium',
    provider: 'google'
  },
  
  // OpenAI（バランス型）
  'gpt-4o-mini': {
    name: 'gpt-4o-mini',
    displayName: 'GPT-4o Mini',
    maxTokens: 128_000,
    costPer1kTokens: 0.00015,
    quality: 'advanced',
    provider: 'openai'
  },
  
  // Claude（品質重視時のみ）
  'claude-3.5-sonnet': {
    name: 'claude-3.5-sonnet',
    displayName: 'Claude 3.5 Sonnet',
    maxTokens: 200_000,
    costPer1kTokens: 0.003,
    quality: 'premium',
    provider: 'anthropic'
  }
};

/**
 * 最適化されたモデル選択ロジック
 */
export function selectOptimalModelV2(
  topic: string,
  thinkingMode: string,
  isPremium: boolean = false,
  costPriority: 'lowest' | 'balanced' | 'quality' = 'balanced'
): string {
  // 環境変数で指定されたモデルを優先
  const envModel = process.env.NEXT_PUBLIC_AI_MODEL;
  if (envModel && OPTIMIZED_AI_MODELS[envModel]) {
    return envModel;
  }

  // コスト最優先モード
  if (costPriority === 'lowest') {
    return 'gemini-1.5-flash-8b';
  }

  // プレミアムまたは品質優先モード
  if (isPremium || costPriority === 'quality') {
    return 'claude-3.5-sonnet';
  }

  // トピックの複雑さを判定
  const complexKeywords = [
    '戦略', 'M&A', '投資', '億', 'million', 'billion',
    'IPO', 'グローバル', '長期', '複雑', '革新'
  ];
  
  const isComplex = complexKeywords.some(keyword => topic.includes(keyword));
  
  // バランスモード
  if (thinkingMode === 'deepthink' || thinkingMode === 'critical') {
    if (isComplex) {
      return 'gemini-1.5-pro'; // 複雑な議論でも低コスト
    }
    return 'gemini-2.0-flash'; // 通常の深い議論
  }

  // デフォルトはGemini 2.0 Flash（コストと品質のバランス）
  return 'gemini-2.0-flash';
}

/**
 * ハイブリッドモデル戦略
 * 初期テストと本番で異なるモデルを使用
 */
export interface HybridModelStrategy {
  testModel: string;
  productionModel: string;
  threshold: number; // テストから本番に切り替える重要度しきい値（1-10）
}

export function getHybridStrategy(importance: number): HybridModelStrategy {
  if (importance >= 8) {
    // 重要な議論
    return {
      testModel: 'gemini-2.0-flash',
      productionModel: 'claude-3.5-sonnet',
      threshold: 8
    };
  } else if (importance >= 5) {
    // 中程度の重要性
    return {
      testModel: 'gemini-1.5-flash-8b',
      productionModel: 'gpt-4o-mini',
      threshold: 5
    };
  } else {
    // 通常の議論
    return {
      testModel: 'gemini-1.5-flash-8b',
      productionModel: 'gemini-2.0-flash',
      threshold: 3
    };
  }
}

/**
 * コスト追跡とアラート
 */
export class CostTracker {
  private monthlyBudget: number;
  private currentSpend: number = 0;
  
  constructor(monthlyBudgetInYen: number = 10000) {
    this.monthlyBudget = monthlyBudgetInYen;
  }
  
  addUsage(model: string, inputTokens: number, outputTokens: number): void {
    const modelConfig = OPTIMIZED_AI_MODELS[model];
    if (!modelConfig) return;
    
    // 簡易計算（実際はプロバイダー別の出力コストも考慮必要）
    const cost = (inputTokens + outputTokens) * modelConfig.costPer1kTokens / 1000;
    const costInYen = cost * 150; // 1USD = 150円
    
    this.currentSpend += costInYen;
    
    // 予算の80%を超えたらアラート
    if (this.currentSpend > this.monthlyBudget * 0.8) {
      console.warn(`⚠️ 月間予算の${Math.round(this.currentSpend / this.monthlyBudget * 100)}%を使用しています`);
    }
  }
  
  getRemainingBudget(): number {
    return Math.max(0, this.monthlyBudget - this.currentSpend);
  }
  
  shouldSwitchToLowerCostModel(): boolean {
    return this.currentSpend > this.monthlyBudget * 0.9;
  }
}