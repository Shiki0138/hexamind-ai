/**
 * ディスカッションオーケストレーター
 * 人間のような自然な議論の流れを作り出す
 */

import { Agent } from './ai-agents';
import { ENHANCED_AGENT_BEHAVIORS, DISCUSSION_PHASE_GUIDELINES, INTERACTION_QUESTIONS } from './enhanced-prompts';

export interface DiscussionContext {
  topic: string;
  phase: 'initial' | 'divergence' | 'convergence' | 'synthesis';
  round: number;
  keyPoints: Map<string, string[]>;
  agreements: string[];
  disagreements: string[];
  actionItems: string[];
}

export class DiscussionOrchestrator {
  private context: DiscussionContext;
  private speakerHistory: string[] = [];
  private topicEvolution: string[] = [];

  constructor(topic: string) {
    this.context = {
      topic,
      phase: 'initial',
      round: 0,
      keyPoints: new Map(),
      agreements: [],
      disagreements: [],
      actionItems: []
    };
  }

  /**
   * 次に発言すべきエージェントを動的に選択
   */
  selectNextSpeaker(agents: Agent[], lastSpeaker: string, lastMessage: string): Agent {
    // 同じ人が連続で話さない
    const availableAgents = agents.filter(a => a.name !== lastSpeaker);
    
    // 発言内容に基づいて最も関連性の高いエージェントを選択
    const relevanceScores = new Map<string, number>();
    
    for (const agent of availableAgents) {
      let score = 0;
      
      // 財務の話題が出たらCFOの優先度を上げる
      if (lastMessage.includes('投資') || lastMessage.includes('ROI') || lastMessage.includes('財務')) {
        if (agent.name === 'CFO AI') score += 3;
      }
      
      // 技術の話題が出たらCTOの優先度を上げる
      if (lastMessage.includes('AI') || lastMessage.includes('技術') || lastMessage.includes('システム')) {
        if (agent.name === 'CTO AI') score += 3;
      }
      
      // マーケティングの話題が出たらCMOの優先度を上げる
      if (lastMessage.includes('顧客') || lastMessage.includes('市場') || lastMessage.includes('ブランド')) {
        if (agent.name === 'CMO AI') score += 3;
      }
      
      // 批判や懸念が少ない場合は悪魔の代弁者の優先度を上げる
      if (!lastMessage.includes('リスク') && !lastMessage.includes('懸念') && !lastMessage.includes('しかし')) {
        if (agent.name === '悪魔の代弁者') score += 2;
      }
      
      // 最近発言していないエージェントの優先度を上げる
      const lastSpokeIndex = this.speakerHistory.lastIndexOf(agent.name);
      if (lastSpokeIndex === -1) score += 2;
      else score += Math.min(2, (this.speakerHistory.length - lastSpokeIndex) / 3);
      
      relevanceScores.set(agent.name, score);
    }
    
    // 最も高いスコアのエージェントを選択（同点の場合はランダム）
    const maxScore = Math.max(...relevanceScores.values());
    const topAgents = availableAgents.filter(a => relevanceScores.get(a.name) === maxScore);
    const selected = topAgents[Math.floor(Math.random() * topAgents.length)];
    
    this.speakerHistory.push(selected.name);
    return selected;
  }

  /**
   * 議論のフェーズを更新
   */
  updatePhase(): void {
    const totalSpeaks = this.speakerHistory.length;
    
    // 大幅に短縮（6人で合計10-12発言程度）
    if (totalSpeaks <= 6) {
      this.context.phase = 'initial';      // 各エージェント1回
    } else if (totalSpeaks <= 9) {
      this.context.phase = 'convergence';  // 3回追加発言で収束
    } else {
      this.context.phase = 'synthesis';    // 結論フェーズ
    }
  }

  /**
   * エージェント用の強化されたプロンプトを生成
   */
  generateEnhancedPrompt(agent: Agent, lastMessages: any[]): string {
    const behavior = ENHANCED_AGENT_BEHAVIORS[agent.name];
    if (!behavior) return '';

    const phaseGuideline = DISCUSSION_PHASE_GUIDELINES[this.context.phase] || DISCUSSION_PHASE_GUIDELINES.initial;
    
    // 最後の3つの発言から文脈を理解
    const recentContext = lastMessages.slice(-3).map(msg => {
      const speaker = this.extractSpeakerFromMessage(msg.content);
      return `${speaker}: ${this.extractKeyPoint(msg.content)}`;
    }).join('\n');

    // 相互作用を促進する質問を選択
    const questionType = this.context.phase === 'divergence' ? 'challenge' : 
                        this.context.phase === 'convergence' ? 'build' : 'clarification';
    const sampleQuestions = INTERACTION_QUESTIONS[questionType].join('\n');

    return `
${behavior.discussionStyle}

現在のフェーズ: ${this.context.phase}
${phaseGuideline}

【最近の議論の流れ】
${recentContext}

【あなたの発言スタイル例】
${behavior.argumentPatterns.slice(0, 2).join('\n')}

【活用すべき専門知識】
${behavior.specializedKnowledge.slice(0, 2).join(', ')}

【相互作用のルール】
${behavior.interactionRules.slice(0, 2).join('\n')}

【使える質問例】
${sampleQuestions}

重要: 必ず前の発言者の具体的な内容を引用し、それに対して専門的見地から反応してください。
抽象的な同意や反対ではなく、具体的な数値、事例、代替案を提示してください。`;
  }

  /**
   * メッセージから発言者を抽出
   */
  private extractSpeakerFromMessage(content: string): string {
    const match = content.match(/^【(.+?)】/);
    return match ? match[1] : 'Unknown';
  }

  /**
   * メッセージからキーポイントを抽出
   */
  private extractKeyPoint(content: string): string {
    const lines = content.split('\n').filter(line => line.trim());
    // 最初の実質的な内容を含む行を返す
    for (const line of lines) {
      if (line.length > 20 && !line.startsWith('【')) {
        return line.substring(0, 100) + '...';
      }
    }
    return lines[0] || '';
  }

  /**
   * 議論の収束度を評価
   */
  evaluateConvergence(): number {
    const totalPoints = Array.from(this.context.keyPoints.values()).flat().length;
    const agreementRatio = this.context.agreements.length / Math.max(1, totalPoints);
    return Math.min(1, agreementRatio * 1.5);
  }

  /**
   * 動的にラウンド数を決定
   */
  shouldContinueDiscussion(): boolean {
    const totalSpeaks = this.speakerHistory.length;
    const convergence = this.evaluateConvergence();
    
    // 発言回数による強制終了（6人で最大12発言）
    const maxTotalSpeaks = 12; // 最大12発言に制限
    if (totalSpeaks >= maxTotalSpeaks) return false;
    
    // 各エージェントが最低1回発言したかチェック
    const uniqueSpeakers = new Set(this.speakerHistory);
    const minSpeaksPerAgent = 6; // 全員が1回ずつ
    if (totalSpeaks < minSpeaksPerAgent) return true;
    
    // 統合フェーズでは2-3発言で終了
    if (this.context.phase === 'synthesis' && totalSpeaks >= 10) {
      return false;
    }
    
    // 適度な収束で終了
    return convergence < 0.5 && totalSpeaks < 10;
  }
}