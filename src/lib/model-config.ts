/**
 * AIモデル設定
 * 環境変数でモデルを切り替え可能にする
 */

export interface ModelConfig {
  name: string;
  displayName: string;
  maxTokens: number;
  costPer1kTokens: number;
  quality: 'basic' | 'standard' | 'advanced' | 'premium';
}

export const AI_MODELS: Record<string, ModelConfig> = {
  // Google Geminiモデル（コスト重視）
  'gemini-1.5-flash-8b': {
    name: 'gemini-1.5-flash-8b',
    displayName: 'Gemini 1.5 Flash 8B',
    maxTokens: 1000000,
    costPer1kTokens: 0.000075,
    quality: 'standard'
  },
  'gemini-2.0-flash': {
    name: 'gemini-2.0-flash',
    displayName: 'Gemini 2.0 Flash', 
    maxTokens: 1000000,
    costPer1kTokens: 0.000075,
    quality: 'advanced'
  },
  'gemini-1.5-pro': {
    name: 'gemini-1.5-pro',
    displayName: 'Gemini 1.5 Pro',
    maxTokens: 2000000,
    costPer1kTokens: 0.00125,
    quality: 'premium'
  },
  // OpenAIモデル
  'gpt-4o-mini': {
    name: 'gpt-4o-mini',
    displayName: 'GPT-4o Mini',
    maxTokens: 128000,
    costPer1kTokens: 0.002, // 目安: 低コスト帯
    quality: 'advanced'
  },
  'gpt-3.5-turbo': {
    name: 'gpt-3.5-turbo',
    displayName: 'GPT-3.5 Turbo',
    maxTokens: 4096,
    costPer1kTokens: 0.002,
    quality: 'standard'
  },
  'gpt-4': {
    name: 'gpt-4',
    displayName: 'GPT-4',
    maxTokens: 8192,
    costPer1kTokens: 0.03,
    quality: 'advanced'
  },
  'gpt-4-turbo': {
    name: 'gpt-4-turbo-preview',
    displayName: 'GPT-4 Turbo',
    maxTokens: 128000,
    costPer1kTokens: 0.01,
    quality: 'advanced'
  },
  'gpt-4o': {
    name: 'gpt-4o',
    displayName: 'GPT-4o',
    maxTokens: 128000,
    costPer1kTokens: 0.005,
    quality: 'premium'
  }
};

/**
 * 環境変数または議論の複雑さに基づいてモデルを選択
 */
export function selectOptimalModel(
  topic: string,
  thinkingMode: string,
  isPremium: boolean = false
): string {
  // 環境変数で指定されたモデルを優先
  const envModel = process.env.NEXT_PUBLIC_AI_MODEL;
  if (envModel && AI_MODELS[envModel]) {
    return envModel;
  }

  // プレミアムモードならGPT-4o
  if (isPremium) {
    return 'gpt-4o';
  }

  // トピックの複雑さを判定
  const complexKeywords = [
    '戦略', 'M&A', '投資', '億', 'million', 'billion',
    'IPO', 'グローバル', '長期', '複雑', '革新'
  ];
  
  const isComplex = complexKeywords.some(keyword => topic.includes(keyword));
  
  // 思考モードによる判定
  if (thinkingMode === 'deepthink' || thinkingMode === 'critical') {
    return isComplex ? 'gpt-4-turbo' : 'gpt-4';
  }

  // デフォルトはGPT-4o-mini（Geminiは無料プランのレート制限が厳しいため）
  return 'gpt-4o-mini';  // OpenAIを使う場合（安定性重視）
  // return 'gemini-2.0-flash';  // Google Geminiを使う場合（コスト重視、但し1分15リクエスト制限あり）
}

/**
 * モデルに応じたmax_tokensを取得
 */
export function getMaxTokensForModel(model: string, useCase: 'initial' | 'discussion' | 'summary'): number {
  const modelConfig = AI_MODELS[model] || AI_MODELS['gpt-4o-mini'];
  
  switch (useCase) {
    case 'initial':
      return Math.min(2500, modelConfig.maxTokens);
    case 'discussion':
      return Math.min(2000, modelConfig.maxTokens);
    case 'summary':
      return Math.min(1500, modelConfig.maxTokens);
    default:
      return 1500;
  }
}
