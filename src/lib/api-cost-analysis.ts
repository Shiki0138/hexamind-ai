/**
 * APIコスト分析と最適化
 * OpenAI vs Claude APIの比較検証
 */

// 2024年12月時点の料金（USD per 1M tokens）
export const API_PRICING = {
  google: {
    'gemini-1.5-flash': {
      input: 0.075,   // $0.000075/1K
      output: 0.30,   // $0.0003/1K
      speed: 'very_fast',
      quality: 'good',
      context: 1_000_000
    },
    'gemini-1.5-flash-8b': {
      input: 0.0375,  // $0.0000375/1K
      output: 0.15,   // $0.00015/1K
      speed: 'extremely_fast',
      quality: 'good',
      context: 1_000_000
    },
    'gemini-1.5-pro': {
      input: 1.25,    // $0.00125/1K (128K以下)
      output: 5.00,   // $0.005/1K (128K以下)
      speed: 'fast',
      quality: 'excellent',
      context: 2_000_000
    },
    'gemini-2.0-flash': {
      input: 0.075,   // $0.000075/1K
      output: 0.30,   // $0.0003/1K
      speed: 'very_fast',
      quality: 'very_good',
      context: 1_000_000,
      note: '最新モデル、マルチモーダル対応'
    }
  },
  openai: {
    'gpt-3.5-turbo': {
      input: 0.50,   // $0.0005/1K
      output: 1.50,  // $0.0015/1K
      speed: 'very_fast',
      quality: 'good',
      context: 16_385
    },
    'gpt-4o-mini': {
      input: 0.15,   // $0.00015/1K
      output: 0.60,  // $0.0006/1K
      speed: 'very_fast',
      quality: 'very_good',
      context: 128_000
    },
    'gpt-4o': {
      input: 2.50,   // $0.0025/1K
      output: 10.00, // $0.01/1K
      speed: 'fast',
      quality: 'excellent',
      context: 128_000
    },
    'gpt-4-turbo': {
      input: 10.00,  // $0.01/1K
      output: 30.00, // $0.03/1K
      speed: 'medium',
      quality: 'excellent',
      context: 128_000
    },
    'gpt-4': {
      input: 30.00,  // $0.03/1K
      output: 60.00, // $0.06/1K
      speed: 'slow',
      quality: 'excellent',
      context: 8_192
    }
  },
  anthropic: {
    'claude-3-haiku': {
      input: 0.25,   // $0.00025/1K
      output: 1.25,  // $0.00125/1K
      speed: 'very_fast',
      quality: 'good',
      context: 200_000
    },
    'claude-3-sonnet': {
      input: 3.00,   // $0.003/1K
      output: 15.00, // $0.015/1K
      speed: 'fast',
      quality: 'very_good',
      context: 200_000
    },
    'claude-3-opus': {
      input: 15.00,  // $0.015/1K
      output: 75.00, // $0.075/1K
      speed: 'medium',
      quality: 'excellent',
      context: 200_000
    },
    'claude-3.5-sonnet': {
      input: 3.00,   // $0.003/1K
      output: 15.00, // $0.015/1K
      speed: 'fast',
      quality: 'excellent',
      context: 200_000
    }
  }
};

/**
 * ディスカッション1回あたりのトークン使用量見積もり
 */
export interface DiscussionTokenEstimate {
  agents: number;
  rounds: number;
  initialTokensPerAgent: number;
  discussionTokensPerRound: number;
  summaryTokens: number;
  totalInputTokens: number;
  totalOutputTokens: number;
}

export function estimateDiscussionTokens(
  agents: number = 6,
  rounds: number = 5
): DiscussionTokenEstimate {
  // 初期分析フェーズ
  const initialTokensPerAgent = 2500;
  const initialInputTokens = agents * 1000; // プロンプト
  const initialOutputTokens = agents * initialTokensPerAgent;
  
  // 相互議論フェーズ
  const discussionTokensPerRound = 2000;
  const discussionInputTokens = rounds * agents * 1500; // 履歴含む
  const discussionOutputTokens = rounds * agents * discussionTokensPerRound;
  
  // 総括フェーズ
  const summaryInputTokens = 2000;
  const summaryOutputTokens = 1500;
  
  return {
    agents,
    rounds,
    initialTokensPerAgent,
    discussionTokensPerRound,
    summaryTokens: summaryOutputTokens,
    totalInputTokens: initialInputTokens + discussionInputTokens + summaryInputTokens,
    totalOutputTokens: initialOutputTokens + discussionOutputTokens + summaryOutputTokens
  };
}

/**
 * コスト計算
 */
export function calculateCost(
  model: string,
  provider: 'openai' | 'anthropic' | 'google',
  estimate: DiscussionTokenEstimate
): {
  inputCost: number;
  outputCost: number;
  totalCost: number;
  costInYen: number; // 1USD = 150円で計算
} {
  const pricing = API_PRICING[provider][model];
  if (!pricing) {
    throw new Error(`Model ${model} not found for provider ${provider}`);
  }
  
  const inputCost = (estimate.totalInputTokens / 1_000_000) * pricing.input;
  const outputCost = (estimate.totalOutputTokens / 1_000_000) * pricing.output;
  const totalCost = inputCost + outputCost;
  const costInYen = totalCost * 150;
  
  return {
    inputCost,
    outputCost,
    totalCost,
    costInYen
  };
}

/**
 * 推奨モデル選択ロジック
 */
export interface ModelRecommendation {
  model: string;
  provider: 'openai' | 'anthropic' | 'google';
  reason: string;
  estimatedCost: number;
  quality: string;
  speed: string;
}

export function recommendModel(
  priority: 'cost' | 'quality' | 'balanced',
  complexityLevel: 'low' | 'medium' | 'high'
): ModelRecommendation[] {
  const estimate = estimateDiscussionTokens();
  const recommendations: ModelRecommendation[] = [];
  
  if (priority === 'cost') {
    // コスト優先
    recommendations.push({
      model: 'gemini-1.5-flash-8b',
      provider: 'google',
      reason: '圧倒的に低コスト。超高速で基本的な議論に最適。',
      estimatedCost: calculateCost('gemini-1.5-flash-8b', 'google', estimate).costInYen,
      quality: 'good',
      speed: 'extremely_fast'
    });
    
    recommendations.push({
      model: 'gemini-1.5-flash',
      provider: 'google',
      reason: 'OpenAI/Claudeより大幅に安価。100万トークンの長文処理可能。',
      estimatedCost: calculateCost('gemini-1.5-flash', 'google', estimate).costInYen,
      quality: 'good',
      speed: 'very_fast'
    });
    
    recommendations.push({
      model: 'gpt-4o-mini',
      provider: 'openai',
      reason: 'OpenAIで最もコストパフォーマンスが高い。品質も十分。',
      estimatedCost: calculateCost('gpt-4o-mini', 'openai', estimate).costInYen,
      quality: 'very_good',
      speed: 'very_fast'
    });
  } else if (priority === 'quality') {
    // 品質優先
    recommendations.push({
      model: 'claude-3.5-sonnet',
      provider: 'anthropic',
      reason: '最高レベルの分析能力。複雑な議論でも深い洞察を提供。',
      estimatedCost: calculateCost('claude-3.5-sonnet', 'anthropic', estimate).costInYen,
      quality: 'excellent',
      speed: 'fast'
    });
    
    recommendations.push({
      model: 'gpt-4o',
      provider: 'openai',
      reason: '高品質な分析と良好な速度のバランス。',
      estimatedCost: calculateCost('gpt-4o', 'openai', estimate).costInYen,
      quality: 'excellent',
      speed: 'fast'
    });
  } else {
    // バランス重視
    if (complexityLevel === 'high') {
      recommendations.push({
        model: 'claude-3.5-sonnet',
        provider: 'anthropic',
        reason: '複雑な議論に最適。品質とコストのバランスが良い。',
        estimatedCost: calculateCost('claude-3.5-sonnet', 'anthropic', estimate).costInYen,
        quality: 'excellent',
        speed: 'fast'
      });
      
      recommendations.push({
        model: 'gemini-1.5-pro',
        provider: 'google',
        reason: '200万トークンの超長文対応。価格も手頃。',
        estimatedCost: calculateCost('gemini-1.5-pro', 'google', estimate).costInYen,
        quality: 'excellent',
        speed: 'fast'
      });
    } else {
      recommendations.push({
        model: 'gemini-2.0-flash',
        provider: 'google',
        reason: '最新モデル。低コストで高品質、長文対応。',
        estimatedCost: calculateCost('gemini-2.0-flash', 'google', estimate).costInYen,
        quality: 'very_good',
        speed: 'very_fast'
      });
      
      recommendations.push({
        model: 'gpt-4o-mini',
        provider: 'openai',
        reason: '安定性重視ならOpenAI。低コストで高品質。',
        estimatedCost: calculateCost('gpt-4o-mini', 'openai', estimate).costInYen,
        quality: 'very_good',
        speed: 'very_fast'
      });
    }
  }
  
  return recommendations;
}

/**
 * コスト比較レポート生成
 */
export function generateCostComparisonReport(): string {
  const estimate = estimateDiscussionTokens();
  const models = [
    { name: 'gemini-1.5-flash-8b', provider: 'google' as const },
    { name: 'gemini-1.5-flash', provider: 'google' as const },
    { name: 'gemini-2.0-flash', provider: 'google' as const },
    { name: 'gemini-1.5-pro', provider: 'google' as const },
    { name: 'gpt-3.5-turbo', provider: 'openai' as const },
    { name: 'gpt-4o-mini', provider: 'openai' as const },
    { name: 'gpt-4o', provider: 'openai' as const },
    { name: 'claude-3-haiku', provider: 'anthropic' as const },
    { name: 'claude-3.5-sonnet', provider: 'anthropic' as const }
  ];
  
  let report = `## AIディスカッションAPIコスト比較分析\n\n`;
  report += `### 前提条件\n`;
  report += `- エージェント数: ${estimate.agents}人\n`;
  report += `- ディスカッションラウンド: ${estimate.rounds}回\n`;
  report += `- 総入力トークン: ${estimate.totalInputTokens.toLocaleString()}\n`;
  report += `- 総出力トークン: ${estimate.totalOutputTokens.toLocaleString()}\n\n`;
  
  report += `### モデル別コスト比較\n\n`;
  report += `| モデル | プロバイダー | 1回コスト(円) | 品質 | 速度 | 推奨用途 |\n`;
  report += `|--------|------------|--------------|------|------|----------|\n`;
  
  models.forEach(({ name, provider }) => {
    const cost = calculateCost(name, provider, estimate);
    const info = API_PRICING[provider][name];
    report += `| ${name} | ${provider} | ¥${cost.costInYen.toFixed(2)} | ${info.quality} | ${info.speed} | `;
    
    if (name === 'gemini-1.5-flash-8b') {
      report += '低コスト重視 |';
    } else if (name === 'gemini-1.5-flash' || name === 'gemini-2.0-flash') {
      report += 'コストと長文処理重視 |';
    } else if (name === 'gemini-1.5-pro') {
      report += '超長文の複雑な議論 |';
    } else if (name === 'gpt-4o-mini') {
      report += '通常のビジネス議論 |';
    } else if (name === 'claude-3.5-sonnet') {
      report += '複雑な戦略議論 |';
    } else if (name === 'gpt-3.5-turbo' || name === 'claude-3-haiku') {
      report += 'シンプルな議論 |';
    } else {
      report += '高度な分析が必要な場合 |';
    }
    report += '\n';
  });
  
  report += `\n### 推奨構成\n\n`;
  report += `1. **超低コスト重視**: Gemini-1.5-flash-8b (¥${calculateCost('gemini-1.5-flash-8b', 'google', estimate).costInYen.toFixed(2)}/回)\n`;
  report += `2. **コストパフォーマンス**: Gemini-2.0-flash (¥${calculateCost('gemini-2.0-flash', 'google', estimate).costInYen.toFixed(2)}/回)\n`;
  report += `3. **品質重視**: Claude-3.5-sonnet (¥${calculateCost('claude-3.5-sonnet', 'anthropic', estimate).costInYen.toFixed(2)}/回)\n`;
  report += `4. **バランス型**: 通常はGemini-2.0-flash、重要な議論はClaude-3.5-sonnet\n`;
  
  report += `\n### コスト削減のポイント\n\n`;
  report += `- Gemini-1.5-flash-8bは他モデルの**1/10以下**のコスト\n`;
  report += `- Geminiシリーズは100万〜200万トークンの長文対応で履歴管理が効率的\n`;
  report += `- 初期テストはGeminiで行い、本番はClaude/GPT-4oという使い分けも有効\n`;
  
  return report;
}