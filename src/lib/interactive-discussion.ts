/**
 * インタラクティブなディスカッションを実現するためのシステム
 * 各エージェントが前の発言を具体的に引用・分析・反論する
 */

export interface DiscussionPoint {
  speaker: string;
  claim: string;
  evidence: string[];
  assumptions: string[];
  metrics: Record<string, number>;
}

export interface DiscussionResponse {
  agreements: {
    point: string;
    additionalEvidence: string;
  }[];
  disagreements: {
    point: string;
    counterEvidence: string;
    alternativeView: string;
  }[];
  newPerspectives: {
    angle: string;
    implication: string;
    evidence: string;
  }[];
}

/**
 * 前の発言から具体的なポイントを抽出
 */
export function extractDiscussionPoints(message: string): DiscussionPoint[] {
  const points: DiscussionPoint[] = [];
  
  // 数値を含む主張を抽出
  const numericClaims = message.match(/([^。]*\d+[^。]*)/g) || [];
  
  // 「べき」「必要」「重要」を含む主張を抽出
  const imperativeClaims = message.match(/([^。]*(べき|必要|重要)[^。]*)/g) || [];
  
  // リスクや課題の指摘を抽出
  const riskClaims = message.match(/([^。]*(リスク|課題|懸念|問題)[^。]*)/g) || [];
  
  return points;
}

/**
 * インタラクティブな応答を生成するためのプロンプト
 */
export function generateInteractiveResponsePrompt(
  currentAgent: string,
  previousMessage: string,
  previousSpeaker: string
): string {
  return `【インタラクティブディスカッション要件】

前の発言者（${previousSpeaker}）の発言を詳細に分析し、以下の構造で応答してください：

## 1. 同意できる点（最低1つ、最大3つ）
前の発言から具体的な数値や主張を引用し、それを支持する追加のデータや根拠を提示：
- 「${previousSpeaker}が指摘した[具体的な数値/主張]について、私も[追加データ]から同様の傾向を確認しています」
- 引用する数値や主張は必ず原文のまま正確に引用
- 追加の定量的データで補強（出典明記）

## 2. 異なる見解・懸念点（最低1つ、最大3つ）
建設的な反論や代替案を、ファクトベースで提示：
- 「${previousSpeaker}の[具体的な主張]には一理ありますが、[別のデータ/観点]を考慮すると...」
- 反対意見には必ず代替案や解決策を付加
- 感情的でなく、データに基づいた論理的な反論

## 3. 新たな視点・追加分析（最低1つ）
議論を深めるための新しい角度や、見落とされている要因を提示：
- あなたの専門性から見た独自の分析
- 他のエージェントが言及していない重要な要因
- 定量的なシナリオ分析や感度分析

## 4. 具体的な質問（1-2個）
議論を深めるための、他のエージェントへの具体的な質問：
- 「${previousSpeaker}の分析で、もし[条件]が変わった場合、どの程度影響があるでしょうか？」
- 数値や条件を明確にした、答えやすい質問

【必須ルール】
- 抽象的な同意（「素晴らしい分析です」等）は禁止
- 必ず前の発言から具体的な部分を引用
- すべての主張にデータや根拠を付加
- 建設的で前向きな議論を心がける`;
}

/**
 * ディスカッションの質を評価
 */
export function evaluateDiscussionQuality(message: string): {
  hasSpecificReferences: boolean;
  hasQuantitativeData: boolean;
  hasCounterarguments: boolean;
  hasNewPerspectives: boolean;
  interactivityScore: number;
} {
  const hasSpecificReferences = /「.*」|『.*』/.test(message);
  const hasQuantitativeData = /\d+[%％円ドル万億]|\d+年|\d+ヶ月/.test(message);
  const hasCounterarguments = /(しかし|一方|ただし|懸念|リスク)/.test(message);
  const hasNewPerspectives = /(新たに|さらに|加えて|別の視点)/.test(message);
  
  const interactivityScore = 
    (hasSpecificReferences ? 25 : 0) +
    (hasQuantitativeData ? 25 : 0) +
    (hasCounterarguments ? 25 : 0) +
    (hasNewPerspectives ? 25 : 0);
  
  return {
    hasSpecificReferences,
    hasQuantitativeData,
    hasCounterarguments,
    hasNewPerspectives,
    interactivityScore
  };
}

/**
 * ディスカッションフローの管理
 */
export class DiscussionFlowManager {
  private discussionHistory: Map<string, DiscussionPoint[]> = new Map();
  private unaddressedPoints: Set<string> = new Set();
  
  addDiscussionPoint(agent: string, point: DiscussionPoint) {
    const points = this.discussionHistory.get(agent) || [];
    points.push(point);
    this.discussionHistory.set(agent, points);
    this.unaddressedPoints.add(JSON.stringify(point));
  }
  
  markPointAddressed(point: string) {
    this.unaddressedPoints.delete(point);
  }
  
  getUnaddressedPoints(): string[] {
    return Array.from(this.unaddressedPoints);
  }
  
  getSuggestedFocus(): string {
    if (this.unaddressedPoints.size > 0) {
      const point = Array.from(this.unaddressedPoints)[0];
      return `未検討の重要ポイント: ${point}`;
    }
    return '';
  }
}

/**
 * エージェント間の相互作用パターン
 */
export const INTERACTION_PATTERNS = {
  'CEO-CFO': {
    topics: ['投資判断', 'ROI', '資金調達'],
    questions: [
      'この戦略のNPVとIRRはどの程度見込めますか？',
      '必要な初期投資と運転資金の詳細を教えてください。',
      'ブレークイーブンまでの期間とキャッシュフローの見通しは？'
    ]
  },
  'CFO-CMO': {
    topics: ['マーケティングROI', 'CAC/LTV'],
    questions: [
      'マーケティング投資のペイバック期間はどの程度を想定していますか？',
      'チャネル別のCAC目標と実現可能性について教えてください。',
      'LTV向上のための具体的施策とその投資対効果は？'
    ]
  },
  'CMO-CTO': {
    topics: ['デジタルマーケティング', 'データ分析'],
    questions: [
      'マーケティング自動化のための技術要件と投資額は？',
      '顧客データ分析のインフラ構築にかかる期間は？',
      'A/Bテストのための技術的な制約はありますか？'
    ]
  },
  'CTO-COO': {
    topics: ['システム実装', 'オペレーション効率'],
    questions: [
      'システム導入によるオペレーション効率化の定量的効果は？',
      '既存システムとの統合にかかる工数とリスクは？',
      'スケーラビリティの観点から、どの程度の成長に対応可能ですか？'
    ]
  },
  'COO-リサーチャー': {
    topics: ['ベストプラクティス', '業界標準'],
    questions: [
      '業界のオペレーション効率のベンチマークデータはありますか？',
      '競合他社の成功事例で参考になるものは？',
      'この業界特有のオペレーション上の課題は何ですか？'
    ]
  },
  '悪魔の代弁者-全員': {
    topics: ['リスク検証', '前提条件の妥当性'],
    questions: [
      'その楽観的な予測の前提条件は現実的ですか？',
      '最悪のシナリオではどの程度の損失が想定されますか？',
      '競合が同様の戦略を取った場合の影響は考慮していますか？'
    ]
  }
};