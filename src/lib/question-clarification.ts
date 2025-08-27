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
質問の明確性を最高水準で分析し、曖昧な質問は必ず明確化を要求します。

【必須確認事項】
1. **ビジネスモデル**：収益源、価値提案、ターゲット顧客が明確か
2. **定量的目標**：数値目標、KPI、期限が明確か
3. **市場定義**：地理的範囲、セグメント、競合環境
4. **財務制約**：予算上限、投資回収期間、収益目標
5. **リスク許容度**：リスクプロファイル、最大許容損失
6. **時間軸**：短期/中期/長期の明確化
7. **現状把握**：現在の状況、リソース、制約条件
8. **成功指標**：GO/NO-GO判断基準

【厳格な判断基準】
- ビジネスモデルが不明確→必ず明確化
- 上記2つ以上が不明確→明確化必須  
- 「どちらがいいか」「どうすべきか」等の選択肢が不明→明確化必須
- 業界・製品・サービスが特定されていない→明確化必須
- ROI計算に必要な情報が不足→明確化必須

JSONフォーマットで返答してください：
{
  "needsClarification": true/false,
  "clarificationQuestion": "MECE原則に基づく具体的な確認質問",
  "suggestedAspects": ["ビジネスモデル", "定量的目標", "市場定義"...]
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

【重要】この議題について正確な理解に基づいて議論を行ってください。

【議論の前提条件】
※ 以下の点が不明確な場合は、推測ではなく明確化質問を通じて確認してください:
- 現在のビジネス状況と課題
- 具体的な目標と期限
- 地理的範囲・市場セグメント
- 予算制約・投資可能額
- ターゲット顧客・収益モデル
- 成功指標の優先順位

【禁止事項】
- 過去の類似事例や他社事例の参照
- 質問内容に含まれていない業界・製品の推測
- 一般論での回答

まずは質問内容を正確に理解し、不明確な点があれば確認してから具体的な分析を行ってください。`;
  }

  return `議題: ${topic}

【明確化済み文脈情報】
▼ 元の質問: ${context.originalQuestion}

▼ 確認された詳細情報:
質問: ${context.clarificationQuestion}
回答: ${context.userResponse}

【議論指針】
1. 上記の明確化情報に基づく具体的分析
2. 提供された情報の範囲内での定量的評価
3. 明確化された条件下でのリスク・機会評価
4. 実行可能で具体的なアクションプラン策定

【重要】推測に基づく分析は避け、提供された情報に基づいて議論を行ってください。`;
}
