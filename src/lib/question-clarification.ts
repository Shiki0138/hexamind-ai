/**
 * 質問意図確認機能
 * CEOが質問の意図を確認し、より明確な情報を得るためのシステム
 */

// AI API呼び出し用の関数
async function callAIAPI(messages: Array<{ role: 'system' | 'user' | 'assistant', content: string }>): Promise<string> {
  // Generate unique request ID
  const requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  const response = await fetch('/api/ai/discussion', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Request-Id': requestId, // Add request ID header
    },
  body: JSON.stringify({
    messages,
    model: 'gpt-4o-mini',
    temperature: 0.7,
    max_tokens: 500
  }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || `API error: ${response.status}`);
  }

  const data = await response.json();
  return data.response || '';
}

export interface ClarificationResult {
  needsClarification: boolean;
  clarificationQuestion?: string;
  suggestedAspects?: string[];
}

export interface ClarificationContext {
  originalQuestion: string;
  clarificationQuestion: string;
  userResponse: string;
}

/**
 * 質問の明確化が必要かどうかを判断し、必要であれば確認質問を生成
 */
export async function analyzeQuestionClarity(
  question: string
): Promise<ClarificationResult> {
  const systemPrompt = `あなたはMcKinseyシニアパートナーレベルの経験を持つ世界的CEOです。
世界トップレベルの意思決定を行うために、質問の明確性を最高水準で分析します。

【必須確認事項】
1. **定量的目標**：数値目標、KPI、期限が明確か
2. **市場定義**：地理的範囲、セグメント、TAM/SAM/SOM
3. **財務制約**：予算上限、投資回収期間、ハードルレート
4. **リスク許容度**：リスクプロファイル、最大許容損失
5. **競争環境**：競合他社、市場シェア、差別化要因
6. **時間軸**：短期/中期/長期の明確化
7. **成功指標**：GO/NO-GO判断基準

【判断基準】
- 上記3つ以上が不明確→明確化必須
- 抽象的表現が50%以上→明確化必須
- ROI計算不可→明確化必須

JSONフォーマットで返答してください：
{
  "needsClarification": true/false,
  "clarificationQuestion": "世界水準のMECEな確認質問",
  "suggestedAspects": ["定量的目標", "市場定義", "財務制約"...]
}`;

  const messages = [
    {
      role: 'system' as const,
      content: systemPrompt
    },
    {
      role: 'user' as const,
      content: `次の質問をMcKinsey基準で分析してください：「${question}」`
    }
  ];

  try {
    const response = await callAIAPI(messages);
    const result = JSON.parse(response);
    
    return {
      needsClarification: result.needsClarification || false,
      clarificationQuestion: result.clarificationQuestion,
      suggestedAspects: result.suggestedAspects || []
    };
  } catch (error) {
    console.error('質問分析エラー:', error);
    // エラー時は確認なしで進む
    return { needsClarification: false };
  }
}

/**
 * 確認質問への回答を含めた拡張質問を生成
 */
export function createEnhancedQuestion(
  context: ClarificationContext
): string {
  return `【質問】${context.originalQuestion}

【背景・詳細情報】
CEOからの確認: ${context.clarificationQuestion}
回答: ${context.userResponse}

上記の背景情報を踏まえて、この質問について議論してください。`;
}

/**
 * 議論用のシステムプロンプトを生成（確認情報を含む）
 */
export function createDiscussionPromptWithContext(
  topic: string,
  context?: ClarificationContext
): string {
  if (!context) {
    // コンテキストがない場合でも基本的な明確化を促す
    return `議題: ${topic}

【議論の前提条件】
※ 以下の点が不明確な場合は、合理的な仮定を置いて議論を進め、その仮定を明示してください:
- 地理的範囲（グローバル/特定市場）
- 時間軸（1年/3年/5年）
- 予算制約
- ターゲットセグメント
- 成功指標の優先順位`;
  }

  return `議題: ${topic}

【明確化された文脈情報】
1. 当初の質問: ${context.originalQuestion}
2. CEOからの確認事項: ${context.clarificationQuestion}
3. 提供された追加情報: ${context.userResponse}

【議論の方針】
- 上記の明確化情報に基づいた具体的な分析
- 定量的データに基づくROI計算
- リスクと機会の定量評価
- 実行可能なアクションプラン`;
}
