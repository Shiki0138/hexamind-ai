/**
 * 弁証法的ディスカッションシステム
 * テーゼ（主張）→アンチテーゼ（反論）→ジンテーゼ（統合）の流れを実現
 */

export interface DialecticalPoint {
  thesis: {
    claim: string;
    evidence: string[];
    assumptions: string[];
  };
  antithesis?: {
    counterClaim: string;
    counterEvidence: string[];
    weaknessesIdentified: string[];
  };
  synthesis?: {
    integratedView: string;
    newInsights: string[];
    actionableConclusion: string;
  };
}

/**
 * ディスカッションフェーズを管理
 */
export enum DiscussionPhase {
  THESIS = 'thesis',           // 初期主張
  ANTITHESIS = 'antithesis',   // 反論・批判
  SYNTHESIS = 'synthesis',     // 統合・発展
  DEEPENING = 'deepening'      // 深掘り
}

/**
 * エージェントの役割を動的に割り当て
 */
export interface DynamicRole {
  agent: string;
  currentRole: 'proposer' | 'challenger' | 'integrator' | 'deepener';
  focusArea: string;
}

/**
 * 弁証法的応答を生成するためのプロンプト
 */
export function generateDialecticalPrompt(
  phase: DiscussionPhase,
  previousPoints: DialecticalPoint[],
  agentRole: DynamicRole
): string {
  switch (phase) {
    case DiscussionPhase.THESIS:
      return `【テーゼ（主張）フェーズ】
あなたは「${agentRole.focusArea}」の観点から、明確な主張を提示してください：

1. **中心的主張**（1-2文で簡潔に）
   - 検証可能な形で主張を述べる
   - 定量的な目標や基準を含める

2. **根拠となるデータ**（3-5個）
   - 具体的な統計データ（出典付き）
   - 業界ベンチマーク
   - 成功事例の定量的結果

3. **前提条件**（明示的に列挙）
   - この主張が成立する条件
   - 必要なリソースや環境
   - タイムフレーム

4. **期待される成果**
   - 定量的な成果（ROI、成長率等）
   - 定性的な成果（戦略的価値等）`;

    case DiscussionPhase.ANTITHESIS:
      return `【アンチテーゼ（反論）フェーズ】
前の主張に対して、建設的な批判と代替案を提示してください：

1. **主張の弱点の特定**（具体的に引用）
   - 「${previousPoints[0]?.thesis.claim}」の問題点
   - 見落とされているリスク要因
   - 前提条件の妥当性への疑問

2. **反証データの提示**（2-3個）
   - 異なる視点からのデータ
   - 失敗事例や警戒すべき先例
   - より保守的な予測

3. **代替アプローチの提案**
   - より実現可能な方法
   - リスクを軽減する修正案
   - 段階的実施の提案

4. **建設的な統合への道筋**
   - 元の主張の良い部分
   - 改善すべき部分
   - 統合案への示唆`;

    case DiscussionPhase.SYNTHESIS:
      return `【ジンテーゼ（統合）フェーズ】
テーゼとアンチテーゼを統合し、より高次の解決策を提示してください：

1. **統合された見解**
   - 両方の視点の強みを組み合わせる
   - 矛盾を解消する新たなフレームワーク
   - Win-Winのアプローチ

2. **新たな洞察**（2-3個）
   - 議論から生まれた新しい視点
   - 予期しなかったシナジー効果
   - イノベーティブな解決策

3. **実行可能な結論**
   - 具体的なアクションプラン
   - 成功の判定基準
   - リスクヘッジ策

4. **次なる議論への発展**
   - まだ解決されていない課題
   - 更なる検討が必要な領域`;

    case DiscussionPhase.DEEPENING:
      return `【深掘りフェーズ】
これまでの議論を更に深め、実践的な洞察を提供してください：

1. **核心的な問い**
   - 議論の本質は何か
   - 真の成功要因は何か
   - 最大のボトルネックは何か

2. **実践的な検証**
   - パイロットテストの設計
   - 検証すべき仮説
   - 測定方法とKPI

3. **実装への橋渡し**
   - 具体的な第一歩
   - 必要なリソースと体制
   - タイムライン

4. **学習と適応**
   - フィードバックループの設計
   - 軌道修正の基準
   - 継続的改善の仕組み`;
  }
}

/**
 * エージェント間の動的な役割配分
 */
export function assignDynamicRoles(
  agents: string[],
  phase: DiscussionPhase,
  topic: string
): DynamicRole[] {
  const roles: DynamicRole[] = [];
  
  // フェーズに応じた役割配分のロジック
  if (phase === DiscussionPhase.THESIS) {
    // 初期提案者を選定
    roles.push({
      agent: agents[0],
      currentRole: 'proposer',
      focusArea: '戦略的価値と機会'
    });
  } else if (phase === DiscussionPhase.ANTITHESIS) {
    // 批判的検証者を選定
    roles.push({
      agent: '悪魔の代弁者',
      currentRole: 'challenger',
      focusArea: 'リスクと実現可能性'
    });
    roles.push({
      agent: 'CFO AI',
      currentRole: 'challenger',
      focusArea: '財務的妥当性'
    });
  } else if (phase === DiscussionPhase.SYNTHESIS) {
    // 統合者を選定
    roles.push({
      agent: 'CEO AI',
      currentRole: 'integrator',
      focusArea: '全体最適と戦略的判断'
    });
  }
  
  return roles;
}

/**
 * 議論の質を向上させる具体的な指示
 */
export const DISCUSSION_QUALITY_INSTRUCTIONS = `
【高品質なディスカッションのための必須要件】

1. **具体的な引用と反応**
   ❌ 悪い例：「素晴らしい分析です」
   ✅ 良い例：「CFOが指摘した『初期投資3.5億円でROI 24%』について、私の分析では市場浸透率を2%と仮定した場合、より現実的なROIは18-20%と推定されます」

2. **データドリブンな議論**
   ❌ 悪い例：「市場は大きいと思います」
   ✅ 良い例：「経産省2024年データによると、該当市場は520億円（CAGR 7.2%）で、上位3社で65%のシェアを占めています」

3. **建設的な反論**
   ❌ 悪い例：「それは楽観的すぎます」
   ✅ 良い例：「その成長予測は可能ですが、競合のA社が類似戦略で苦戦した事例（2023年Q3決算で前年比-15%）を考慮すると、より段階的なアプローチが賢明では？」

4. **相互作用の深化**
   - 前の発言者の数値や仮定を明示的に引用
   - その上で自分の専門性からの追加分析
   - 異なる角度からの検証や補強
   - 次の議論につながる具体的な問い

5. **アクショナブルな結論**
   - 議論を実行可能な提案に収束
   - 具体的な数値目標とマイルストーン
   - 成功の判定基準
   - リスクと対策のセット
`;