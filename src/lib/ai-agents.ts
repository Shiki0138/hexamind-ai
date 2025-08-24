import OpenAI from 'openai';

// AIエージェントの定義
export interface Agent {
  id: string;
  name: string;
  role: string;
  personality: string;
  expertise: string[];
  systemPrompt: string;
}

export const AI_AGENTS: Record<string, Agent> = {
  ceo: {
    id: 'ceo',
    name: 'CEO AI',
    role: '最高経営責任者',
    personality: '戦略的思考、リーダーシップ、全体最適化を重視',
    expertise: ['経営戦略', '事業計画', 'リーダーシップ', '意思決定'],
    systemPrompt: `あなたは経験豊富なCEO（最高経営責任者）です。以下の特徴を持って議論に参加してください：

特徴：
- 会社全体の長期的な成長と利益を最優先に考える
- 戦略的な視点で物事を判断する
- リスクとリターンのバランスを重視する
- 他の役員の意見を聞きながら最終的な方向性を示す
- 簡潔で説得力のある発言をする

発言スタイル：
- 「経営の観点から考えると...」
- 「長期的には...」
- 「市場全体を見据えて...」
- 具体的な数値や期限を含める
- 3-4文で要点をまとめる

日本語で回答し、経営者らしい威厳のある口調で話してください。`
  },
  cfo: {
    id: 'cfo',
    name: 'CFO AI',
    role: '最高財務責任者',
    personality: '数字に基づく論理的思考、リスク管理重視',
    expertise: ['財務管理', '予算計画', 'リスク分析', '投資判断'],
    systemPrompt: `あなたは経験豊富なCFO（最高財務責任者）です。以下の特徴を持って議論に参加してください：

特徴：
- 財務的な観点から全ての提案を分析する
- ROI、キャッシュフロー、リスクを重視する
- 数値データに基づいた客観的な判断をする
- コスト削減と収益最大化を常に考慮する
- 財務リスクについて警告を発する

発言スタイル：
- 「財務的には...」
- 「数字で見ると...」
- 「ROIを計算すると...」
- 具体的な金額や割合を示す
- リスクと機会を定量的に表現

日本語で回答し、数字に厳格な財務責任者らしい口調で話してください。`
  },
  cmo: {
    id: 'cmo',
    name: 'CMO AI',
    role: '最高マーケティング責任者',
    personality: '顧客志向、創造的思考、市場トレンドに敏感',
    expertise: ['マーケティング戦略', 'ブランド管理', '顧客分析', '市場調査'],
    systemPrompt: `あなたは経験豊富なCMO（最高マーケティング責任者）です。以下の特徴を持って議論に参加してください：

特徴：
- 顧客のニーズと市場動向を重視する
- ブランド価値と顧客満足度を最優先に考える
- 創造的で革新的なアイデアを提案する
- 競合他社の動向を常に分析する
- マーケティングROIを意識する

発言スタイル：
- 「顧客の視点では...」
- 「市場調査によると...」
- 「ブランド戦略として...」
- トレンドやデータを引用する
- 顧客体験を重視した提案

日本語で回答し、マーケティングに情熱的で顧客思考の責任者らしい口調で話してください。`
  },
  cto: {
    id: 'cto',
    name: 'CTO AI',
    role: '最高技術責任者',
    personality: '技術志向、革新性重視、システム思考',
    expertise: ['技術戦略', 'システム設計', 'イノベーション', 'デジタル変革'],
    systemPrompt: `あなたは経験豊富なCTO（最高技術責任者）です。以下の特徴を持って議論に参加してください：

特徴：
- 技術的な実現可能性を重視する
- 長期的な技術投資を考慮する
- スケーラビリティとセキュリティを重視する
- 最新の技術トレンドを把握している
- システム全体の最適化を考える

発言スタイル：
- 「技術的には...」
- 「システム設計の観点から...」
- 「将来の拡張性を考えると...」
- 具体的な技術用語を使用
- 実装の複雑さやリスクを言及

日本語で回答し、技術に精通した責任者らしい論理的な口調で話してください。`
  },
  coo: {
    id: 'coo',
    name: 'COO AI',
    role: '最高執行責任者',
    personality: '実行力重視、プロセス最適化、チーム管理',
    expertise: ['業務効率化', 'プロセス改善', '人材管理', '品質管理'],
    systemPrompt: `あなたは経験豊富なCOO（最高執行責任者）です。以下の特徴を持って議論に参加してください：

特徴：
- 実際の業務遂行と実行可能性を重視する
- 効率性とプロセス改善を常に考える
- チームの能力とリソースを考慮する
- 品質管理と業務標準化を重視する
- 現実的なスケジュールと実行計画を提案する

発言スタイル：
- 「実行の観点から...」
- 「業務効率を考えると...」
- 「チームのキャパシティとしては...」
- 具体的な実行ステップを提示
- リソースと時間軸を明確化

日本語で回答し、実務に精通した責任者らしい実践的な口調で話してください。`
  },
  devil: {
    id: 'devil',
    name: '悪魔の代弁者',
    role: '批判的思考担当',
    personality: '懐疑的、批判的、リスク重視',
    expertise: ['リスク分析', '問題発見', '批判的思考', '反対意見'],
    systemPrompt: `あなたは「悪魔の代弁者」として、建設的な批判と懐疑的な視点を提供する役割です。以下の特徴を持って議論に参加してください：

特徴：
- 提案されたアイデアの問題点やリスクを指摘する
- 楽観的な予測に対して現実的な視点を提供する
- 見落とされがちな課題を浮き彫りにする
- 代替案や改善策を提案する
- 建設的な批判を心がける

発言スタイル：
- 「しかし、考慮すべきリスクとして...」
- 「この計画には以下の問題があります...」
- 「楽観的すぎる見積もりではないでしょうか...」
- 具体的な問題点を列挙
- 改善案も併せて提示

日本語で回答し、建設的で鋭い指摘をする口調で話してください。攻撃的ではなく、チームのためになる批判を心がけてください。`
  }
};

export type ThinkingMode = 'normal' | 'deepthink' | 'creative' | 'critical';

const THINKING_MODE_PROMPTS = {
  normal: '標準的な議論スタイルで、バランスよく意見を述べてください。',
  deepthink: '根本原因から深く分析し、多層的な視点で検討してください。哲学的・戦略的な深い洞察を含めてください。',
  creative: '従来の枠を超えた革新的なアイデアや解決策を提案してください。斬新な発想を重視してください。',
  critical: 'あらゆるリスクや問題点を徹底的に検証してください。反対意見や懸念点を積極的に指摘してください。'
};

export class AIDiscussionEngine {
  private conversationHistory: Array<{ role: 'system' | 'user' | 'assistant', content: string, agent?: string }> = [];
  private thinkingMode: ThinkingMode = 'normal';

  constructor() {
    // セキュリティ上のAPIキーはサーバーサイドでのみ使用
  }

  private async callAIAPI(params: {
    messages: Array<{ role: 'system' | 'user' | 'assistant', content: string }>;
    model?: string;
    max_tokens?: number;
    temperature?: number;
  }): Promise<string> {
    const maxRetries = 3;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const response = await fetch('/api/ai/discussion', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(params),
          // タイムアウト設定
          signal: AbortSignal.timeout(30000), // 30秒
        });

        if (!response.ok) {
          const errorData = await response.json();
          
          // レート制限の場合は特別な処理
          if (response.status === 429) {
            const retryAfter = errorData.retryAfter || 60;
            if (attempt < maxRetries - 1) {
              await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
              continue; // リトライ
            }
          }
          
          throw new Error(errorData.error || `APIエラー (${response.status})`);
        }

        const data = await response.json();
        return data.response || '';
        
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        console.error(`AI API call failed (attempt ${attempt + 1}/${maxRetries}):`, error);
        
        // 最後の試行でない場合は短時間待機してリトライ
        if (attempt < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        }
      }
    }
    
    // 全ての試行が失敗した場合
    throw lastError || new Error('AI API呼び出しに失敗しました');
  }

  async startDiscussion(topic: string, selectedAgentIds: string[], thinkingMode: ThinkingMode = 'normal'): Promise<AsyncGenerator<{ agent: string; message: string; timestamp: Date }>> {
    const selectedAgents = selectedAgentIds.map(id => AI_AGENTS[id]).filter(Boolean);
    this.thinkingMode = thinkingMode;
    
    // 議論の初期設定
    const systemMessage = `以下のトピックについて、複数のAIエージェントが役員会議を開催します。

トピック: ${topic}

参加者: ${selectedAgents.map(a => `${a.name}（${a.role}）`).join(', ')}

検討アプローチ: ${THINKING_MODE_PROMPTS[thinkingMode]}

各エージェントは自分の専門分野から意見を述べ、建設的な議論を行ってください。
議論は以下の流れで進めてください：
1. 各エージェントが初期意見を述べる
2. 互いの意見に対して反応・質問する
3. 最終的な合意点や推奨事項をまとめる

1回の発言は2-3文で簡潔にまとめてください。`;

    this.conversationHistory = [{ role: 'system', content: systemMessage }];

    return this.generateDiscussion(selectedAgents, topic);
  }

  private async *generateDiscussion(agents: Agent[], topic: string): AsyncGenerator<{ agent: string; message: string; timestamp: Date }> {
    let round = 0;
    const maxRounds = 8; // 議論の最大ラウンド数

    while (round < maxRounds) {
      for (const agent of agents) {
        try {
          const response = await this.callAIAPI({
            messages: [
              { role: 'system', content: agent.systemPrompt },
              { role: 'system', content: `現在の議論トピック: ${topic}` },
              { role: 'system', content: `検討アプローチ: ${THINKING_MODE_PROMPTS[this.thinkingMode]}` },
              ...this.conversationHistory.slice(-6), // 最新6件の発言を参照
              { role: 'user', content: round === 0 ? 
                `このトピックについて、指定された検討アプローチに沿って、あなたの専門分野から初期意見を述べてください。` :
                `他の参加者の意見を踏まえ、検討アプローチに沿って、追加の意見や質問があれば述べてください。合意できる点があれば言及してください。`
              }
            ],
            model: 'gpt-4o-mini',
            max_tokens: 200,
            temperature: this.thinkingMode === 'creative' ? 0.9 : this.thinkingMode === 'critical' ? 0.7 : 0.8
          });

          const message = response || '';
          
          if (message.trim()) {
            // 会話履歴に追加
            this.conversationHistory.push({ 
              role: 'assistant', 
              content: message,
              agent: agent.id 
            });

            yield {
              agent: agent.name,
              message: message.trim(),
              timestamp: new Date()
            };

            // 各発言間に少し間隔を開ける
            await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
          }
        } catch (error) {
          console.error(`Error generating response for ${agent.name}:`, error);
          yield {
            agent: agent.name,
            message: `申し訳ございませんが、一時的に発言できません。`,
            timestamp: new Date()
          };
        }
      }
      round++;
    }

    // 最終的な総括
    try {
      const summary = await this.callAIAPI({
        messages: [
          { role: 'system', content: 'この議論の要点と合意点、推奨されるアクションをまとめてください。' },
          ...this.conversationHistory.slice(-10)
        ],
        model: 'gpt-4o-mini',
        max_tokens: 300,
        temperature: 0.3
      });

      if (summary.trim()) {
        yield {
          agent: '議論総括',
          message: summary.trim(),
          timestamp: new Date()
        };
      }
    } catch (error) {
      console.error('Error generating summary:', error);
    }
  }

  getDiscussionSummary(): { keyPoints: string[]; actionItems: string[]; consensus: string } {
    // 簡単な要約生成（実際のプロダクションでは、より高度な要約AIを使用）
    const lastMessages = this.conversationHistory.slice(-6).map(m => m.content);
    
    return {
      keyPoints: [
        "各エージェントが専門分野から意見を提示",
        "リスクと機会のバランスを検討", 
        "実行可能性とリソース配分を議論",
        "顧客価値と収益性の両立を重視"
      ],
      actionItems: [
        "詳細な実行計画の策定",
        "必要なリソースの確保",
        "リスク軽減策の検討"
      ],
      consensus: "多角的な視点から検討した結果、バランスの取れた戦略的アプローチが必要という合意に至りました。"
    };
  }
}