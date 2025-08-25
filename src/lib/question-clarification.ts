/**
 * 質問意図確認機能
 * CEOが質問の意図を確認し、より明確な情報を得るためのシステム
 */

// AI API呼び出し用の関数
async function callAIAPI(messages: Array<{ role: 'system' | 'user' | 'assistant', content: string }>): Promise<string> {
  const response = await fetch('/api/ai/discussion', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
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
  const systemPrompt = `あなたは経験豊富なCEOで、質問の意図を正確に理解することを重視しています。
ユーザーの質問を分析し、以下の基準で判断してください：

1. 質問が曖昧または抽象的すぎる
2. 重要な前提条件や文脈が不明
3. 複数の解釈が可能
4. 具体的な目標や成果が不明確

JSONフォーマットで返答してください：
{
  "needsClarification": true/false,
  "clarificationQuestion": "確認質問（needsClarificationがtrueの場合）",
  "suggestedAspects": ["確認すべき観点1", "確認すべき観点2", ...]
}`;

  const messages = [
    {
      role: 'system' as const,
      content: systemPrompt
    },
    {
      role: 'user' as const,
      content: `次の質問を分析してください：「${question}」`
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
    return topic;
  }

  return `議題: ${topic}

重要な文脈情報:
- 当初の質問: ${context.originalQuestion}
- 明確化のための確認: ${context.clarificationQuestion}
- 提供された追加情報: ${context.userResponse}

この追加情報を考慮して、より具体的で実用的な議論を行ってください。`;
}
