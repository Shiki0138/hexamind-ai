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

export interface IntentScope { geo?: string; timeframe?: string }
export interface IntentConstraints { budget_jpy?: number; [k: string]: any }
export interface IntentKPI { [k: string]: number | string }
export interface Intent {
  task_type?: string;
  domain?: 'marketing' | 'legal' | 'data_analytics' | string;
  scope?: IntentScope;
  constraints?: IntentConstraints;
  kpi?: IntentKPI;
  deliverable_type?: string;
  audience?: string;
  must_include?: string[];
  must_exclude?: string[];
  assumptions?: Array<{ statement: string; confidence?: number }>;
  risk_tolerance?: 'low' | 'medium' | 'high' | string;
  acceptance_criteria?: string[];
  confidence?: number;
  missing_fields?: string[];
}

export interface ClarificationResult {
  needsClarification: boolean;
  clarificationQuestion?: string;
  suggestedAspects?: string[];
  intent?: Intent;
  clarificationQuestions?: string[];
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
  const systemPrompt = `あなたはMcKinseyシニアパートナーレベルのプロジェクトリーダーです。入力文から意図を抽出し、欠損を特定して簡潔に確認します。

【出力要件（JSON）】
{
  "needsClarification": boolean,
  "clarificationQuestion": string,
  "clarificationQuestions": string[],
  "suggestedAspects": string[],
  "intent": {
    "task_type": string,
    "domain": string,
    "scope": {"geo": string, "timeframe": string},
    "constraints": {"budget_jpy": number},
    "kpi": {"leads_per_month": number, "max_cpa_jpy": number},
    "deliverable_type": string,
    "assumptions": [{"statement": string, "confidence": number}],
    "missing_fields": string[],
    "confidence": number
  }
}

【判定ルール】
- scope.geo / constraints.budget_jpy / kpi は可能な範囲で推定し、信頼度を付与。推定はmissingから除外しない。
- 不足（missing_fields）が1つ以上→needsClarification=true。
- Clarificationは3問以内、選択式にしやすい短問を優先。`;

  const messages = [
    {
      role: 'system' as const,
      content: systemPrompt
    },
    { role: 'user' as const, content: `質問: ${question}` }
  ];

  try {
    const response = await callAIAPI(messages);
    const result = JSON.parse(response);
    const intent: Intent | undefined = result.intent;
    return {
      needsClarification: !!result.needsClarification,
      clarificationQuestion: result.clarificationQuestion,
      clarificationQuestions: result.clarificationQuestions || [],
      suggestedAspects: result.suggestedAspects || [],
      intent
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
